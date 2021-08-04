const fs = require('fs');


class StorageService{
    constructor(folder){
        this._folder = folder;

        // Mengecek Apakah Folder Sudah Ada Atau Belum
        if(!fs.existsSync(folder)){
            fs.mkdirSync(folder,{recursive: true}); // Membuat folder bila belum ada.Options recursive: true membuat mkdirSync bekerja secara rekursif(Memanggil Dirinya Sendiri)
        }
    }

    writeFile(file, meta){
        const filename = +new Date() + meta.filename; // Variabel filename menampung nilai dari meta.filename yang dikombinasikan dengan timestamp. Kombinasi tersebut bertujuan untuk memberikan nama berkas yang unik. Sehingga penulisan berkas tidak akan menimpa berkas lain karena namanya selalu berbeda. 
        const path = `${this._folder}/${filename}`; // Variabel path dibuat untuk menampung path atau alamat lengkap dari berkas yang akan dituliskan. Nilainya diambil dari basis folder yang digunakan (this._folder) dan nama berkas (filename).

        const fileStream = fs.createWriteStream(path); // Membuat Writeable Stream(Menulis berkas menggunakan teknik stream)

        return new Promise((resolve,reject) => {
            // Mengembalikan Promise.reject ketika terjadi eror
            fileStream.on('error', (error) => reject(error));
            
            // Membaca Readable (file) dan menulis ke Writable (fileStream)
            file.pipe(fileStream);

            // Setelah selesai membaca Readable (file),Jika proses penulisannya berhasil (end) maka akan mengembalikan nama berkas.
            file.on('end', () => resolve(filename))
        });
    };
};

module.exports = StorageService;