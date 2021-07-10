const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InVariantError');

class AuthenticationsService{
    constructor(){
        this._pool = new Pool();
    }

    //Memasukan Token Ke Database
    async addRefreshToken(token){
        const query = {
            text: 'INSERT INTO authentications VALUES($1)',
            values: [token],
        }

        await this._pool.query(query);
    }

    //Memastikan Tokens Sudah Ada Di Database Atau Belum
    async verifyRefreshToken(token){
        const query = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [token],
        }

        const result = await this._pool.query(query);

        //Untuk Mengecek Sudah Ada Atau Belum,Dengan Memeriksa Panjang Hasilnya/result.rows
        if(!result.rows.length){
            throw new InvariantError('Refresh token tidak valid');
        }
    }

    //Untuk Menghapus Token,Jika Token Berada Di Database
    async deleteRefreshToken(token){
        await this.verifyRefreshToken(token); // Untuk memastikan token tersebut ada di database
        
        const query = {
            text: 'DELETE FROM authentications WHERE token = $1',
            values: [token],
        }

        await this._pool.query(query);
    }
}

module.exports = AuthenticationsService;