const assert = require('assert');
const Database = require("../auth/database");

describe('Consultas no SQLITE', function () {
  let db = new Database();
  let token;
  let user = {
    id: 1,
    name: "Sávio Santos",
    email: "saviosa08@gmail.com",
    password: "dshdjh"
  };

  it('Cadastrar usuário', function () {
    return db.register(user.name, user.email, user.password).then((result) => {
      assert.deepStrictEqual(result.status, "alreadyRegistered");
    });
  });

  it('Fazer login', function () {
    return db.login(user.email, user.password).then((result) => {
      token = result.token;
      assert.deepStrictEqual(result.status, "loginSuccess");
    });
  });

  it('Fazer logout', function () {
    return db.logout(token).then((result) => {
      assert.deepStrictEqual(result.status, "logoutSuccess");
    });
  })
});