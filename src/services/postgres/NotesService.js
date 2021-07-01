const { nanoid } = require('nanoid');
const {Pool} = require ('pg');
const InvariantError = require('../../exceptions/InVariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class NotesService {
    constructor(){
        this._pool = new Pool();
    }

    async addNote({title,body,tags}){
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updateAt = createdAt;

        //Membuat objek query untuk memasukan notes baru ke database
        const query =  {
            text: 'INSERT INTO notes VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, title, body, tags, createdAt, updateAt],
        }

        const result = await this._pool.query(query)//Untuk mengeksekusi query yang sudah dibuat

        //Mengevaluasi Untuk Memastikan Data Sudah Berhasil Dimasukan Ke Database
        if(!result.rows[0].id){
            throw new InvariantError('Catatan gagal ditambahkan')
        }
 
        return result.rows[0].id//Untuk Mengembalikan Id
    }


    async getNotes(){
        const result = await this._pool.query('SELECT * FROM notes');//Untuk Mengambil Data Dari Database

        return result.rows.map(mapDBToModel);//Mengmebalikan Hasil Data Yang Di Dapat Lalu Di mapping,Dengan menggunakan berkas indek yang sudah kita buat di folder utils
    }

    async getNoteById(id){
        const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id]
        }

        const result = await this._pool.query(query)

        if(!result.rows.length){
            throw new NotFoundError ('Catatan tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    async editNoteById(id, {title,body,tags}){
        const updateAt = new Date().toISOString();

        const query = {
            text: 'UPDATE notes SET title = $1,body = $2,tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
            values: [title, body, tags, updateAt, id]
        }
        
        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
        }
    }

    async deleteNoteById(id){
        const query = {
            text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
            values: [id],
          };
       
          const result = await this._pool.query(query);

          if (!result.rows.length) {
            throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
          }
    }
}

module.exports = NotesService;