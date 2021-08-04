const ClientError = require("../../exceptions/ClientError");

class UploadsHandler {
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h){
        try{
            const { data } =  request.payload;

            await this._validator.validateImageHeaders(data.hapi.headers); // Memvalidasi Headers Payloadnya
            const filename = await this._service.writeFile(data, data.hapi); // Menulis berkas yang dikirim pada storage melalui fungsi this._service.writeFile. Berikan data sebagai parameter file dan data.hapi sebagai parameter meta.

            const response = h.response({
                status: 'success',
                messsage: '',
                data: {
                    fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}` // Fungsi writeFile mengembalikan nama berkas (filename). Kita bisa memanfaatkan nama berkas ini dalam membuat nilai fileLocation dan mengembalikannya sebagai response.
                }
            })
            response.code(201);
            return response;
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,  
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server kami'
            });
            response.code(500);
            console.error(error)
            return response;
        }
    }
}

module.exports = UploadsHandler;