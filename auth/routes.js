const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const moment = require("moment");
const AuthDatabase = require('./auth-database');
const Validation = require('./validation');
const CODE_STATUS = require('./code-status');

app.use(bodyParser.json());

module.exports = function () {
    let validation = new Validation();
    let database = new AuthDatabase();

    app.post('/register', async function (req, res) {
        let invalidField = {
            body: !('name' in req.body && 'email' in req.body && 'password' in req.body),
            name: !validation.validName(req.body.name),
            email: !validation.validEmail(req.body.email),
            password: !validation.validPassword(req.body.password)
        };
        let response = {timestamp: moment().format()};

        if (invalidField.body) {
            response.status = CODE_STATUS.INVALID_FIELD.BODY;
        }
        else if (invalidField.name) {
            response.status = CODE_STATUS.INVALID_FIELD.NAME;
        }
        else if (invalidField.email) {
            response.status = CODE_STATUS.INVALID_FIELD.EMAIL;
        }
        else if (invalidField.password) {
            response.status = CODE_STATUS.INVALID_FIELD.PASSWORD;
        }
        else {
            response = await database.register(req.body.name, req.body.email, req.body.password);
        } 
        res.send(response);
    });

    app.post('/login', async function (req, res) {
        let invalidField = {
            body: !('email' in req.body && 'password' in req.body),
            email: !validation.validEmail(req.body.email),
            password: !validation.validPassword(req.body.password)
        };
        let response = {timestamp: moment().format()};

        if (invalidField.body) {
            response.status = CODE_STATUS.INVALID_FIELD.BODY;
        }
        else if (invalidField.email) {
            response.status = CODE_STATUS.INVALID_FIELD.EMAIL;
        }
        else if (invalidField.password) {
            response.status = CODE_STATUS.INVALID_FIELD.PASSWORD;
        }
        else {
            response = await database.login(req.body.email, req.body.password);
        }
        res.send(response);
    });

    app.put('/logout', async function (req, res) {
        let invalidField = {
            body: !('token' in req.body),
            token: !validation.validToken(req.body.token)
        };
        let response = {timestamp: moment().format()};

        if (invalidField.body) {
            response.status = CODE_STATUS.INVALID_FIELD.BODY;
        }
        else if (invalidField.email) {
            response.status = CODE_STATUS.INVALID_FIELD.EMAIL;
        }
        else {
            response = await database.logout(req.body.token);
        }
        res.send(response);
    });

    return app;
};