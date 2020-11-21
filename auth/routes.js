const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const moment = require("moment");

const Validation = require('./validation');
const Database = require('./database');

app.use(bodyParser.json());

module.exports = function () {
    let validation = new Validation();
    let database = new Database();

    app.post('/register', async function (req, res) {
        let timestamp = moment().format();
        let invalid = {
            body: !('name' in req.body && 'email' in req.body && 'password' in req.body),
            name: !validation.validName(req.body.name),
            email: !validation.validEmail(req.body.email),
            password: !validation.validPassword(req.body.password)
        };

        if (invalid.body) {
            res.send({ timestamp: timestamp, status: "invalidBody" });
        }
        else if (invalid.name) {
            res.send({ timestamp: timestamp, status: "invalidName" });
        }
        else if (invalid.email) {
            res.send({ timestamp: timestamp, status: "invalidEmail" });
        }
        else if (invalid.password) {
            res.send({ timestamp: timestamp, status: "invalidPassword" });
        }
        else {
            let result = await database.register(req.body.name, req.body.email, req.body.password);
            res.send(result);
        }
    });

    app.post('/login', async function (req, res) {
        let timestamp = moment().format();
        let invalid = {
            body: !('email' in req.body && 'password' in req.body),
            email: !validation.validEmail(req.body.email),
            password: !validation.validPassword(req.body.password)
        };

        if (invalid.body) {
            res.send({ timestamp: timestamp, status: "invalidBody" });
        }
        else if (invalid.email) {
            res.send({ timestamp: timestamp, status: "invalidEmail" });
        }
        else if (invalid.password) {
            res.send({ timestamp: timestamp, status: "invalidPassword" });
        }
        else {
            let result = await database.login(req.body.email, req.body.password);
            res.send(result);
        }
    });

    app.put('/logout', async function (req, res) {
        let timestamp = moment().format();
        let invalid = {
            body: !('token' in req.body),
            token: !validation.validToken(req.body.token)
        };

        if (invalid.body) {
            res.send({ timestamp: timestamp, status: "invalidBody" });
        }
        else if (invalid.email) {
            res.send({ timestamp: timestamp, status: "invalidToken" });
        }
        else {
            let result = await database.logout(req.body.token);
            res.send(result);
        }
    });
    return app;
};