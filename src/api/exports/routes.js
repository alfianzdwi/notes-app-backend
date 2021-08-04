const routes = (handler) => [
    {
        method: 'POST',
        path: '/export/notes',
        handler: handler.postExportNotesHandler,
        options: {
            auth: 'notesapp_jwt', // Menambahkan options.auth dengan nilai notesapp_jwt.Karena kita membutuhkan identitas pengguna yang autentik untuk mengekspor data catatan yang ia miliki.
        }
    }
];

module.exports = routes;
