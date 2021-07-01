require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const NotesService = require('./services/inMemory/NotesService');
const NotesValidator = require('./validator/notes');

const init = async () => {

    const notesService = new NotesService();

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

  // Mendaftarkan PlugIn notes dengan options.service bernilai notesService
   await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  
  await server.start();
  console.log(`Server Berjalan Pada ${server.info.uri}`);
};

init();