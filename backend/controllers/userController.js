// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Pastikan db sudah diimpor jika diperlukan

const userController = {
    // Fungsi untuk menampilkan dashboard admin (misalnya data ringkasan)
    getAdminDashboardData: async (req, res) => {
        try {
            const loggedInUser = req.user;
            const adminProfile = await new Promise((resolve, reject) => {
                db.query('SELECT nama_lengkap, tanggal_lahir, jenis_kelamin FROM PROFILE WHERE id_profile = (SELECT id_profile FROM USERS WHERE id_user = ?)', [loggedInUser.id_user], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });
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

        res.status(200).json({
            message: 'Selamat datang di Dashboard Admin Happy Toothy!',
            user: { // Kirim detail user yang login
                    username: loggedInUser.username,
                    nama_lengkap: adminProfile ? adminProfile.nama_lengkap : 'Admin',
                    jenis_kelamin: adminProfile ? adminProfile.jenis_kelamin : '-',
                    usia: usia || '-'
                },
            summary: {
                totalUsers: 100,
                totalDoctors: 10,
                totalPatients: 80,
                pendingVerifications: 5
            }
        });
    } catch (error) {
        console.error('Error getting admin dashboard data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memuat data dashboard.' });
    }
    },

    // Fungsi untuk mendapatkan daftar semua pengguna
    getAllUsers: async (req, res) => {
        try {
            // Asumsi User.findAll mengembalikan Promise
            const users = await new Promise((resolve, reject) => {
                User.findAll((err, results) => { // Perlu implementasi User.findAll di userModel.js
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            res.status(200).json({ users });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengguna.' });
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

        // Validasi input (minimal satu field harus diisi)
        if (!nama_lengkap && !email && !username && !id_level_user && !id_status_valid) {
            return res.status(400).json({ message: 'Setidaknya satu field harus diisi untuk update.' });
        }

        try {
            // Temukan pengguna berdasarkan ID
            const users = await new Promise((resolve, reject) => {
                User.findById(id, (err, results) => { // Perlu implementasi findById di userModel.js
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            if (users.length === 0) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            const user = users[0];
            const updatedUserData = {};
            const updatedProfileData = {};

            if (username) updatedUserData.username = username;
            if (email) {
                updatedUserData.email = email;
                updatedProfileData.email = email; // Update juga di profile jika disimpan disana
            }
            if (id_level_user) updatedUserData.id_level_user = id_level_user;
            if (id_status_valid) updatedUserData.id_status_valid = id_status_valid;
            if (nama_lengkap) updatedProfileData.nama_lengkap = nama_lengkap;

            // Lakukan update ke tabel USERS
            if (Object.keys(updatedUserData).length > 0) {
                await new Promise((resolve, reject) => {
                    User.updateUser(id, updatedUserData, (err) => { // Perlu implementasi updateUser di userModel.js
                        if (err) return reject(err);
                        resolve();
                    });
                });
            }

            // Lakukan update ke tabel PROFILE (jika ada perubahan)
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