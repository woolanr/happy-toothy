// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel'); // Pastikan userModel.js sudah mengembalikan Promise
const { sendVerificationEmail } = require('../utils/email');
const db = require('../config/database'); // Pastikan Anda mengimpor koneksi db jika dipakai langsung di sini (contoh di register)

const authController = {
    register: async (req, res) => {
        const { nama_lengkap, email, username, password } = req.body;
        let id_level_user = req.body.id_level_user || 4; // Default ke 4 (Pasien) jika id_level_user tidak disediakan

        // Pastikan id_level_user adalah angka (jika dari dropdown frontend)
        id_level_user = parseInt(id_level_user); 

        // Validasi input dasar
        if (!nama_lengkap || !email || !username || !password) {
            return res.status(400).json({ message: 'Semua kolom harus diisi.' });
        }

        if (!username.trim() || !password.trim()) {
            return res.status(400).json({ message: 'Username dan password tidak boleh kosong.' });
        }

        try {
            // Cek apakah username sudah ada
            const existingUserByUsername = await User.findByUsername(username); // <-- Panggilan langsung
            if (existingUserByUsername.length > 0) {
                return res.status(409).json({ message: 'Username sudah terdaftar.' });
            }

            // Cek apakah email sudah ada
            const existingUserByEmail = await User.findByEmail(email); // <-- Panggilan langsung
            if (existingUserByEmail.length > 0) {
                return res.status(409).json({ message: 'Email sudah terdaftar.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Buat token verifikasi (hanya jika bukan admin)
            const verificationToken = (id_level_user !== 1) ? uuidv4() : null;

            // Data pengguna baru
            const newUser = {
                username,
                email,
                password: hashedPassword,
                id_profile: null, // Akan diisi setelah membuat profile
                id_level_user: id_level_user,
                id_status_valid: (id_level_user === 1) ? 1 : 2 // Langsung valid (1) jika admin, belum valid (2) jika bukan
            };

            // Simpan user baru ke database
            const userCreationResult = await User.createUser(newUser); // <-- Panggilan langsung
            const newUserId = userCreationResult.insertId;

            // Buat data profile (sesuaikan dengan tabel PROFILE Anda)
            const newProfile = {
                nama_lengkap,
                email // Jika Anda menduplikasi email di tabel PROFILE, sesuaikan desain DB Anda
                // Tambahkan kolom lain dari tabel PROFILE jika perlu
            };

            // Simpan profile baru ke database (asumsi db.query sudah di-wrap Promise di config/database.js atau langsung di sini)
            // Jika db.query di sini belum Promise-based, Anda perlu membungkusnya dengan new Promise()
            const profileCreationResult = await new Promise((resolve, reject) => {
                db.query('INSERT INTO PROFILE SET ?', newProfile, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            const newProfileId = profileCreationResult.insertId;

            // Update id_profile di tabel USERS
            // Asumsi db.query di sini belum Promise-based, Anda perlu membungkusnya dengan new Promise()
            await new Promise((resolve, reject) => {
                db.query('UPDATE USERS SET id_profile = ? WHERE id_user = ?', [newProfileId, newUserId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            // Kirim email verifikasi (hanya jika bukan admin)
            if (id_level_user !== 1) {
                sendVerificationEmail(email, verificationToken);
                return res.status(201).json({ message: 'Registrasi berhasil. Silakan periksa email Anda untuk verifikasi.' });
            } else {
                return res.status(201).json({ message: 'Registrasi admin berhasil.' });
            }

        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    verifyEmail: async (req, res) => {
        const { token } = req.params;

        if (!token) {
            return res.status(400).send('Token verifikasi diperlukan.');
        }

        try {
            const users = await User.findByVerificationToken(token); // <-- Panggilan langsung

            if (users.length === 0) {
                return res.status(404).send('Tautan verifikasi tidak valid atau sudah kadaluarsa.');
            }

            const user = users[0];

            await User.updateStatusValid(user.id_user, 1); // <-- Panggilan langsung, Menggunakan angka 1

            // Hapus atau invalidasi token verifikasi di DB (perlu implementasi tambahan di userModel.js)
            // await User.clearVerificationToken(user.id_user); // <-- Panggilan langsung jika diimplementasikan

            res.send('Email Anda berhasil diverifikasi. Sekarang Anda dapat <a href="/login">login</a>.');
        } catch (error) {
            console.error('Error during email verification:', error);
            res.status(500).send('Terjadi kesalahan server saat memverifikasi email.');
        }
    },

    login: async (req, res) => {
        console.log('Login request received for username:', req.body.username); // Log 1

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi.' });
        }

        try {
            console.log('Fetching user from DB...'); // Log 2
            const users = await User.findByUsername(username); // <-- Panggilan langsung
            console.log('User fetched from DB. Users array:', users); // Log 3


            if (users.length === 0) {
                console.log('User not found in DB.'); // Log 4
                return res.status(401).json({ message: 'Username atau password salah.' });
            }

            const user = users[0];
            console.log('User object fetched from DB:', user); // Log 5: Cetak objek user lengkap
            console.log('User ID Status Valid from DB:', user.id_status_valid); // Log 6: Cetak status validasi spesifik

            // Periksa status validasi (menggunakan angka 1)
            if (user.id_status_valid !== 1) { 
                console.log('Login failed: User status is not valid (current status:', user.id_status_valid, ').'); // Log 7: Pesan lebih jelas
                return res.status(401).json({ message: 'Akun Anda belum diverifikasi. Silakan periksa email Anda.' });
            }

            // Bandingkan password
            console.log('Comparing password using bcrypt...'); // Log 8: Perbaiki log ini
            console.log('Password from request:', password); // Log 9: Password dari form
            console.log('Hashed password from DB:', user.password); // Log 10: Password hash dari DB
            
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match status (isMatch):', isMatch); // Log 11: Hasil perbandingan


            if (!isMatch) {
                console.log('Login failed: Password mismatch. Sending 401 response.'); // Log 12: Pesan lebih jelas
                return res.status(401).json({ message: 'Username atau password salah.' });
            }

            // Login Berhasil
            console.log('Login successful! Sending 200 OK response.'); // Log 13: Pesan sukses
            res.status(200).json({
                message: 'Login berhasil!',
                user: {
                    id_user: user.id_user,
                    username: user.username,
                    id_level_user: user.id_level_user // Penting untuk frontend
                }
            });

        } catch (error) {
            console.error('Error during login process (caught by try...catch):', error); // Log 14: Pesan error umum
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email harus diisi.' });
        }

        try {
            const users = await User.findByEmail(email); // <-- Panggilan langsung

            if (users.length === 0) {
                return res.status(404).json({ message: 'Email tidak terdaftar.' });
            }

            const user = users[0];
            console.log('User object for forgot password:', user); // Tambahkan log ini
            const resetToken = uuidv4();

            await User.saveResetToken(user.id_user, resetToken); // <-- Panggilan langsung

            sendVerificationEmail(email, resetToken, 'resetPassword'); // Contoh: argumen ketiga untuk jenis email

            res.status(200).json({ message: 'Tautan reset password telah dikirim ke email Anda.' });
        } catch (error) {
            console.error('Error during forgot password:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token dan password baru harus diisi.' });
        }

        try {
            const users = await User.findByResetToken(token); // <-- Panggilan langsung

            if (users.length === 0) {
                return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kadaluarsa.' });
            }

            const user = users[0];

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await User.updatePassword(user.id_user, hashedPassword); // <-- Panggilan langsung
            await User.clearResetToken(user.id_user); // <-- Panggilan langsung

            res.status(200).json({ message: 'Password berhasil direset. Silakan login dengan password baru Anda.' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server saat mereset password.' });
        }
    }
};

module.exports = authController;