const ClientError = require("./ClientError");

//Error Bad Request
class InvariantError extends ClientError{
    constructor(message){
        super(message);
        this.name = "InvariantError";
    }
}

module.exports = InvariantError;
