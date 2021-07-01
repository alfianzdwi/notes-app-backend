//Berkas ini bertanggung jawab untuk mengelola resource catatan
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InVariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class NotesService{
    constructor(){
        this._notes = []; // Penggunaan nama variabel diawali underscore (_) dipertimbangkan sebagai lingkup privat secara konvensi.
    
    }
    
    addNote({ title, body, tags }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
 
        const newNote = {
         title, tags, body, id, createdAt, updatedAt,
        };
 
        this._notes.push(newNote);
 
        const isSuccess = this._notes.filter((note) => note.id === id).length > 0;
 
        if (!isSuccess) {
                    //Menggunakan Error Yang Sudah Di Buat Di Folder exceptions,agar response/status code nya lebih spesifik tidak general seperti pada saat menggunakan "Error"
            throw new InvariantError('Catatan gagal ditambahkan');
        }
 
        return id;
    }

    getNotes(){
        return this._notes
    }

    getNoteById(id){
        // Mendapatkan objek note dengan id tersebut dari objek array notes. Manfaatkan method array filter() untuk mendapatkan objeknya.
        const note = this._notes.filter((note) => note.id === id)[0];
        
        if(!note){
            throw new NotFoundError("Catatan tidak ditemukan")
        }

        return note
    }

    editNoteById(id, {title,body,tags}){
        // Mendapatkan index dari objek catatan sesuai dengan id yang didapat,Jika Menggunakan findIndex lalu nilai yang di cari tidak ditemukan maka akan default bernilai -1
        const index = this._notes.findIndex((note) => note.id === id)

        if(index === -1){
            throw new NotFoundError("Catatan Gagal Diperbarui, Id tidak ditemukan")
        }

        const updateAt = new Date().toISOString()

        this._notes[index] = {
            ...this._notes[index],
            title,
            body,
            tags,
            updateAt
        };
    }

    deleteNoteById(id) {
        const index = this._notes.findIndex((note) => note.id === id);
        if (index === -1) {
          throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
        this._notes.splice(index, 1);
      }
}

module.exports = NotesService ;