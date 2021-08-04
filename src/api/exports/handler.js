const ClientError = require("../../exceptions/ClientError");

class ExportsHandler {
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
    }

    async postExportNotesHandler(request, h){
        try{
            await this._validator.validateExportPayload(request.payload);
            
            // Membuat objek message yang akan dikirim ke queue. Di dalam objek message, kita perlu menyediakan kebutuhan yang diperlukan oleh consumer dalam melakukan tugasnya (mendapatkan dan mengirimkan catatan melalui email).Maka dari itu, di dalam objek message kita perlu menyediakan hal-hal berikut: userId : Untuk mendapatkan seluruh catatan yang pengguna miliki & targetEmail : Untuk mengirimkan pesan melalui email. 
            const message = {
                userId: request.auth.credentials.id,
                targetEmail: request.payload.targetEmail,
            }
                                          //Nama Queuenya  
            await this._service.sendMessage('export:notes', JSON.stringify(message))// sendMessage yang kita buat hanya menerima message dalam bentuk string. Itulah mengapa kita perlu mengubah objek message dalam bentuk string menggunakan JSON.stringify.
        
            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda dalam antrean',
              });
              response.code(201);
              return response;
        } catch(error){
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
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
        } 
    }
}

module.exports = ExportsHandler;