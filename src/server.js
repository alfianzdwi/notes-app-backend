require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

//Notes
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');

//Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

//Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
    const notesService = new NotesService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    /** Cross-origin resource sharing (CORS) : Agar Aplikasi Client Bisa Mengakses Origin(alamat server) Yg Berbeda
         * mekanisme yang dapat membuat mereka saling berinteraksi
         */
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Mendaftarkan PulgIn Eksternal
await server.register([
    {
      plugin: Jwt,
    },
]);

server.auth.strategy('notesapp_jwt','jwt',{
  keys: process.env.ACCESS_TOKEN_KEY,
  //Kita diberi nilai false berarti aud/iss/sub tidak akan diverifikasi.
  verify: {
    aud: false,
    iss: false,
    sub: false,
    maxAgeSec: process.env.ACCESS_TOKEN_AGE,
  },
  validate: (artifacts) => ({
    isValid: true,
    credentials: {
      id: artifacts.decoded.payload.id,
    },
  })
});


  // Mendaftarkan PlugIn notes dengan options.service bernilai notesService
await server.register([
  {
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    }
  },
  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  },
]);

  
  await server.start();
  console.log(`Server Berjalan Pada ${server.info.uri}`);
};

init();