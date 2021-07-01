const NotesHandler = require('./handler');
const routes = require('./routes');
 
module.exports = {
  name: 'notes',
  version: '1.0.0',         //Parameter kedua adalah options. Parameter ini dapat menampung nilai-nilai yang dibutuhkan dalam menggunakan plugin
  register: async (server, { service, validator}) => {
    const notesHandler = new NotesHandler (service, validator); //Menginstance Berkas NotesService Untuk Nanti di taruh sebagai nilai dari parameter routes
    server.route(routes(notesHandler)); //Mendaftarkan routes yang sudah kita buat pada server Hapi
  },
};