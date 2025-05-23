// backend/models/userModel.js
const db = require('../config/database');

const User = {
    // Fungsi yang sudah ada (diubah menjadi Promise)
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            console.log('Executing DB query: SELECT * FROM USERS WHERE username = ?', [username]); // Log 1
            db.query('SELECT * FROM USERS WHERE username = ?', [username], (err, results) => {
                console.log('DB query callback executed. Error:', err, 'Results length:', results ? results.length : 0); // Log ini lebih detail
                if (err) {
                    console.error('Error in findByUsername DB query:', err); // Log error DB spesifik
                    return reject(err);
                }
                console.log('DB query results received successfully for username:', username); // Log ini
                resolve(results);
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

    // --- FUNGSI BARU UNTUK DASHBOARD ADMIN ---

    // Fungsi untuk mendapatkan semua user (digunakan di userController.js)
    findAll: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap FROM USERS u JOIN PROFILE p ON u.id_profile = p.id_profile', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Fungsi untuk mendapatkan user berdasarkan ID (digunakan di userController.js)
    findById: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap FROM USERS u JOIN PROFILE p ON u.id_profile = p.id_profile WHERE u.id_user = ?', [id_user], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Fungsi untuk update user (digunakan di userController.js)
    updateUser: (id_user, userData) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET ? WHERE id_user = ?', [userData, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Fungsi untuk menyimpan token reset password (digunakan di authController.js)
    saveResetToken: (id_user, token) => {
        // Anda perlu menambahkan kolom `reset_password_token` dan `reset_password_expires` di tabel USERS
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET reset_password_token = ?, reset_password_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id_user = ?', [token, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Fungsi untuk mencari user berdasarkan token reset password (digunakan di authController.js)
    findByResetToken: (token) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM USERS WHERE reset_password_token = ? AND reset_password_expires > NOW()', [token], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Fungsi untuk memperbarui password (digunakan di authController.js)
    updatePassword: (id_user, hashedPassword) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [hashedPassword, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Fungsi untuk membersihkan token reset password (digunakan di authController.js)
    clearResetToken: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
    // Fungsi untuk mencari user berdasarkan token verifikasi (digunakan di authController.js)
    findByVerificationToken: (token) => {
        // Anda perlu menambahkan kolom `verification_token` dan `verification_expires` di tabel USERS
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM USERS WHERE verification_token = ? AND verification_expires > NOW()', [token], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    // Fungsi untuk menghapus token verifikasi (digunakan di authController.js)
    clearVerificationToken: (id_user) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE USERS SET verification_token = NULL, verification_expires = NULL WHERE id_user = ?', [id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

};

module.exports = User;