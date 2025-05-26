// backend/config/database.js

const mysql = require('mysql2');
const db = mysql.createConnection({

    host: 'localhost',
    user: 'woolanr',
    password: 'maululusPL2025',
    database: 'happy_toothy',
    connectTimeout: 20000,
    timeout: 60 * 1000
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
    if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
        console.error('Fatal database error, attempting to re-establish connection...');
    }
});

module.exports = db;