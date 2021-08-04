//Berkas Ini Untuk Membuat Dan Memverifikasi Token Menggunakan JWT

const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
 
const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {               //Untuk men-decoded token
      const artifacts = Jwt.token.decode(refreshToken);//Untuk melakukan verifikasi token menggunakan @hapi/jwt dapat dilakukan menggunakan fungsi Jwt.token.verifySignature. Namun, fungsi verifySignature itu sendiri, hanya menerima token dalam bentuk artifacts atau token yang sudah di-decoded. Kita tidak bisa menggunakan refreshToken secara langsung.
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload; //Nilai payload tersebut nantinya akan digunakan dalam membuat akses token baru.
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};
 
module.exports = TokenManager;