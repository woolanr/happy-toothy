// backend/controllers/userController.js
const User = require('../models/userModel'); // Ini adalah model yang sudah di-promisify penuh
const bcrypt = require('bcrypt'); // Diperlukan untuk addUser jika ada password baru

const userController = {
    // Fungsi untuk mendapatkan data ringkasan dashboard Admin
    getAdminDashboardData: async (req, res) => {
        console.log('userController: getAdminDashboardData called.');
        try {
            const loggedInUser = req.user; // Data user dari JWT di protect middleware

            // Ambil data profil admin yang login menggunakan User.findById
            const adminProfile = await User.findById(loggedInUser.id_user); 
            // Pastikan adminProfile bukan null sebelum mengakses propertinya
            if (!adminProfile) {
                console.error('userController: Admin profile not found for ID:', loggedInUser.id_user);
                return res.status(404).json({ message: 'Data profil admin tidak ditemukan.' });
            }

            // Hitung usia dari tanggal_lahir
            let usia = null;
            if (adminProfile.tanggal_lahir) {
                const birthDate = new Date(adminProfile.tanggal_lahir);
                const today = new Date();
                usia = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    usia--;
                }
            }

            // --- Bagian untuk mengambil data ringkasan dinamis dari database ---
            // Menggunakan User model yang sudah di-promisify
            const allUsers = await User.findAll(); // Mendapatkan semua user dari DB
            const totalUsers = allUsers.length;

            const totalDoctors = allUsers.filter(user => user.id_level_user === 2).length;
            const totalPatients = allUsers.filter(user => user.id_level_user === 4).length;
            const pendingVerifications = allUsers.filter(user => user.id_status_valid === 2).length;
            
            // Anda bisa tambahkan statistik janji temu hari ini, dll.
            // const totalAppointmentsToday = await User.countAppointmentsToday(); // Contoh, butuh fungsi di model

            res.status(200).json({
                message: 'Selamat datang di Dashboard Admin Happy Toothy!',
                user: { // Kirim detail user yang login
                    id_user: loggedInUser.id_user,
                    username: loggedInUser.username,
                    id_level_user: loggedInUser.id_level_user,
                    nama_lengkap: adminProfile.nama_lengkap || loggedInUser.username, 
                    jenis_kelamin: adminProfile.jenis_kelamin || '-',
                    usia: usia || '-'
                },
                summary: {
                    totalUsers: totalUsers,
                    totalDoctors: totalDoctors,
                    totalPatients: totalPatients,
                    pendingVerifications: pendingVerifications
                }
            });
            console.log('userController: getAdminDashboardData - Response sent.');

        } catch (error) {
            console.error('userController: Error in getAdminDashboardData (caught by general catch):', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ message: 'Terjadi kesalahan server saat memuat data dashboard admin.' });
        }
    },

    // Fungsi untuk mendapatkan daftar semua pengguna
    getAllUsers: async (req, res) => {
        console.log('userController: getAllUsers called. Fetching all users from model.');
        try {
            const users = await User.findAll(); 
            console.log('userController: getAllUsers - Users received from model:', users.length);

            res.status(200).json({ users: users });
            console.log('userController: getAllUsers - Response sent.');
        } catch (error) {
            console.error('userController: getAllUsers - Error (caught by general catch):', error);
            console.error('Error Stack:', error.stack);
            res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil daftar pengguna.' });
        }
    },

    // Fungsi untuk menambahkan pengguna baru secara manual oleh admin
    addUser: async (req, res) => {
        console.log('userController: addUser called.');
        const { nama_lengkap, email, username, password, id_level_user } = req.body;

        if (!nama_lengkap || !email || !username || !password || !id_level_user) {
            return res.status(400).json({ message: 'Semua kolom harus diisi.' });
        }

        try {
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername.length > 0) {
                return res.status(409).json({ message: 'Username sudah terdaftar.' });
            }
            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail.length > 0) {
                return res.status(409).json({ message: 'Email sudah terdaftar.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            const id_status_valid = 1; // Admin membuat user biasanya langsung valid

            // Panggil createFullUser dari User model
            const userCreationResult = await User.createFullUser({
                username,
                email,
                password: hashedPassword,
                nama_lengkap,
                id_level_user: parseInt(id_level_user), 
                id_status_valid,
                verification_token: null, // Admin tidak perlu verifikasi
                verification_expires: null
            });

            res.status(201).json({ 
                message: 'Pengguna baru berhasil ditambahkan.',
                userId: userCreationResult.newUserId
            });
            console.log('userController: addUser - User added successfully.');

        } catch (error) {
            console.error('userController: Error adding user by admin:', error);
            console.error('Error Stack:', error.stack);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
            }
            res.status(500).json({ message: 'Gagal menambahkan pengguna baru.' });
        }
    },

    // Fungsi untuk mendapatkan detail pengguna berdasarkan ID (untuk edit)
    getUserById: async (req, res) => {
        console.log('userController: getUserById called.');
        try {
            const { id } = req.params; 
            const user = await User.findById(id); // Memanggil User.findById yang sudah diperbaiki

            if (!user) { // Cek langsung objek user, bukan users.length
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }
            res.status(200).json({ users: user }); // Mengirim objek user, bukan array users[0]
            console.log('userController: getUserById - User data sent.');
        } catch (error) {
            console.error('userController: Error getting user by ID:', error);
            console.error('Error Stack:', error.stack);
            res.status(500).json({ message: 'Gagal memuat data pengguna untuk diedit.' });
        }
    },

    // Fungsi untuk mengupdate data pengguna (oleh admin)
    updateUser: async (req, res) => {
        console.log('userController: updateUser called.');
        const userId = req.params.id;
        const { nama_lengkap, email, username, id_level_user, id_status_valid } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'ID pengguna diperlukan untuk update.' });
        }

        try {
            const user = await User.findById(userId); 
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }
            
            const updatedUserData = {};
            const updatedProfileData = {};

            if (username !== undefined) updatedUserData.username = username;
            if (email !== undefined) {
                updatedUserData.email = email;
                updatedProfileData.email = email; 
            }
            if (id_level_user !== undefined) updatedUserData.id_level_user = parseInt(id_level_user); 
            if (id_status_valid !== undefined) updatedUserData.id_status_valid = parseInt(id_status_valid); 
            if (nama_lengkap !== undefined) updatedProfileData.nama_lengkap = nama_lengkap;

            // Lakukan update ke tabel USERS
            if (Object.keys(updatedUserData).length > 0) {
                await User.updateUser(userId, updatedUserData); 
            }

            // Lakukan update ke tabel PROFILE (jika ada perubahan dan id_profile tersedia)
            if (Object.keys(updatedProfileData).length > 0 && user.id_profile) {
                 await User.updateProfile(user.id_profile, updatedProfileData); // Ini masih butuh User.updateProfile
            }

            res.status(200).json({ message: 'Pengguna berhasil diperbarui.' });
            console.log('userController: updateUser - User data updated successfully.');

        } catch (error) {
            console.error('userController: Error updating user:', error);
            console.error('Error Stack:', error.stack);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
            }
            res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
        }
    },

    // Fungsi untuk menghapus (atau menonaktifkan) pengguna
    deleteUser: async (req, res) => {
        console.log('userController: deleteUser called.');
        const userId = req.params.id;
        try {
            await User.updateStatusValid(userId, 3); // Soft delete (status keluar)
            res.status(200).json({ message: 'Pengguna berhasil dinonaktifkan (status keluar).' });
            console.log('userController: deleteUser - User deactivated successfully.');
        } catch (error) {
            console.error('userController: Error in deleteUser:', error);
            console.error('Error Stack:', error.stack);
            res.status(500).json({ message: 'Terjadi kesalahan saat menonaktifkan pengguna.' });
        }
    },

    getAllDoctors: async (req, res) => {
        console.log('userController: getAllDoctors called.');
        try {
            const doctors = await User.findAllDoctors();

            console.log('userController: getAllDoctors - Doctors received from model:', doctors.length);
            res.status(200).json({ success: true, data: doctors });
            console.log('userController: getAllDoctors - Response sent.');
            
        } catch (error) {
            console.error('userController: Error in getAllDoctors:', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mengambil daftar dokter.' });
        }
    },

    getPatientDashboardData: async (req, res) => {
        console.log('userController: getPatientDashboardData called.');
        const id_patient = req.user.id_user; 

        if (!req.user || !id_patient) {
            console.error('userController: req.user is undefined or missing id_user.');
            return res.status(401).json({ message: 'Akses ditolak. Informasi pengguna tidak tersedia.' });
        }
        if (req.user.id_level_user !== 4) { 
            console.log('userController: Access denied, user is not a patient. Current level:', req.user.id_level_user);
            return res.status(403).json({ message: 'Akses ditolak. Anda bukan pasien.' });
        }

        try {
            const userProfile = await User.findById(id_patient); 
            if (!userProfile) { 
                console.error('userController: Patient with ID:', id_patient, 'not found or profile missing.');
                return res.status(404).json({ message: 'Data pasien tidak ditemukan.' });
            }

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

            const upcomingAppointments = await User.findUpcomingAppointmentsByPatientId(id_patient);
            const visitHistory = await User.findPastAppointmentsByPatientId(id_patient);
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
            console.error('userController: Error getting patient dashboard data:', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat data dashboard pasien.' });
        }
    },
    
    getBookingFormData: async (req, res) => {
        console.log('userController: getBookingFormData called.');
        try {
            const doctors = await User.findAllDoctors(); 
            const services = await User.findAllServices(); 

            res.status(200).json({
                doctors: doctors,
                services: services
            });
            console.log('userController: getBookingFormData - Data sent.');
        } catch (error) {
            console.error('userController: Error getting booking form data:', error);
            console.error('Error Stack:', error.stack);
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat data booking.' });
        }
    },

    getAvailableDoctorSlots: async (req, res) => {
        const { id_doctor, date } = req.query; 
        console.log('userController: getAvailableDoctorSlots called for doctor:', id_doctor, 'date:', date); 

        if (!id_doctor || !date) {
            return res.status(400).json({ message: 'ID dokter dan tanggal diperlukan.' });
        }

        try {
            console.log('userController: Calling User.findAvailableDoctorSchedules...'); 
            const schedules = await User.findAvailableDoctorSchedules(id_doctor, date);
            console.log('userController: Received schedules from model:', schedules); 
            res.status(200).json({ schedules: schedules });
        } catch (error) {
            console.error('userController: Error getting available doctor slots:', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ message: 'Terjadi kesalahan saat memuat jadwal dokter.' });
        }
    },

    bookAppointment: async (req, res) => {
        console.log('userController: bookAppointment called.');
        const { id_doctor, id_service, tanggal_janji, waktu_janji, catatan_pasien } = req.body;
        const id_patient = req.user.id_user; 

        if (!id_doctor || !id_service || !tanggal_janji || !waktu_janji) {
            return res.status(400).json({ message: 'Dokter, layanan, tanggal, dan waktu janji diperlukan.' });
        }

        try {
            const parsedDoctorId = parseInt(id_doctor);
            const parsedServiceId = parseInt(id_service);

            const availableSchedules = await User.findAvailableDoctorSchedules(parsedDoctorId, tanggal_janji);
            const isSlotAvailable = availableSchedules.some(slot =>
                slot.waktu_mulai.substring(0, 5) === waktu_janji.substring(0, 5) 
            );

            if (!isSlotAvailable) {
                return res.status(409).json({ message: 'Slot janji temu sudah terisi atau tidak tersedia.' });
            }

            const appointmentData = {
                id_patient,
                id_doctor: parsedDoctorId,
                id_service: parsedServiceId,
                tanggal_janji,
                waktu_janji,
                catatan_pasien: catatan_pasien || null,
                status_janji: 'Pending' 
            };

            const result = await User.createAppointment(appointmentData);
            res.status(201).json({ message: 'Janji temu berhasil dibuat.', id_appointment: result.insertId });
            console.log('userController: bookAppointment - Appointment created.');

        } catch (error) {
            console.error('userController: Error booking appointment:', error);
            console.error('Error Stack:', error.stack); 
            res.status(500).json({ message: 'Terjadi kesalahan saat membuat janji temu.' });
        }
    }
};

module.exports = userController;