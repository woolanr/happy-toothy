// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

// Konfigurasi EJS untuk rendering views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Middleware
// Middleware CORS - IZINKAN HANYA DARI ORIGIN YANG DIKENAL DI PRODUKSI!
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk menghidangkan file statis (public folder)
// HARUS SEBELUM ROUTE HALAMAN dan API agar file seperti script.js bisa diakses
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Middleware Logging Sederhana untuk setiap request yang masuk
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// === ROUTE UNTUK MENGHIDANGKAN TAMPILAN (GET requests ke HTML/EJS pages) ===
// Pastikan ini adalah route GET untuk render halaman HTML/EJS
app.get('/', (req, res) => {
    console.log('Serving index page.');
    res.render('index');
});

app.get('/login', (req, res) => {
    console.log('Serving login page.');
    res.render('login');
});

app.get('/register', (req, res) => {
    console.log('Serving register page.');
    res.render('register');
});

app.get('/forgot-password', (req, res) => {
    console.log('Serving forgot-password page.');
    res.render('forgot-password');
});

app.get('/reset-password', (req, res) => {
    console.log('Serving reset-password page.');
    res.render('reset-password');
});

app.get('/admin/register', (req, res) => {
    console.log('Serving admin register page.');
    res.render('admin/register');
});

app.get('/admin/dashboard', (req, res) => {
    console.log('Serving admin dashboard page.');
    res.render('admin/dashboard');
});

app.get('/pasien/dashboard', (req, res) => {
    console.log('Serving pasien dashboard page.');
    res.render('pasien/dashboard');
});

// === GUNAKAN ROUTE API (POST, GET, PUT, DELETE) ===
// Pasang authRoutes. Ini akan menangani /login, /register, dll.
app.use('/', authRoutes);

// Pasang adminRoutes.
app.use('/', adminRoutes);


// === MIDDLEWARE PENANGANAN KESALAHAN ===
// Middleware untuk menangani 404 (Not Found) - harus diletakkan setelah semua route yang valid
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    console.warn(`[${new Date().toISOString()}] 404 Error: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'API endpoint not found. Please check the URL.' });
});

// Middleware Error Handling Global - harus diletakkan paling akhir
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] SERVER ERROR (Unhandled):`);
    console.error(err.stack); // Log stack trace lengkap untuk debugging
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Jika status masih 200, ubah ke 500
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        // Sertakan stack trace hanya di development environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Ini akan null karena tidak ada dotenv
    });
});

// Mulai server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    // console.log(`Environment: ${process.env.NODE_ENV || 'development'}`); // Hapus ini karena tidak ada dotenv
});