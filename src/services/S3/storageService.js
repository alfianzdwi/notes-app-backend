// Berkas Untuk Mengelola Berkas Statis Jika Menggunakan Layanan AWS S3

const AWS = require('aws-sdk');
 
class StorageService {
  constructor() {
    this._S3 = new AWS.S3();
  }

  // Di fungsi ini kita tidak akan melakukan proses penulisan berkas menggunakan teknik stream karena proses penulisan berkas dilakukan oleh service S3 langsung. 
  writeFile(file, meta) {
    const parameter = {
      Bucket: process.env.AWS_BUCKET_NAME, // Nama S3 Bucket yang digunakan
      Key: +new Date() + meta.filename, // Nama berkas yang akan disimpan
      Body: file._data, // Berkas (dalam bentuk Buffer) yang akan disimpan
      ContentType: meta.headers['content-type'], // MIME Type berkas yang akan disimpan
    };

    // Upload objek parameter ke S3 menggunakan fungsi this._S3.upload. Fungsi upload menerima minimal dua buah parameter, yang pertama adalah objek parameter dan yang kedua adalah callback function.
    // Melakukan proses upload di dalam promise agar dapat menggunakan async/await ketika menggunakan fungsi writeFile.
    return new Promise((resolve, reject) => {
        this._S3.upload(parameter, (error, data) => {
          if (error) {
            return reject(error);// Jika gagal, promise akan mengembalikan reject dengan membawa error yang dihasilkan.
          }
          return resolve(data.Location);// Jika proses upload berhasil, maka Promise akan mengembalikan resolve dengan membawa data.Location, di mana nilainya adalah URL dalam mengakses berkas yang ter-upload.
        });
    });
    
    }
}

