const CODE_STATUS = {
    REGISTER: {
        SUCCESS: 11,
        ALREADY_REGISTERED: 12,
        NOT_REGISTERED: 13
    },
    LOGIN: {
        SUCCESS: 21,
        VALID_CREDENTIALS: 22,
        INVALID_CREDENTIALS: 23,
        USER_NOT_EXISTS: 24
    },
    LOGOUT: {
        SUCCESS: 31,
        INVALID_OR_DISABLE_TOKEN: 32,
        TOKEN_ENABLE: 33
    },
    INVALID_FIELD: {
        NAME: 41,
        EMAIL: 42,
        PASSWORD: 43,
        TOKEN: 44
    },
    QUERY_ERROR: 51
};

module.exports = CODE_STATUS;