const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('database.sqlite3');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const randtoken = require('rand-token');
const CODE_STATUS = require('./code-status');

class AuthDatabase {

    constructor() {
        moment.locale('pt-br');
        this.startDatabase();
    }

    startDatabase() {
        database.serialize(() => {
            database.run('CREATE TABLE IF NOT EXISTS users (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,' +
                'timestamp BLOB NOT NULL,' +
                'name TEXT NOT NULL,' +
                'email TEXT NOT NULL,' +
                'password TEXT NOT NULL)');

            database.run('CREATE TABLE IF NOT EXISTS sessions (' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,' +
                'timestamp BLOB NOT NULL,' +
                'token TEXT NOT NULL,' +
                'userId TEXT NOT NULL,' +
                'status INTEGER NOT NULL,' +
                'FOREIGN KEY (userId) REFERENCES users(id))');
        });
    }

    async register(name, email, password) {
        let response = await this.checkIfRegistered(email);
        if (response.status == CODE_STATUS.REGISTER.NOT_REGISTERED) {
            return await this.addNewUser(name, email, password);
        }
        else {
            return response;
        }
    }

    checkIfRegistered(email) {
        return new Promise((resolve, reject) => {
            
            database.serialize(()=>{
                let sql = "SELECT TRUE FROM users WHERE users.email = ?";

                database.get(sql, email, (err, row) => {
                    let timestamp = moment().format();

                    if (err) {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.QUERY_ERROR,
                            err: err.message
                        };
                        reject(response);
                    }
                    else if (row) {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.REGISTER.ALREADY_REGISTERED, 
                        };
                        resolve(response);
                    }
                    else {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.REGISTER.NOT_REGISTERED, 
                        };
                        resolve(response);
                    }
                });
            });   
        });
    }

    addNewUser(name, email, password) {
        return new Promise((resolve, reject) => {

            database.serialize(() => {
                let timestamp = moment().format();
                let sql = "INSERT INTO users(timestamp, name, email, password) VALUES(?,?,?,?)";
                let data = [timestamp, name, email, this.encryptPassword(password)];

                database.run(sql, data, (err) => {
                    let timestamp = moment().format();

                    if (err) {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.QUERY_ERROR,
                            err: err.message
                        };
                        reject(response);
                    }
                    else {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.REGISTER.SUCCESS, 
                        };
                        resolve(response);
                    }
                });
            });   
        });
    }

    encryptPassword(password) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    async login(email, password) {
        let response = await this.validCredentials(email, password);
        if (response.status == CODE_STATUS.LOGIN.VALID_CREDENTIALS) {
            return await this.createSession(response.id);
        }
        else {
            return response;
        }
    }

    validCredentials(email, password) {
        return new Promise((resolve, reject) => {

            database.serialize(() => {
                let sql = "SELECT id, password FROM users WHERE users.email = ?";
                let data = email;

                database.get(sql, data, (err, row) => {
                    let timestamp = moment().format();

                    if (err) {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.QUERY_ERROR,
                            err: err.message
                        };
                        reject(response);
                    }
                    else if (row) {
                        let passwordValid = bcrypt.compareSync(password, row.password);
                        if (passwordValid) {
                            let response = {
                                timestamp: timestamp, 
                                status: CODE_STATUS.LOGIN.VALID_CREDENTIALS, 
                                id: row.id
                            };
                            resolve(response);
                        }
                        else {
                            let response = {
                                timestamp: timestamp, 
                                status: CODE_STATUS.LOGIN.INVALID_CREDENTIALS
                            };
                            resolve(response);
                        }
                    }
                    else {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.LOGIN.USER_NOT_EXISTS
                        };
                        resolve(response);
                    }
                });
            });
        });
    }

    createSession(userId) {
        return new Promise((resolve, reject) => {
            database.serialize(() => {
                let sql = "SELECT token FROM sessions WHERE sessions.userId = ? AND status = 1";

                database.get(sql, userId, (err, row) => {
                    let timestamp = moment().format();

                    if (err) {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.QUERY_ERROR,
                            err: err.message
                        };
                        reject(response);
                    }
                    else if (row) {
                        let response = { 
                            timestamp: timestamp, 
                            status: CODE_STATUS.LOGIN.SUCCESS, 
                            token: row.token 
                        };
                        resolve(response);
                    }
                    else {
                        let token = randtoken.generate(16);
                        let sql = "INSERT INTO sessions(timestamp, token, userId, status) VALUES(?,?,?,1)";
                        let data = [timestamp, token, userId];

                        database.run(sql, data, (err) => {
                            let timestamp = moment().format();

                            if (err) {
                                let response = {
                                    timestamp: timestamp,
                                    status: CODE_STATUS.QUERY_ERROR,
                                    err: err.message
                                };
                                reject(response);
                            }
                            else {
                                let response = {
                                    timestamp: timestamp,
                                    status: CODE_STATUS.LOGIN.SUCCESS,
                                    token: token
                                };
                                resolve(response);
                            }
                        });
                    }
                });
            });
        });
    }

    async logout(token) {
        let response = await this.checkTokenStatus(token);
        if (response.status == CODE_STATUS.LOGOUT.TOKEN_ENABLE) {
            return await this.closeSession(token);
        }
        else {
            return response;
        }
    }

    checkTokenStatus(token) {
        return new Promise((resolve, reject) => {

            database.serialize(() => {
                let sql = "SELECT status FROM sessions WHERE sessions.token = ? AND sessions.status = 1";
                
                database.get(sql, token, (err, row) => {
                    let timestamp = moment().format();
                    if (err) {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.QUERY_ERROR, 
                            err: err.message
                        };
                        reject(response);
                    }
                    else if (row) {
                        let response = {
                            timestamp: timestamp, 
                            status: CODE_STATUS.LOGOUT.TOKEN_ENABLE
                        };
                        resolve(response);
                    }
                    else {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.LOGOUT.INVALID_OR_DISABLE_TOKEN
                        };
                        resolve(response);
                    }
                });
            });
        });
    }

    closeSession(token) {
        return new Promise((resolve, reject) => {

            database.serialize(() => {
                let sql = "UPDATE sessions SET status = 0 WHERE token = ?";

                database.run(sql, token, (err) => {
                    let timestamp = moment().format();

                    if (err) {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.QUERY_ERROR,
                            err: err.message
                        }
                        reject(response);
                    }
                    else {
                        let response = {
                            timestamp: timestamp,
                            status: CODE_STATUS.LOGOUT.SUCCESS
                        };
                        resolve(response);
                    }
                });
            });
        });
    }
}

module.exports = AuthDatabase;