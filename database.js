const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('db.sqlite3');

const moment = require("moment");

const generate = require('meaningful-string');

const bcrypt = require('bcryptjs');

class AuthDatabase {

    constructor() {
        moment.locale('pt-br');
        this.initDatabase();
    }

    initDatabase() {
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
    }

    register(name, email, password) {
        let salt = bcrypt.genSaltSync(10);
        let passwordEncrypted = bcrypt.hashSync(password, salt);

        let sql = "SELECT email FROM users WHERE users.email = ?";
        return new Promise((resolve, reject) => {
            database.get(sql, email, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({ error: "alreadyRedistered" });
                }
                else { 
                    let sql = "INSERT INTO users(timestamp, name, email, password) VALUES(?,?,?,?)";
                    let data = [moment().format(), name, email, passwordEncrypted];
                    
                    database.run(sql, data, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve({ status: "success"});
                            }
                        });
                }
            });
        });
    }

    async login(email, password) {
        let result = await this.validCredentials(email, password);
        if (result.status == "success") {
            let session = await this.createSession(result.id);
            return session;
        }
        else {
            return result;
        }
    }

    validCredentials(email, password) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM users WHERE users.email = ?";
            let data = email;

            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    let passwordValid = bcrypt.compareSync(password, row.password);
                    if (passwordValid) {
                        resolve({status: "success", id: row.id});
                    }
                    else {
                        resolve({ status: "wrong" });
                    }
                }
                else {
                    resolve({ status: "notExists" })
                }
            });
        });
    }

    createSession(userId) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT token FROM sessions WHERE sessions.userId = ? AND status = 1";
            let data = userId;

            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({status: "success", token: row.token});
                }
                else {
                    let token = generate.random();
                    let sql = "INSERT INTO sessions(timestamp, token, userId, status) VALUES(?,?,?,1)";
                    let data = [moment().format(), token, userId];

                    database.run(sql, data, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve({status: "success", token: token });
                        }
                    });
                }
            });
        });
    }

    logout(token) {
        let sql = "UPDATE sessions SET status = 0 WHERE token = ?";
        let data = token;
        return new Promise((resolve, reject) => {
            database.run(sql, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ status: "success" });
                }
            });
        });
    }
}

module.exports = AuthDatabase;