// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Middleware untuk melindungi route ini (contoh sederhana - PERLU IMPLEMENTASI YANG BENAR)
// Catatan: Ini adalah placeholder dan TIDAK AMAN untuk produksi!
const isAdmin = (req, res, next) => {
    // Di sini Anda perlu logika untuk memeriksa apakah pengguna adalah admin
    // Misalnya, periksa req.user (jika Anda menggunakan JWT) atau sesi
    // Untuk contoh ini, kita asumsikan selalu true (TIDAK AMAN untuk produksi)
if (req.user && req.user.id_level_user === 1) {
    next(); // Lanjutkan ke route adminRegister
    } else {
        // Jika tidak ada req.user atau id_level_user bukan 1, tolak akses
        // Ini akan sangat bergantung pada bagaimana middleware 'protect' Anda mengisi req.user
        return res.status(403).json({ message: 'Akses ditolak. Anda bukan Admin' });
    }

};

// Route untuk menampilkan halaman registrasi admin
// URL: http://localhost:3000/admin/register (untuk GET request dari browser)
router.get('/admin/register', protect, authorizeRoles([1]), (req, res) => {
    res.render('admin/register'); // Menampilkan file admin/register.ejs
});

// Route untuk Dashboard Admin (API)
// URL: http://localhost:3000/admin/dashboard-data (untuk GET request dari JS frontend)
router.get('/admin/dashboard-data', protect, authorizeRoles([1]), userController.getAdminDashboardData);

// Route untuk Manajemen Pengguna (API)
router.get('/admin/users', protect, authorizeRoles([1]), userController.getAllUsers); // Ambil semua pengguna
router.post('/admin/users', protect, authorizeRoles([1]), userController.addUser); // Tambah pengguna baru oleh admin
router.put('/admin/users/:id', protect, authorizeRoles([1]), userController.updateUser); // Edit pengguna
router.delete('/admin/users/:id', protect, authorizeRoles([1]), userController.deleteUser); // Hapus/nonaktifkan pengguna
router.post('/admin/register', protect, authorizeRoles([1]), authController.register); // Dihapus 'frontend/'

module.exports = router;