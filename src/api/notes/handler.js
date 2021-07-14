/*Fungsi handler digunakan untuk menangani permintaan dari client yang datang 
kemudian memberikan respons dan sebaiknya memang hanya sebatas itu.*/

const ClientError = require("../../exceptions/ClientError");

class NotesHandler {
    constructor(service, validator) {
      this._service = service;
      this._validator = validator;
    
      //Bind agar nilai this tidak berubah dari instance NotesHandler, menjadi objek route yang memanggilnya karena sifat this pada javascript this akan berubah menjadi instance yang memanggilnya.
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

            //Destructing Object : dalam JavaScript merupakan sintaksis yang dapat mengeluarkan nilai dari array atau properties dari sebuah object ke dalam satuan yang lebih kecil.
        const {id: credentialId } = request.auth.credentials; 
        const noteId = await this._service.addNote({title, body, tags, owner: credentialId}); // Untuk proses memasukan catatan baru,Karena fungsi this._service.addNotes akan mengembalikan id catatan yang disimpan, maka buatlah variabel noteId untuk menampung nilainya

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

        // SERVER ERROR
        const response = h.response({
            status: 'fail',
            message: 'Maaf, terjadi kegagalan pada server kami'
        })
        response.code(500)
        console.error(error);
        return response
        }  
    }

    
    async getNotesHandler(request) {
        const {id: credentialId } = request.auth.credentials;  //Karena route /notes menerapkan notesapp_jwt authentication strategy, maka setiap request.auth akan membawa nilai kembalian dari fungsi validate. Dengan begitu, kita bisa mendapatkan user id pengguna yang terautentikasi melalui request.auth.credentials.id.
        const notes = await this._service.getNotes(credentialId);
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
        const { id: credentialId } = request.auth.credentials;
    
        await this._service.verifyNoteAccess(id, credentialId);
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
            const { id: credentialId } = request.auth.credentials;
    
            await this._service.verifyNoteAccess(id, credentialId);
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
            const { id: credentialId } = request.auth.credentials;
    
            await this._service.verifyNoteOwner(id, credentialId);
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