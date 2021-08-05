// Berkas CacheService ini akan digunakan di dalam dua service lain, yakni NotesService dan CollaborationsService.

const redis = require('redis');

class CacheService{
    constructor(){
        // Membuat properti this._client yang bernilai client Redis. Client tersebut dibuat menggunakan perintah createClient yang memanfaatkan package redis. Melalui properti this._client inilah nantinya kita bisa mengoperasikan Redis server.
        this._client = redis.createClient({
            host: process.env.REDIS_SERVER,
        })
        
        //Event-Driven Jika Terjadi Error
        this._client.on('error', (error) => {
            console.log(error);
        })
    }

    // Fungsi Set Untuk Menyimpan Nilai Pada Cache,Ketahuilah bahwa package redis belum memanfaatkan Promise untuk operasinya. Sehingga untuk mendapatkan nilai yang dikembalikan dari setiap operasinya, harus menggunakan callback.Jadi, agar nantinya fungsi CacheService.set dapat memanfaatkan sintaks async/await, fungsi tersebut perlu mengembalikan nilai promise dan kita bungkus operasi redis di dalam promise tersebut.
    set(key, value, expirationInSecond = 3600){
        return new Promise((resolve, reject) => {
            this._client.set(key, value, 'EX', expirationInSecond, (error,ok) => {
                if(error){
                    return reject(error)
                }

                return resolve(ok)
            });
        });
    };

    // Fungsi Mendapatkan Nilai Cache.di sini kita menggunakan fungsi this._client.get.Data yang dikembalikan dibawa oleh callback function, lebih tepatnya pada parameter reply. Bila nilai pada key yang diminta tidak ada atau (nil), maka reply akan bernilai null. Jika nilai pada key ada, maka nilainya dapat kita peroleh melalui reply.toString(). 
    get(key){
        return new Promise((resolve, reject) => {
            this._client.get(key, (error, reply) => {
                if(error){
                    return reject(error);
                }

                if(reply === null){
                    return reject(new Error('Cache tidak ditemukan'));
                }

                return resolve(reply.toString);
            }); 
        });
    }

    // Fungsi Menghapus Cache
    delete(key){
        return new Promise((resolve,reject) => {
            this._client.del(key, (error,count) => {
                if(error){
                    return reject(error)
                }

                return resolve(count);
            })
        })
    }
}

module.exports = CacheService;