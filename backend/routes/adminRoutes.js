// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Untuk registrasi admin
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware otentikasi/otorisasi
const userController = require('../controllers/userController'); // Untuk operasi user management

// Middleware untuk melindungi route ini (isAdmin)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.id_level_user === 1) {
        next();
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Anda bukan Admin.' });
    }
};

// --- Route untuk Halaman Admin (GET requests) ---
router.get('/admin/register', protect, authorizeRoles([1]), (req, res) => {
    console.log('Admin Register page requested by authorized user.');
    res.render('admin/register'); // Menampilkan file admin/register.ejs
});

// --- Route API untuk Dashboard Admin ---

// GET /admin/dashboard-data
router.get('/admin/dashboard-data', protect, authorizeRoles([1]), userController.getAdminDashboardData);
console.log('AdminRoutes: Registered GET /admin/dashboard-data');

// --- Route API untuk Manajemen Pengguna ---

// GET /admin/users (Mengambil semua data pengguna)
router.get('/admin/users', protect, authorizeRoles([1]), userController.getAllUsers);
console.log('AdminRoutes: Registered GET /admin/users');

// POST /admin/users (Menambahkan pengguna baru)
router.post('/admin/users', protect, authorizeRoles([1]), userController.addUser);
console.log('AdminRoutes: Registered POST /admin/users');

// --- ROUTE KRITIS UNTUK EDIT: GET /admin/users/:id ---
// Mengambil detail satu pengguna berdasarkan ID (untuk edit)
router.get('/admin/users/:id', protect, authorizeRoles([1]), userController.getUserById);
console.log('AdminRoutes: Registered GET /admin/users/:id'); // <<-- LOG INI SEKARANG UNTUK ROUTE INI

// PUT /admin/users/:id (Mengedit data pengguna)
router.put('/admin/users/:id', protect, authorizeRoles([1]), userController.updateUser);
console.log('AdminRoutes: Registered PUT /admin/users/:id'); // <<-- LOG INI UNTUK ROUTE PUT

// DELETE /admin/users/:id (Menghapus atau menonaktifkan pengguna)
router.delete('/admin/users/:id', protect, authorizeRoles([1]), userController.deleteUser);
console.log('AdminRoutes: Registered DELETE /admin/users/:id');

// Mendapatkan daftar dokter dan layanan untuk form booking
router.get('/booking/form-data', protect, authorizeRoles([4]), userController.getBookingFormData);
console.log('AdminRoutes: Registered GET /booking/form-data');

// Mendapatkan jadwal kosong dokter berdasarkan ID dokter dan tanggal
router.get('/booking/available-slots', protect, authorizeRoles([4]), userController.getAvailableDoctorSlots); // Hanya pasien yang bisa akses

// Membuat janji temu baru
router.post('/booking/create', protect, authorizeRoles([4]), userController.bookAppointment); // Hanya pasien yang bisa akses

// POST /admin/register (Route API untuk proses registrasi admin)
router.post('/admin/register', protect, authorizeRoles([1]), authController.register);
console.log('AdminRoutes: Registered POST /admin/register');

// --- API DASHBOARD PASIEN ---
// URL: http://localhost:3000/pasien/dashboard-data
router.get('/pasien/dashboard-data', protect, authorizeRoles([4]), userController.getPatientDashboardData);
console.log('AdminRoutes: Registered GET /pasien/dashboard-data'); // Log untuk route pasien

// Ekspor router untuk digunakan di server.js
module.exports = router;