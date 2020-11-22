const assert = require('assert');
const AuthDatabase = require("../auth/auth-database");
const CODE_STATUS = require('../auth/code-status');

describe('Consultas no SQLITE', function () {
  let authdb = new AuthDatabase();
  let token;
  let user = {
    id: 1,
    name: "Sávio Santos",
    email: "saviosa08@gmail.com",
    password: "dshdjh"
  };

  it('Cadastrar usuário', function () {
    return authdb.register(user.name, user.email, user.password).then((response) => {
      assert.deepStrictEqual(response.status, CODE_STATUS.REGISTER.SUCCESS);
    });
  });

  it('Fazer login', function () {
    return authdb.login(user.email, user.password).then((response) => {
      token = response.token;
      assert.deepStrictEqual(response.status, CODE_STATUS.LOGIN.SUCCESS);
    });
  });

  it('Fazer logout', function () {
    return authdb.logout(token).then((response) => {
      assert.deepStrictEqual(response.status, CODE_STATUS.LOGOUT.SUCCESS);
    });
  })
});