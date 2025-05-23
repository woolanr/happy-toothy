// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel'); // Jika perlu mencari user dari DB lagi (opsional)

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, config.jwtSecret);
            console.log('JWT decoded:', decoded);

            const users = await User.findById(decoded.id_user);
            if (users.length === 0) {
                return res.status(401).json({ message: 'Tidak terautentikasi: Token tidak valid.' });
            }
            req.user = users[0];

            next();

        } catch (error) {
            console.error('Error in JWT verification:', error);
            return res.status(401).json({ message: 'Tidak terautentikasi: Token tidak valid atau kadaluarsa.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak terautentikasi: Tidak ada token.' });
    }
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Tidak terautentikasi. Silakan login.' });
        }
        if (!roles.includes(req.user.id_level_user)) {
            console.log(`Akses ditolak untuk user ${req.user.username} (Level: ${req.user.id_level_user}) pada route: ${req.originalUrl}`);
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengakses halaman ini.' });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles }; // <<-- PASTIKAN BARIS INI PERSIS SEPERTI INI, DI BAGIAN PALING BAWAH FILE