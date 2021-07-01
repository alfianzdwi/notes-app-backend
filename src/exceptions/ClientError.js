//Client Error Adalah Kelas Turunan Dari Kelas Error,di sini kita gunakan untuk mendapatkan pesan error yang lebih spesifik
class ClientError extends Error {
    constructor(message, statusCode = 400 ){
        super(message)
        this.statusCode = statusCode
        this.name = "ClientError";
    }
}

module.exports = ClientError;