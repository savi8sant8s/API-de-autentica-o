class Validation{
    regex;

    constructor(){
        this.regex = {
            name: new RegExp(/^[a-zzéúíóáèùìòàõãñêûîôâëyüïöäA-ZÉÚÍÓÁÈÙÌÒÀÕÃÑÊÛÎÔÂËYÜÏÖÄ ]{3,34}$/),
            email: new RegExp(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/),
            password: new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        };
    }

    validToken(value){
        return value.length == 16;
    }

    validName(value){
        return this.regex.name.test(value);
    }

    validEmail(value){
        return this.regex.email.test(value);
    }

    validPassword(value){
        return this.regex.password.test(value);
    }
}

module.exports = Validation;