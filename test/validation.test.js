const assert = require('assert');
const Validation = require("../Validation");

describe('Consultas no SQLITE', function () {
    let validation = new Validation();

    it('Validar nome', function () {
        let result = validation.validName("Jõao da Silva");
        let result2 = validation.validName("Carlos Castanho");

        assert.strictEqual(result, true);
        assert.strictEqual(result2, true);
    });

    it('Invalidar nome', function () {
        let result = validation.validName("Sávio Sant7s");
        let result2 = validation.validName("aa");

        assert.strictEqual(result, false);
        assert.strictEqual(result2, false);
    });

    it('Validar email', function () {
        let result = validation.validEmail("saviosa08@gmail.com");
        let result2 = validation.validEmail("john@email.com");

        assert.strictEqual(result, true);
        assert.strictEqual(result2, true);
    });

    it('Invalidar email', function () {
        let result = validation.validEmail("saviosa08@gmail");
        let result2 = validation.validEmail("sotnas.gmail.com");

        assert.strictEqual(result, false);
        assert.strictEqual(result2, false);
    });


    it('Validar senha (pelo menos um número ou letra e maior que 8 caracteres)', function () {
        let result = validation.validPassword("asdqwwqe1");
        let result2 = validation.validPassword("shaha1223");

        assert.strictEqual(result, true);
        assert.strictEqual(result2, true);
    });

    it('Invalidar senha (apenas letra ou número e menor que 8 caracteres)', function () {
        let result = validation.validPassword("12345678");
        let result2 = validation.validPassword("asdqwwq");

        assert.strictEqual(result, false);
        assert.strictEqual(result2, false);
    });
});