const path = require ('path')

const routes = (handler) => [
    {
        method: 'POST',
        path: '/upload/images',
        handler: handler.postUploadImageHandler,
        options: {
            // Untuk menangani permintaan multipart/form-data,Seperti gambar,audio,berkas dll.
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream', // Untuk mengubah output payload yg berupa Buffer menjadi Readable Stream/berkas utuh
            }
        }
    },
    {
        method: 'GET',
        path: '/upload/{param*}',
        handler: {
            // Plugin Inert juga menambahkan fungsionalitas untuk melayani permintaan berbasis direktori atau folder. Hal ini cocok bila ingin melayani banyak berkas dalam sebuah folder hanya dengan satu konfigurasi route.
          directory: {
            path: path.resolve(__dirname, 'file'),
          },
        },
      },
];

module.exports = routes;