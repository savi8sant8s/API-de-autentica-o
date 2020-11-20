const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('db.sqlite3');
const moment = require("moment");
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

    createUser(name, email, password) {
        return new Promise((resolve, reject) => {
            database.run(`INSERT INTO users(timestamp, name, email, password) VALUES(?,?,?,?)`,
                [moment().format(), name, email, password], (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({ success: true });
                    }
                });
        });
    }

    isRegistered(email) {
        let sql = "SELECT * FROM users WHERE users.email=?";
        let data = email;
        return new Promise((resolve, reject) => {
            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false });
                }
            });
        })
    }

    isLogged(userId) {
        let sql = "SELECT status FROM sessions WHERE sessions.userId=? AND sessions.status == 1";
        let data = userId;
        return new Promise((resolve, reject) => {
            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false });
                }
            });
        })

    }

    isValidToken(token) {
        let sql = "SELECT token FROM sessions WHERE sessions.token=? AND sessions.status=1";
        let data = token;
        return new Promise((resolve, reject) => {
            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false });
                }
            });
        });
    }

    createAndStartSession(userId, token) {
        let sql = "INSERT INTO sessions(timestamp, token, userId) VALUES(?,?,?)";
        let data = [moment().format(), token, userId];
        return Promise((resolve, reject) => {
            database.run(sql, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ token: token });
                }
            });
        });
    }

    updateAndFinishSession(token) {
        let sql = `UPDATE sessions SET status = 0 WHERE token = ?`;
        let data = token;
        return new Promise((resolve, reject) => {
            database.run(sql, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ success: true });
                }
            });
        });
    }

    getUserInfo(email, password) {
        let sql = "SELECT name, id FROM users WHERE users.email=? AND users.password=?";
        let data = [email, password];
        return new Promise((resolve, reject) => {
            database.get(sql, data, (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve(row);
                }
                else {
                    resolve({ invalidCredentials: true });
                }
            });
        });
    }
}

module.exports = AuthDatabase;