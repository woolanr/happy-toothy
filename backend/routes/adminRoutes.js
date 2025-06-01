// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Untuk registrasi admin
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware otentikasi/otorisasi
const userController = require('../controllers/userController'); // Untuk operasi user management

// --- Route API untuk Dashboard Admin ---
const isAdmin = (req, res, next) => {
    if (req.user && req.user.id_level_user === 1) {
        next();
    } else {
        return res.status(403).json({ message: 'Akses ditolak. Anda bukan Admin.' });
    }
};

// --- Route untuk Halaman Admin ---
router.get('/admin/register', protect, authorizeRoles([1]), (req, res) => {
    console.log('Admin Register page requested by authorized user.');
    res.render('admin/register');
});
// --- Route API untuk Dashboard Admin ---
router.get('/admin/dashboard-data', protect, authorizeRoles([1]), userController.getAdminDashboardData);
console.log('AdminRoutes: Registered GET /admin/dashboard-data');

// --- Route API untuk Manajemen Pengguna ---
router.get('/admin/users', protect, authorizeRoles([1]), userController.getAllUsers);
console.log('AdminRoutes: Registered GET /admin/users');
router.post('/admin/users', protect, authorizeRoles([1]), userController.addUser);
console.log('AdminRoutes: Registered POST /admin/users');

// --- Route Untuk Edit ---
router.get('/admin/users/:id', protect, authorizeRoles([1]), userController.getUserById);
console.log('AdminRoutes: Registered GET /admin/users/:id'); 
router.put('/admin/users/:id', protect, authorizeRoles([1]), userController.updateUser);
console.log('AdminRoutes: Registered PUT /admin/users/:id'); 
router.delete('/admin/users/:id', protect, authorizeRoles([1]), userController.deleteUser);
console.log('AdminRoutes: Registered DELETE /admin/users/:id');

// --- Route API untuk Manajemen Dokter ---
router.get('/admin/doctors', protect, authorizeRoles([1]), userController.getAllDoctors);
router.post('/admin/doctors', protect, authorizeRoles([1]), userController.createDoctor);
router.get('/admin/doctors/:id', protect, authorizeRoles([1]), userController.getDoctorByIdForEdit);
router.put('/admin/doctors/:id', protect, authorizeRoles([1]), userController.updateDoctor);
router.put('/admin/doctors/:id/deactivate', protect, authorizeRoles([1]), userController.deactivateDoctorAccount);

// --- Route API untuk Manajemen Pengguna ---
router.put('/admin/users/:id/activate', protect, authorizeRoles([1]), userController.activateUserAccount);
console.log('AdminRoutes: Registered PUT /admin/users/:id/activate');
router.put('/admin/users/:id/verify', protect, authorizeRoles([1]), userController.verifyUserAccount);
console.log('AdminRoutes: Registered PUT /admin/users/:id/verify');

// --- Route untuk Booking (oleh Pasien) ---
// ... (rute booking) ...

// --- Route API untuk Registrasi Admin ---
// ... (rute registrasi admin) ...

// --- API DASHBOARD PASIEN ---
// ... (rute dashboard pasien) ...

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