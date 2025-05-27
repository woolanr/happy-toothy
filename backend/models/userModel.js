// backend/models/userModel.js
const db = require('../config/database');

const User = {
    // Fungsi yang sudah ada (diubah menjadi Promise)
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM USERS WHERE username = ?', [username], (err, results) => {
                if (err) return reject(err);
                return resolve(results);
            });
        });
    },
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM USERS WHERE email = ?', [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    createUser: (userData) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO USERS SET ?', userData, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    updateStatusValid: (id_user, id_status_valid) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET id_status_valid = ? WHERE id_user = ?', [id_status_valid, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });   
        });
    },

    findById: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap FROM USERS u JOIN PROFILE p ON u.id_profile = p.id_profile WHERE u.id_user = ?', [id_user], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    findAll: () => {
        return new Promise((resolve, reject) => {
            console.log('userModel: findAll - Executing DB query for all users.'); // LOG BARU
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap, p.jenis_kelamin, p.tanggal_lahir FROM USERS u LEFT JOIN PROFILE p ON u.id_profile = p.id_profile', (err, results) => { // Pastikan Anda sudah menggunakan LEFT JOIN di sini
                console.log('userModel: findAll - DB query callback received!'); // LOG BARU
                
 if (err) {
                    console.error('userModel: findAll - Error in DB query:', err); // LOG BARU
                    return reject(err);
                }
                console.log('userModel: findAll - DB query results (raw):', results); // LOG BARU
                console.log('userModel: findAll - DB query results length:', results ? results.length : 0); // LOG BARU
                resolve(results);
            });
        });
    },

    updateUser: (id_user, userData) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET ? WHERE id_user = ?', [userData, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    saveVerificationToken: (id_user, token, expires) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET verification_token = ?, verification_expires = ? WHERE id_user = ?', [token, expires, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    findByVerificationToken: (token) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM USERS WHERE verification_token = ? AND verification_expires > NOW()', [token], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    clearVerificationToken: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET verification_token = NULL, verification_expires = NULL WHERE id_user = ?', [id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    saveResetToken: (id_user, token, expires) => {
        return new Promise((resolve, reject) => {
            // Pastikan kolom reset_password_token dan reset_password_expires ada di tabel USERS
            db.query('UPDATE USERS SET reset_password_token = ?, reset_password_expires = ? WHERE id_user = ?', [token, expires, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    findByResetToken: (token) => {
        return new Promise((resolve, reject) => {
            // Pastikan kolom reset_password_token dan reset_password_expires ada di tabel USERS
            db.query('SELECT * FROM USERS WHERE reset_password_token = ? AND reset_password_expires > NOW()', [token], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    updatePassword: (id_user, hashedPassword) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [hashedPassword, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    clearResetToken: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

};

module.exports = User;