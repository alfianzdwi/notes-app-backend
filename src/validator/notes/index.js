const InvariantError = require('../../exceptions/InVariantError');
const {NotePayloadSchema} = require ('./schema');

//Melakukan Validasi nya
const NotesValidator = {
    validateNotePayload: (payload) => {
        const validationResult = NotePayloadSchema.validate(payload)

        if (validationResult.error) {
                    //Menggunakan Error Yang Sudah Di Buat Di Folder exceptions,agar response/status code nya lebih spesifik tidak general seperti pada saat menggunakan "Error"
            throw new InvariantError (validationResult.error.message)
        }
    },
};

module.exports = NotesValidator ;

