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
// Ini adalah route yang melayani halaman EJS, bukan API.
// Jika Anda ingin melindungi akses ke halaman EJS ini sendiri, tambahkan `protect` dan `authorizeRoles`.
router.get('/admin/register', protect, authorizeRoles([1]), (req, res) => {
    console.log('Admin Register page requested by authorized user.');
    res.render('admin/register'); // Menampilkan file admin/register.ejs
});


// --- Route API untuk Dashboard Admin ---

// GET /admin/dashboard-data
// Mengambil data ringkasan dashboard (total pengguna, total dokter, dll.)
router.get('/admin/dashboard-data', protect, authorizeRoles([1]), userController.getAdminDashboardData);
console.log('AdminRoutes: Registered GET /admin/dashboard-data');

// --- Route API untuk Manajemen Pengguna ---

// GET /admin/users
// Mengambil semua data pengguna untuk ditampilkan di daftar pengguna
// Ini adalah route yang menjadi masalah 'pending' Anda.
router.get('/admin/users', protect, authorizeRoles([1]), userController.getAllUsers);
console.log('AdminRoutes: Registered GET /admin/users');

// POST /admin/users
// Menambahkan pengguna baru (mungkin untuk digunakan oleh admin untuk membuat user baru)
router.post('/admin/users', protect, authorizeRoles([1]), userController.addUser);
console.log('AdminRoutes: Registered POST /admin/users');

// PUT /admin/users/:id
// Mengedit data pengguna berdasarkan ID
router.get('/admin/users/:id', protect, authorizeRoles([1]), userController.getUserById);
console.log('AdminRoutes: Registered PUT /admin/users/:id');

router.put('/admin/users/:id', protect, authorizeRoles([1]), userController.updateUser);

// DELETE /admin/users/:id
// Menghapus atau menonaktifkan pengguna berdasarkan ID
router.delete('/admin/users/:id', protect, authorizeRoles([1]), userController.deleteUser);
console.log('AdminRoutes: Registered DELETE /admin/users/:id');

// POST /admin/register
// Route API untuk proses registrasi admin
// Ini adalah API endpoint, bukan untuk menampilkan halaman
router.post('/admin/register', protect, authorizeRoles([1]), authController.register);
console.log('AdminRoutes: Registered POST /admin/register');


// Ekspor router untuk digunakan di server.js
module.exports = router;