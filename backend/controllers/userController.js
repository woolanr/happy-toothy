// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Pastikan db sudah diimpor jika diperlukan

const userController = {
    // Fungsi untuk menampilkan dashboard admin (misalnya data ringkasan)
    getAdminDashboardData: async (req, res) => {
        try {
            const loggedInUser = req.user;

            // Ambil data profil admin yang login untuk nama lengkap, jenis kelamin, dan usia
            const adminProfileResults = await new Promise((resolve, reject) => {
                // Pastikan `db` di sini diakses dengan benar
                db.query('SELECT nama_lengkap, tanggal_lahir, jenis_kelamin FROM PROFILE WHERE id_profile = (SELECT id_profile FROM USERS WHERE id_user = ?)', [loggedInUser.id_user], (err, results) => {
                    if (err) return reject(err);
                    resolve(results); // Resolve dengan seluruh array results
                });
            });

             // Periksa apakah ada hasil untuk adminProfile sebelum mengakses results[0]
            const adminProfile = adminProfileResults && adminProfileResults.length > 0 ? adminProfileResults[0] : null;

            // Hitung usia dari tanggal_lahir
            let usia = null;
            if (adminProfile && adminProfile.tanggal_lahir) {
                const birthDate = new Date(adminProfile.tanggal_lahir);
                const today = new Date();
                usia = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    usia--;
                }
            }

            // --- Bagian untuk mengambil data ringkasan dinamis dari database ---
            // Menggunakan helper function agar kode lebih bersih
            const fetchCount = (query, params = []) => {
                return new Promise((resolve, reject) => {
                    db.query(query, params, (err, results) => {
                        if (err) return reject(err);
                        // Menggunakan operator && untuk safety check
                        resolve(results && results.length > 0 ? results[0].total : 0);
                    });
                });
            };
            const totalUsers = await fetchCount('SELECT COUNT(id_user) AS total FROM USERS');
            const totalDoctors = await fetchCount('SELECT COUNT(id_user) AS total FROM USERS WHERE id_level_user = 2');
            const totalPatients = await fetchCount('SELECT COUNT(id_user) AS total FROM USERS WHERE id_level_user = 4');
            const pendingVerifications = await fetchCount('SELECT COUNT(id_user) AS total FROM USERS WHERE id_status_valid = 2');
            // --- Akhir Bagian untuk mengambil data ringkasan dinamis ---

            res.status(200).json({
                message: 'Selamat datang di Dashboard Admin Happy Toothy!',
                user: { // Kirim detail user yang 
                    id_user: loggedInUser.id_user,
                    username: loggedInUser.username,
                    id_level_user: loggedInUser.id_level_user,
                    nama_lengkap: adminProfile ? adminProfile.nama_lengkap : 'Admin',
                    jenis_kelamin: adminProfile ? adminProfile.jenis_kelamin : '-',
                    usia: usia || '-'
                },
                summary: {
                    totalUsers: totalUsers,
                    totalDoctors: totalDoctors,
                    totalPatients: totalPatients,
                    pendingVerifications: pendingVerifications
                }
            });
        } catch (error) {
            console.error('userController: Error in getAdminDashboardData (caught by general catch):', error);
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    // Fungsi untuk mendapatkan daftar semua pengguna
    getAllUsers: async (req, res) => {
        try { 
            console.log('userController: getAllUsers called. Fetching all users from model.'); // LOG BARU
            const users = await User.findAll(); // Ini memanggil userModel.findAll()
            console.log('userController: getAllUsers - Users received from model:', users); // LOG BARU
            console.log('userController: getAllUsers - Number of users received:', users ? users.length : 0); // LOG BARU

            console.log('userController: getAllUsers - Sending 200 OK response with users data.'); // LOG BARU
            res.status(200).json({ users: users });
            console.log('userController: getAllUsers - Response sent.'); // LOG BARU
        } catch (error) {
            console.error('userController: getAllUsers - Error (caught by general catch):', error); // LOG BARU
            if (!res.headersSent) {
                res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil daftar pengguna.' });
            }
        }
    },

    // Fungsi untuk menambahkan pengguna baru secara manual oleh admin
    addUser: async (req, res) => {
        const { nama_lengkap, email, username, password, id_level_user } = req.body;

        // Validasi input
        if (!nama_lengkap || !email || !username || !password || !id_level_user) {
            return res.status(400).json({ message: 'Semua kolom harus diisi.' });
        }

        try {
            // Cek username dan email
            const existingUserByUsername = await new Promise((resolve, reject) => {
                User.findByUsername(username, (err, users) => {
                    if (err) return reject(err);
                    resolve(users);
                });
            });
            if (existingUserByUsername.length > 0) {
                return res.status(409).json({ message: 'Username sudah terdaftar.' });
            }

            const existingUserByEmail = await new Promise((resolve, reject) => {
                User.findByEmail(email, (err, users) => {
                    if (err) return reject(err);
                    resolve(users);
                });
            });
            if (existingUserByEmail.length > 0) {
                return res.status(409).json({ message: 'Email sudah terdaftar.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tentukan status validasi (admin bisa langsung validasi)
            const id_status_valid = (id_level_user === 1) ? 1 : 2; // Jika admin nambah admin lain, langsung valid

            const newUser = {
                username,
                email,
                password: hashedPassword,
                id_profile: null,
                id_level_user,
                id_status_valid
            };

            const userCreationResult = await new Promise((resolve, reject) => {
                User.createUser(newUser, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            const newUserId = userCreationResult.insertId;

            const newProfile = {
                nama_lengkap,
                email
                // Tambahkan kolom lain dari tabel PROFILE jika perlu
            };

            const profileCreationResult = await new Promise((resolve, reject) => {
                db.query('INSERT INTO PROFILE SET ?', newProfile, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            const newProfileId = profileCreationResult.insertId;

            await new Promise((resolve, reject) => {
                db.query('UPDATE USERS SET id_profile = ? WHERE id_user = ?', [newProfileId, newUserId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            res.status(201).json({ message: 'Pengguna berhasil ditambahkan.' });

        } catch (error) {
            console.error('Error adding user by admin:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pengguna.' });
        }
    },

    // Fungsi untuk mengedit informasi pengguna
    updateUser: async (req, res) => {
        const { id } = req.params; // ID pengguna yang akan diedit
        const { nama_lengkap, email, username, id_level_user, id_status_valid } = req.body;

       // Validasi input
        if (!id) {
            return res.status(400).json({ message: 'ID pengguna diperlukan untuk update.' });
        }
        if (!nama_lengkap && !email && !username && !id_level_user && !id_status_valid) {
            return res.status(400).json({ message: 'Setidaknya satu field harus diisi untuk update.' });
        }

        try {
            // Temukan pengguna berdasarkan ID untuk mendapatkan id_profile
            const users = await User.findById(id); // Pastikan findById mengembalikan Promise
            if (users.length === 0) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }
            const user = users[0];

            const updatedUserData = {};
            const updatedProfileData = {};

            // Hanya tambahkan ke objek update jika ada perubahan dari request body
            if (username !== undefined) updatedUserData.username = username;
            if (email !== undefined) {
                updatedUserData.email = email;
                updatedProfileData.email = email; // Update juga di profile jika disimpan disana
            }
            if (id_level_user !== undefined) updatedUserData.id_level_user = parseInt(id_level_user); // Pastikan int
            if (id_status_valid !== undefined) updatedUserData.id_status_valid = parseInt(id_status_valid); // Pastikan int
            if (nama_lengkap !== undefined) updatedProfileData.nama_lengkap = nama_lengkap;

            // Lakukan update ke tabel USERS
            if (Object.keys(updatedUserData).length > 0) {
                await User.updateUser(id, updatedUserData); // Pastikan updateUser mengembalikan Promise
            }

            // Lakukan update ke tabel PROFILE (jika ada perubahan dan id_profile tersedia)
            if (Object.keys(updatedProfileData).length > 0 && user.id_profile) {
                 await new Promise((resolve, reject) => {
                    db.query('UPDATE PROFILE SET ? WHERE id_profile = ?', [updatedProfileData, user.id_profile], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                 });
            }

            res.status(200).json({ message: 'Pengguna berhasil diperbarui.' });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui pengguna.' });
        }
    },

    // Fungsi untuk menghapus (atau menonaktifkan) pengguna
    deleteUser: async (req, res) => {
        const { id } = req.params; // ID pengguna yang akan dihapus

        try {
            // Implementasi deleteUser di userModel.js atau update status menjadi 'keluar'
            // Contoh: Mengubah id_status_valid menjadi 3 (keluar)
            await new Promise((resolve, reject) => {
                User.updateStatusValid(id, 3, (err) => { // Menggunakan id_status_valid=3 untuk "keluar"
                    if (err) return reject(err);
                    resolve();
                });
            });

            res.status(200).json({ message: 'Pengguna berhasil dinonaktifkan (status keluar).' });
            // Atau jika benar-benar ingin hapus:
            // await new Promise((resolve, reject) => {
            //     User.deleteUser(id, (err) => { // Perlu implementasi deleteUser di userModel.js
            //         if (err) return reject(err);
            //         resolve();
            //     });
            // });
            // res.status(200).json({ message: 'Pengguna berhasil dihapus.' });

        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pengguna.' });
        }
    }
};

module.exports = userController;