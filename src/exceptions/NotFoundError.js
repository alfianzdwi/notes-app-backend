const ClientError = require("./ClientError");

//Error Jika id atau dll.Tidak di temukan
class NotFoundError extends ClientError{
    constructor(message){
        super(message, 404)
        this.name ="NotFoundError"
    }
}

module.exports = NotFoundError;