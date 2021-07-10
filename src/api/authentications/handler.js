const ClientError = require("../../exceptions/ClientError");

class AuthenticationsHandler{
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
        this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
        this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler (request, h){
        try{
            this._validator.validatePostAuthenticationPayload(request.payload);
 
            const { username, password } = request.payload;
            const id = await this._usersService.verifyUserCredential(username, password); //Memverifikasi Kredensial Username Name Dan Password Sudah Benar Atau Belum,Jika Sudah Benar Akan Mengembalikan Id,Nantinya Id ini di gunakan untuk membuat token

            const accessToken = await this._tokenManager.generateAccessToken({id}); //Untuk Membuat Access Token Dengan Menggunakan id
            const refreshToken = await this._tokenManager.generateRefreshToken({id});

            await this._authenticationsService.addRefreshToken(refreshToken); //Memasukan Refresh Token ke database agar server mengenali refreshToken bila pengguna ingin memperbarui accessToken.

            const response = h.response({
                status: 'success',
                message: 'Authentication berhasil ditambahkan',
                data:{
                    accessToken,
                    refreshToken,
                }
            })
            response.code(201);
            return response;
        }catch(error){
            if (error instanceof ClientError) { 
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

    async putAuthenticationHandler(request, h){
        try{
            this._validator.validatePutAuthenticationPayload(request.payload);
            const { refreshToken } = request.payload;
            
            await this._authenticationsService.verifyRefreshToken(refreshToken); //Memverifikasi Refresh Token Pada Sisi Database
            const { id } = this._tokenManager.verifyRefreshToken(refreshToken); //Memverifikasi Refresh Token Signature Atau Tidaknya

            const accessToken = await this._tokenManager.generateAccessToken({id});

            const response = h.response ({
                status: 'success',
                message: 'Access Token berhasil diperbarui',
                data:{
                    accessToken,
                },
            });
            response.code(200);
            return response;
        }catch(error){
            if (error instanceof ClientError) {
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

    async deleteAuthenticationHandler(request, h) {
        try {
            this._validator.validatePutAuthenticationPayload(request.payload);

            const { refreshToken } = request.payload;
            
            await this._authenticationsService.verifyRefreshToken(refreshToken); //Memverifikasi Refresh Token Pada Sisi Database
            await this._authenticationsService.deleteRefreshToken(refreshToken); //Menghapus Refresh token di database

            return {
                status: 'success',
                message: 'Refresh token berhasil dihapus',
              };

        } catch (error) {
          if (error instanceof ClientError) {
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

module.exports = AuthenticationsHandler