/*Fungsi handler digunakan untuk menangani permintaan dari client yang datang 
kemudian memberikan respons dan sebaiknya memang hanya sebatas itu.*/

const ClientError = require("../../exceptions/ClientError");

class NotesHandler {
    constructor(service, validator) {
      this._service = service;
      this._validator = validator;
   
      this.postNoteHandler = this.postNoteHandler.bind(this);
      this.getNotesHandler = this.getNotesHandler.bind(this);
      this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
      this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
      this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
    }

    async postNoteHandler(request, h) {
        
      try{
        this._validator.validateNotePayload(request.payload);
        const {title = 'untitled', body, tags} = request.payload; // Untuk Mendapatkan Nilai Dari Request Yang Dikirim Dari Client
        
        const noteId = await this._service.addNote({title, body, tags}); // Untuk proses memasukan catatan baru,Karena fungsi this._service.addNotes akan mengembalikan id catatan yang disimpan, maka buatlah variabel noteId untuk menampung nilainya

        const response = h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data:{
                noteId,
            },
        });
        response.code(201);
        return response;
        
      }catch(error){
        if(error instanceof ClientError){// Mengevaluasi Bila error merupakan turunan dari ClientError, maka kita bisa memberikan detail informasi terkait error apa yang terjadi kepada client melalui properti error.message dan error.statusCode.
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode)
            return response
        }

        const response = h.response({
            status: 'fail',
            message: 'Maaf, terjadi kegagalan pada server kami'
        })
        response.code(500)
        console.error(error);
        return response
        }  
    }

    
    async getNotesHandler() {
        const notes = await this._service.getNotes();

        return {
            status: 'success',
            data: {
                notes,
            },
        }
    }

    async getNoteByIdHandler(request, h) {
        try{
        const {id} = request.params;
        const note = await this._service.getNoteById(id);

            return {
                status: 'success',
                data: {
                    note,
                },
            }
        }catch(error){
            if(error instanceof ClientError){//Mengevaluasi Agar pesan error lebih spesifik dengan menggunakan jenis error yang sudah kita buat di folder exceptions
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode)
                return response
            }
    
            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server kami'
            })
            response.code(500)
            console.error(error);
            return response
        }
    }
    
    async putNoteByIdHandler(request, h) {

        try{
            this._validator.validateNotePayload(request.payload);

            const {id} = request.params

            await this._service.editNoteById(id, request.payload);

        
            return{
                status: 'success',
                message: 'Catatan berhasil diperbarui',
            }
        }catch(error){
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server kami'
            })
            response.code(500)
            console.error(error);
            return response
        }
    }

    async deleteNoteByIdHandler(request, h) {
        try {
          const { id } = request.params;
          await this._service.deleteNoteById(id);
          return {
            status: 'success',
            message: 'Catatan berhasil dihapus',
          };
        } catch (error) {
            if(error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode)
                return response
            }
    
            const response = h.response({
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server kami'
            })
            response.code(500)
            console.error(error);
            return response
        }
      }
}

module.exports = NotesHandler;