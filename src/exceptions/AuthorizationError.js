const ClientError = require("./ClientError");

class AuthorizationError extends ClientError{
    constructor(message){
        super(message, 403);
        this.name = "AuthenticationError"
    }
}

module.exports = AuthorizationError;