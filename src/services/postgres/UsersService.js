const { nanoid } = require('nanoid');
const {Pool} = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InVariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapUserDBToModel } = require('../../utils');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService{
    constructor(){
        this._pool = new Pool();
    }

    //Function Menambahkan User
    async addUser({ username, password, fullname }) {
        // Untuk Verifikasi username, pastikan belum terdaftar.
        await this.verifyNewUsername(username)

        // Bila verifikasi lolos, maka masukkan user baru ke database.
        const id = `user-${nanoid(16)}`;    
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        };

        const result = await this._pool.query(query);

        //Mengevaluasi Menggunakan lenght Untuk Memastikan Data Sudah Berhasil Dimasukan Ke Database 
        if(!result.rows.length){
            throw new InvariantError('User gagal ditambahkan');
        }
        return result.rows[0].id//Untuk Mengembalikan Id
      }
      
    // Function Verifikasi Username,Untuk Mengecek Username Sudah Digunakan Atau Belum
    async verifyNewUsername(username) {
        const query = {
          text: 'SELECT username FROM users WHERE username = $1',
          values: [username],
        };
     
        const result = await this._pool.query(query);
     
        // Mengecek Menggunakan Lenght,Jika Nilai Lebih Dari 0 Artinya Sudah Ada,Dan Akan Membangkitkan Error
        if (result.rows.length > 0) {
          throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
        }
      }
    

    //Funtion Untuk Mendapatkan User Berdasarkan id
    async getUserById(userId){
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [userId]
        }

        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new NotFoundError('User tidak ditemukan');
        }
        return result.rows.map(mapUserDBToModel)[0];
    }

    //Function Verifikasi Username Dan Password Untuk Nanti Mendapatkan Token
    async verifyUserCredential(username, password) {
      const query = {
        text: 'SELECT id, password FROM users WHERE username = $1',
        values: [username],
      };

      const result = await this._pool.query(query);

      if(!result.rows.length){
        throw new AuthenticationError('Kredensial yang Anda berikan salah')
      }

      // Untuk komparasi nilai hashedPassword dengan password yang ada di parameter
      const {id, password: hashedPassword} = result.rows[0];

      //Untuk melakukan komparasi nilai string plain dan hashed menggunakan bcrypt,Karena hashedPassword nilainya sudah di-hash kita dapat memanfaatkan fungsi bcrypt.compare.
      const match = await bcrypt.compare(password, hashedPassword);

      if (!match) {
        throw new AuthenticationError('Kredensial yang Anda berikan salah');
      }

      return id; // Nilai user id tersebut nantinya akan digunakan dalam membuat access token dan refresh token.

    }
}

module.exports = UsersService;