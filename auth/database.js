const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('database.sqlite3');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const randtoken = require('rand-token');

class Database {

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

    async register(name, email, password){
        let result = await this.checkIfRegistered(email);
        if (result.status == "notRegistered") {
            return await this.addNewUser(name, email, password);
        }
        else {
            return result;
        }
    }

    checkIfRegistered(email) {
        return new Promise((resolve, reject) => {
            
            database.serialize(()=>{
                let sql = "SELECT TRUE FROM users WHERE users.email = ?";

                database.get(sql, email, (err, row) => {
                    let timestamp = moment().format();
                    if (err) {
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else if (row) {
                        resolve({ timestamp: timestamp, status: "alreadyRegistered" });
                    }
                    else {
                        resolve({ timestamp: timestamp, status: "notRegistered" });
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
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else {
                        resolve({ timestamp: timestamp, status: "registerSuccess" });
                    }
                });
            });   
        });
    }

    encryptPassword(password){
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    async login(email, password){
        let result = await this.validCredentials(email, password);
        if (result.status == "valid") {
            return await this.createSession(result.id);
        }
        else {
            return result;
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
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else if (row) {
                        let passwordValid = bcrypt.compareSync(password, row.password);
                        if (passwordValid) {
                            resolve({ timestamp: timestamp, status: "valid", id: row.id });
                        }
                        else {
                            resolve({ timestamp: timestamp, status: "wrong" });
                        }
                    }
                    else {
                        resolve({ timestamp: timestamp, status: "invalid" });
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
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else if (row) {
                        resolve({ timestamp: timestamp, status: "loginSuccess", token: row.token });
                    }
                    else {
                        let token = randtoken.generate(16);
                        let sql = "INSERT INTO sessions(timestamp, token, userId, status) VALUES(?,?,?,1)";
                        let data = [timestamp, token, userId];

                        database.run(sql, data, (err) => {
                            let timestamp = moment().format();
                            if (err) {
                                reject({ timestamp: timestamp, status: "error", err: err });
                            }
                            else {
                                resolve({ timestamp: timestamp, status: "loginSuccess", token: token });
                            }
                        });
                    }
                });
            });
        });
    }

    async logout(token){
        let result = await this.checkTokenStatus(token);
        if (result.status == "enable") {
            return await this.closeSession(token);
        }
        else {
            return result;
        }
    }

    checkTokenStatus(token) {
        return new Promise((resolve, reject) => {

            database.serialize(() => {
                let sql = "SELECT status FROM sessions WHERE sessions.token = ? AND sessions.status = 1";
                
                database.get(sql, token, (err, row) => {
                    let timestamp = moment().format();
                    if (err) {
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else if (row) {
                        resolve({ timestamp: timestamp, status: "enable" });
                    }
                    else {
                        resolve({ timestamp: timestamp, status: "invalidOrDisable" });
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
                        reject({ timestamp: timestamp, status: "error", err: err });
                    }
                    else {
                        resolve({ timestamp: timestamp, status: "logoutSuccess" });
                    }
                });
            });
        });
    }
}

module.exports = Database;