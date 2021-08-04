const Joi = require('joi')

// Untuk memvalidasi objek metadata yang ada pada berkas yang akan di-upload.
const ImageHeadersSchema = Joi.object({
    'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(), // Valid merupakan variadic function yang digunakan untuk menentukan validitas nilai properti berdasarkan nilai secara spesifik
}).unknown(); // Unknown merupakan fungsi untuk membuat objek bersifat tidak diketahui. Artinya, objek boleh memiliki properti apa pun karena memang kita tidak tahu objek dapat memiliki properti apa saja

module.exports = { ImageHeadersSchema };