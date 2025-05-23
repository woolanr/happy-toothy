// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

// Konfigurasi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menghidangkan file statis (HARUS SEBELUM ROUTE HALAMAN)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes untuk menghidangkan tampilan (GET request)
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Route untuk halaman registrasi admin (menampilkan EJS)
// Ini adalah halaman visual untuk mengisi form registrasi admin
app.get('/admin/register', (req, res) => { // Route untuk halaman registrasi admin
    res.render('admin/register');
});

// --- TAMBAH ROUTE INI UNTUK MENAMPILKAN HALAMAN DASHBOARD ADMIN ---
// Ketika browser mengakses /admin/dashboard, render file dashboard.ejs
app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Gunakan authRoutes untuk route API otentikasi
app.use('/', authRoutes);

// Untuk API admin (termasuk registrasi admin) dan dashboard
app.use('/', adminRoutes)

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});