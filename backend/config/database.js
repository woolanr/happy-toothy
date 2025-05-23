// backend/config/database.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'woolanr',
    password: 'maululusPL2025',
    database: 'happy_toothy',
    connectTimeout: 20000, // Tambahkan ini jika belum, untuk timeout koneksi awal
    // Tambahan: Tambahkan parameter timeout untuk setiap query, meskipun seringkali di handle oleh driver
    // queryTimeout: 20000 // Beberapa driver memiliki ini, tapi tidak semua
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

db.on('error', function(err) {
    console.error('Database error event caught by db.on("error"):', err);
    // Anda mungkin ingin mengakhiri koneksi atau mencoba koneksi ulang di sini jika diperlukan
    if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
        console.error('Fatal database error, attempting to re-establish connection...');
        // Implementasi rekoneksi yang lebih kompleks diperlukan di sini untuk produksi
        // Untuk pengembangan, cukup restart server Node.js
    }
});

module.exports = db;