// backend/controllers/userController.js
const User = require('../models/userModel'); // Pastikan User model sudah mengembalikan Promise
const bcrypt = require('bcrypt'); // Diimpor tapi tidak digunakan di controller ini
const db = require('../config/database'); // Pastikan db diimpor untuk query langsung

const userController = {
    // Fungsi untuk menampilkan dashboard admin (misalnya data ringkasan)
    getAdminDashboardData: async (req, res) => {
        try {
            const loggedInUser = req.user;

            // Ambil data profil admin yang login untuk nama lengkap, jenis kelamin, dan usia
            const adminProfileResults = await new Promise((resolve, reject) => {
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
                user: { // Kirim detail user yang login
                    id_user: loggedInUser.id_user,
                    username: loggedInUser.username,
                    id_level_user: loggedInUser.id_level_user,
                    nama_lengkap: adminProfile ? adminProfile.nama_lengkap : loggedInUser.username, // Gunakan username jika nama lengkap kosong
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
            console.log('userController: getAllUsers called. Fetching all users from model.');
            const users = await User.findAll(); // Ini memanggil userModel.findAll()
            console.log('userController: getAllUsers - Users received from model:', users);
            console.log('userController: getAllUsers - Number of users received:', users ? users.length : 0);

            console.log('userController: getAllUsers - Sending 200 OK response with users data.');
            res.status(200).json({ users: users });
            console.log('userController: getAllUsers - Response sent.');
        } catch (error) {
            console.error('userController: getAllUsers - Error (caught by general catch):', error);
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
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername.length > 0) {
                return res.status(409).json({ message: 'Username sudah terdaftar.' });
            }

            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail.length > 0) {
                return res.status(409).json({ message: 'Email sudah terdaftar.' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tentukan status validasi (admin bisa langsung validasi untuk admin, lainnya perlu verifikasi)
            // Asumsi id_level_user dari frontend sudah berupa angka
            const statusValid = (parseInt(id_level_user) === 1) ? 1 : 2; // Langsung valid (1) jika admin, belum valid (2) jika bukan

            const newUser = {
                username,
                email,
                password: hashedPassword,
                id_profile: null, // Akan diisi setelah membuat profile
                id_level_user: parseInt(id_level_user), // Pastikan ini integer
                id_status_valid: statusValid
            };

            // Simpan user baru ke database USERS
            const userCreationResult = await User.createUser(newUser);
            const newUserId = userCreationResult.insertId;

            // Buat data profile
            const newProfile = {
                nama_lengkap,
                email // Jika ada kolom lain di PROFILE, tambahkan di sini
                // jenis_kelamin: req.body.jenis_kelamin || null, // Contoh: jika ada dari form
                // tanggal_lahir: req.body.tanggal_lahir || null // Contoh: jika ada dari form
            };

            // Simpan profile baru ke database PROFILE
            const profileCreationResult = await new Promise((resolve, reject) => {
                db.query('INSERT INTO PROFILE SET ?', newProfile, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            const newProfileId = profileCreationResult.insertId;

            // Update id_profile di tabel USERS
            await new Promise((resolve, reject) => {
                db.query('UPDATE USERS SET id_profile = ? WHERE id_user = ?', [newProfileId, newUserId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            res.status(201).json({ message: 'Pengguna berhasil ditambahkan.' });

        } catch (error) {
            console.error('userController: Error adding user by admin:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pengguna.' });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params; // Ambil ID dari URL parameter

            // Pastikan User.findById ada di userModel.js dan mengembalikan Promise
            const users = await User.findById(id);

            if (users.length === 0) {
                // Jika user tidak ditemukan dengan ID tersebut
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }
            // Mengembalikan objek user pertama (karena ID harus unik)
            res.status(200).json({ users: users[0] }); // PASTIKAN MENGIRIM OBJEK, BUKAN ARRAY
        } catch (error) {
            console.error('userController: Error getting user by ID:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengguna untuk diedit.' });
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
        if (!nama_lengkap && !email && !username && id_level_user === undefined && id_status_valid === undefined) { // Cek undefined untuk level/status
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
            // Pastikan User.updateStatusValid ada dan mengembalikan Promise
            await User.updateStatusValid(id, 3); // Soft delete
            // Pastikan ini adalah SATU-SATUNYA respons sukses
            res.status(200).json({ message: 'Pengguna berhasil dinonaktifkan (status keluar).' });
        } catch (error) {
            console.error('userController: Error deleting user:', error);
            // Pastikan ini adalah SATU-SATUNYA respons error
            if (!res.headersSent) {
                res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pengguna.' });
            }
        }
    },

    getPatientDashboardData: async (req, res) => {
        try {
            // req.user akan berisi data user yang login dari JWT (disetel oleh protect middleware)
            const loggedInUser = req.user; 
            console.log('userController: getPatientDashboardData called for user:', loggedInUser.username, 'ID:', loggedInUser.id_user);

            // Pastikan req.user tersedia. Middleware 'protect' yang seharusnya mengisinya.
            if (!loggedInUser || !loggedInUser.id_user) {
                console.error('userController: req.user is undefined or missing id_user. Not authenticated or user data missing.');
                return res.status(401).json({ message: 'Akses ditolak. Informasi pengguna tidak tersedia.' });
            }
            // Pindahkan validasi level ke sini
            if (loggedInUser.id_level_user !== 4) { 
                console.log('userController: Access denied, user is not a patient (id_level_user is not 4). Current level:', loggedInUser.id_level_user);
                return res.status(403).json({ message: 'Akses ditolak. Anda bukan pasien.' });
            }

            const userProfileResults = await User.findById(loggedInUser.id_user); 
            console.log('userController: User profile raw results from DB:', userProfileResults); 

            if (!userProfileResults || userProfileResults.length === 0) { 
                console.error('userController: Patient with ID:', loggedInUser.id_user, 'not found in database, or profile is missing.');
                return res.status(404).json({ message: 'Data pasien tidak ditemukan.' });
            }

            const userProfile = userProfileResults[0]; 
            console.log('userController: Final userProfile object for response:', userProfile); 

            // Hitung usia
            let usia = null;
            if (userProfile.tanggal_lahir) {
                const birthDate = new Date(userProfile.tanggal_lahir);
                const today = new Date();
                usia = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    usia--;
                }
            }

            // TODO: Ambil data janji temu mendatang dan riwayat kunjungan dari database
            const upcomingAppointments = await User.findUpcomingAppointmentsByPatientId(loggedInUser.id_user);
            const visitHistory = await User.findPastAppointmentsByPatientId(loggedInUser.id_user);
            console.log('userController: Upcoming Appointments:', upcomingAppointments.length, 'Visit History:', visitHistory.length);

            res.status(200).json({
                message: 'Selamat datang di Dashboard Pasien!',
                userProfile: { 
                    id_user: userProfile.id_user,
                    username: userProfile.username,
                    email: userProfile.email,
                    nama_lengkap: userProfile.nama_lengkap || '-',
                    jenis_kelamin: userProfile.jenis_kelamin || '-',
                    usia: usia || '-',
                    no_telepon: userProfile.no_telepon || '-',
                    alamat: userProfile.alamat || '-'
                },
                upcomingAppointments: upcomingAppointments,
                visitHistory: visitHistory
            });
            console.log('userController: Sent patient dashboard data response.'); 

        } catch (error) {
            console.error('userController: Error getting patient dashboard data (caught by general catch):', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat data dashboard pasien.' });
        }
    },
    
    getBookingFormData: async (req, res) => {
        try {
            const doctors = await User.findAllDoctors(); // Ambil semua dokter
            const services = await User.findAllServices(); // Ambil semua layanan

            res.status(200).json({
                doctors: doctors,
                services: services
            });
        } catch (error) {
            console.error('userController: Error getting booking form data:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat data booking.' });
        }
    },

    // --- FUNGSI BARU: MENDAPATKAN JADWAL DOKTER YANG TERSEDIA ---
    getAvailableDoctorSlots: async (req, res) => {
        const { id_doctor, date } = req.query; // Ambil dari query parameter (misal: ?id_doctor=1&date=2025-06-01)

        if (!id_doctor || !date) {
            return res.status(400).json({ message: 'ID dokter dan tanggal diperlukan.' });
        }

        try {
            const schedules = await User.findAvailableDoctorSchedules(id_doctor, date);
            res.status(200).json({ schedules: schedules });
        } catch (error) {
            console.error('userController: Error getting available doctor slots:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat jadwal dokter.' });
        }
    },

    // --- FUNGSI BARU: MEMBUAT JANJI TEMU OLEH PASIEN ---
    bookAppointment: async (req, res) => {
        const { id_doctor, id_service, tanggal_janji, waktu_janji, catatan_pasien } = req.body;
        const id_patient = req.user.id_user; // ID pasien dari JWT

        if (!id_doctor || !id_service || !tanggal_janji || !waktu_janji) {
            return res.status(400).json({ message: 'Dokter, layanan, tanggal, dan waktu janji diperlukan.' });
        }

        try {
            // Validasi tambahan: Pastikan slot waktu yang dipilih masih tersedia
            // Ini akan memanggil fungsi findAvailableDoctorSchedules lagi atau membuat yang baru
            // Anda perlu memeriksa apakah slot yang diminta memang tersedia sebelum menyimpan
            const availableSlots = await User.findAvailableDoctorSchedules(id_doctor, tanggal_janji);
            const isSlotAvailable = availableSlots.some(slot => 
                slot.waktu_mulai.slice(0, 5) === waktu_janji.slice(0, 5) // Bandingkan hanya jam dan menit
            );

            if (!isSlotAvailable) {
                return res.status(409).json({ message: 'Slot janji temu sudah terisi atau tidak tersedia.' });
            }

            const appointmentData = {
                id_patient,
                id_doctor,
                id_service,
                tanggal_janji,
                waktu_janji,
                catatan_pasien: catatan_pasien || null,
                status_janji: 'Pending' // Status awal saat booking
            };

            const result = await User.createAppointment(appointmentData);
            res.status(201).json({ message: 'Janji temu berhasil dibuat.', id_appointment: result.insertId });

        } catch (error) {
            console.error('userController: Error booking appointment:', error);
            res.status(500).json({ message: 'Terjadi kesalahan saat membuat janji temu.' });
        }
    }
};

module.exports = userController;