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

    findDoctorById: (id_doctor) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT d.*, u.username, u.email, p.nama_lengkap FROM DOCTORS d JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile WHERE d.id_doctor = ?', [id_doctor], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0 ? results[0] : null); // Mengembalikan objek dokter, atau null
            });
        });
    },

    findAllDoctors: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT d.*, u.username, u.email, p.nama_lengkap, p.no_telepon FROM DOCTORS d JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile', (err, results) => {
                if (err) return reject(err);
                resolve(results); // Mengembalikan array dokter
            });
        });
    },

    findAllServices: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM SERVICES', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    findUpcomingAppointmentsByPatientId: (id_patient) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT a.*, d.spesialisasi, p.nama_lengkap AS doctor_name, s.nama_layanan FROM APPOINTMENTS a JOIN DOCTORS d ON a.id_doctor = d.id_doctor JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile JOIN SERVICES s ON a.id_service = s.id_service WHERE a.id_patient = ? AND a.tanggal_janji >= CURDATE() AND a.status_janji IN ("Pending", "Confirmed") ORDER BY a.tanggal_janji ASC, a.waktu_janji ASC', [id_patient], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    findPastAppointmentsByPatientId: (id_patient) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT a.*, d.spesialisasi, p.nama_lengkap AS doctor_name, s.nama_layanan FROM APPOINTMENTS a JOIN DOCTORS d ON a.id_doctor = d.id_doctor JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile JOIN SERVICES s ON a.id_service = s.id_service WHERE a.id_patient = ? AND a.tanggal_janji < CURDATE() ORDER BY a.tanggal_janji DESC, a.waktu_janji DESC', [id_patient], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // --- PERBAIKAN PENTING PADA findById DAN findAll ---
    // Pastikan semua kolom yang diminta ada di tabel PROFILE dan USERS
    findById: (id_user) => {
        return new Promise((resolve, reject) => {
            // Hapus 'p.nik' jika kolom 'nik' tidak ada atau selalu NULL di tabel PROFILE Anda.
            // Atau pastikan kolom 'nik' memang ada dan terisi di tabel PROFILE
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap, p.jenis_kelamin, p.tanggal_lahir, p.alamat, p.no_telepon, p.nik FROM USERS u LEFT JOIN PROFILE p ON u.id_profile = p.id_profile WHERE u.id_user = ?', [id_user], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // PERBAIKAN PENTING PADA findAll - Ini adalah query yang menghasilkan data untuk tabel daftar pengguna
    findAll: () => {
        return new Promise((resolve, reject) => {
            console.log('userModel: findAll - Executing DB query for all users.');
            // Periksa kembali query ini
            // Hapus 'p.nik' jika kolom 'nik' tidak ada atau selalu NULL di tabel PROFILE Anda.
            // Atau pastikan kolom 'nik' memang ada dan terisi di tabel PROFILE
            db.query('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.nama_lengkap, p.jenis_kelamin, p.tanggal_lahir, p.alamat, p.no_telepon FROM USERS u LEFT JOIN PROFILE p ON u.id_profile = p.id_profile', (err, results) => { // Hapus 'p.nik' jika bermasalah
                console.log('userModel: findAll - DB query callback received!');
                if (err) {
                    console.error('userModel: findAll - Error in DB query:', err);
                    return reject(err);
                }
                console.log('userModel: findAll - DB query results (raw):', results);
                console.log('userModel: findAll - DB query results length:', results ? results.length : 0);
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
            db.query('UPDATE USERS SET reset_password_token = ?, reset_password_expires = ? WHERE id_user = ?', [token, expires, id_user], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    findByResetToken: (token) => {
        return new Promise((resolve, reject) => {
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