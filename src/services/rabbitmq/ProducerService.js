const amqp = require('amqplib');

// Pada pembuatan ProducerService, kita tidak menggunakan class, melainkan cukup dengan objek biasa. Hal ini karena kita tidak membutuhkan adanya penggunaan keyword this yang merujuk pada instance dari class. Berbeda dengan service postgres, kita membutuhkan this untuk mengakses properti _pool.
const ProducerService = {
    sendMessage: async(queue, message) => {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER); // Membuat koneksi terlebih dahulu pada server RabbitMQ yang sudah dipasang di komputer kita. 
        const channel = await connection.createChannel(); // Membuat objek channel yang digunakan untuk memanggil API dalam mengoperasikan transaksi di protokol AMQP.

        // Untuk mengirimkan pesan ke queue, kita perlu memastikan dulu bahwa queue dengan nama tersebut sudah dibuat
        await channel.assertQueue(queue, {
            durable: true,
          });

        await channel.sendToQueue(queue, Buffer.from(message));//Untuk kirim pesan dalam bentuk Buffer ke queue dengan menggunakan perintah channel.sendToQueue.Fungsi sendToQueue menerima dua parameter, yaitu nama queue dan pesan dalam bentuk Buffer. Maka dari itu, kita perlu mengubah pesan menjadi bentuk buffer melalui perintah Buffer.from
        
        setTimeout(() => {
            connection.close();
        }, 1000)
    }
}

module.exports = ProducerService;

