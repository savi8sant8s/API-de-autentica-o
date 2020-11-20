const assert = require('assert');
const AuthDatabase = require("../database");

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
    return authdb.register(user.name, user.email, user.password).then((res) => {
      assert.deepStrictEqual(res.status, "success");
    });
  });

  it('Fazer login', function () {
    return authdb.login(user.email, user.password).then((res) => {
      token = res.token;
      assert.deepStrictEqual(res.status, "success");
    });
  });

  it('Fazer logout', function () {
    return authdb.logout(token).then((res) => {
      assert.deepStrictEqual(res.status, "success");
    });
  });
});