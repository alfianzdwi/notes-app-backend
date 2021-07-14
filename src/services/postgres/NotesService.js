const { nanoid } = require('nanoid');
const {Pool} = require ('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError.js');
const InvariantError = require('../../exceptions/InVariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');


class NotesService {
    constructor(collaborationService){
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async addNote({title,body,tags,owner}){
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updateAt = createdAt;

        //Membuat objek query untuk memasukan notes baru ke database
        const query =  {
            text: 'INSERT INTO notes VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, body, tags, createdAt, updateAt, owner],
        }

        const result = await this._pool.query(query)//Untuk mengeksekusi query yang sudah dibuat

        //Mengevaluasi Menggunakan id Untuk Memastikan Data Sudah Berhasil Dimasukan Ke Database
        if(!result.rows[0].id){
            throw new InvariantError('Catatan gagal ditambahkan')
        }
 
        return result.rows[0].id//Untuk Mengembalikan Id
    }

    
    async getNotes(owner){

        //Kueri ini akan mengembalikan seluruh nilai notes yang dimiliki oleh dan dikolaborasikan dengan owner
        //Data notes yang dihasilkan berpotensi duplikasi, sehingga di akhir kueri, kita GROUP nilainya agar menghilangkan duplikasi yang dilihat berdasarkan notes.id.
        const query = {                      
            text: `SELECT notes.* FROM notes 
            LEFT JOIN collaborations ON collaborations.note_id = notes.id
            WHERE notes.owner = $1 OR collaborations.user_id = $1
            GROUP BY notes.id`,
            values: [owner],
        };

        const result = await this._pool.query(query);//Melakukan Query Lalu Hasilnya Di Masukkan Ke Dalam Variabel Result 
        return result.rows.map(mapDBToModel);//Mengmebalikan Hasil Data Yang Di Dapat Lalu Di mapping,Dengan menggunakan berkas indek yang sudah kita buat di folder utils
    }

    //Untuk Mendapatkan Berdasarkan Id,dan juga mendapatkan username dari hasil Join
    async getNoteById(id){
        const query = {
            //Kata FROM = Tabel Sebelah Kiri, Kata JOIN = Tabel Sebelah Kanan
            text: `SELECT notes.*, users.username
            FROM notes
            LEFT JOIN users ON notes.owner = users.id
            WHERE notes.id = $1`,
            values: [id],
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
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
          }
    }

    // Untuk memeriksa apakah catatan dengan id yang diminta adalah hak pengguna. Fungsi tersebut nantinya akan digunakan pada NotesHandler sebelum mendapatkan, mengubah, dan menghapus catatan berdasarkan id.
    async verifyNoteOwner(id, owner){
        const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id],
          };

        const result = await this._pool.query(query);

        //Untuk mendapatkan objek note sesuai id; bila objek note tidak ditemukkan, maka throw NotFoundError
        if (!result.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        const note = result.rows[0];

        //Untuk Melakukan pengecekan kesesuaian owner-nya;  bila owner tidak sesuai, maka throw AuthorizationError.
        if(note.owner !== owner){
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    //Fungsi yang digunakan dalam menentukan hak akses user baik sebagai owner ataupun kolaborator,Fungsi verifyNoteAccess bertujuan untuk memverifikasi hak akses pengguna (userId) terhadap catatan (id)
    async verifyNoteAccess(noteId, userId) {
        try {
          await this.verifyNoteOwner(noteId, userId);//Fungsi ini akan memeriksa hak akses Bila userId tersebut merupakan owner dari noteId maka ia akan lolos verifikasi. Namun bila gagal, proses verifikasi owner membangkitkan eror (gagal) dan masuk ke block catch.
        } catch (error) {
          if (error instanceof NotFoundError) {// Bila error merupakan NotFoundError, maka langsung throw dengan error (NotFoundError) tersebut. Kita tak perlu memeriksa hak akses kolaborator karena catatannya memang tidak ada.
            throw error;
        }
          try {
            await this._collaborationService.verifyCollaborator(noteId, userId);//Bila AuthorizationError, maka lanjutkan dengan proses pemeriksaan hak akses kolaborator, menggunakan fungsi verifyCollaborator. Bila pengguna seorang kolaborator, proses verifikasi akan lolos.
          } catch {
            throw error;
          }
        }
    }
}

module.exports = NotesService;