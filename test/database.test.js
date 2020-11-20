const assert = require('assert');
const AuthDatabase = require("../database");


describe('Consultas no SQLITE', function () {
  let authdb = new AuthDatabase();
  let user = {
    id: 1,
    name: "Sávio Santos",
    email: "saviosa08@gmail.com",
    password: "dshdjh"
  };

  it('Criar usuário na tabela users', function () {
    return authdb.createUser(user.name, user.email, user.password).then((res) => {
      assert.strictEqual(res.success, true);
    });
  });

  it('Verificar se usuário existe', function () {
    return authdb.isRegistered(user.email).then((res) => {
      assert.strictEqual(res.success, true);
    });
  });

  it('Verificar se sessão está aberta', function () {
    return authdb.isLogged(user.id).then((res) => {
      assert.strictEqual(res.success, false);
    });
  });
});