// backend/models/userModel.js
const db = require('../config/database'); // Ini adalah Promise Pool dari mysql2/promise

const User = {
    // --- FUNGSI AUTHENTIKASI UTAMA ---
    findByUsername: async (username) => {
        const [rows] = await db.execute('SELECT * FROM USERS WHERE username = ?', [username]);
        return rows; // Mengembalikan array
    },
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM USERS WHERE email = ?', [email]);
        return rows;
    },
    findById: async (id_user) => {
        const [rows] = await db.execute(`
            SELECT 
                u.id_user, 
                u.username, 
                u.email, 
                u.id_level_user, 
                u.id_status_valid,
                u.verification_token,
                u.verification_expires,
                p.id_profile, 
                p.nama_lengkap, 
                p.jenis_kelamin, 
                p.tanggal_lahir, 
                p.alamat, 
                p.no_telepon
            FROM USERS u 
            LEFT JOIN PROFILE p ON u.id_profile = p.id_profile 
            WHERE u.id_user = ?
        `, [id_user]);
        return rows.length > 0 ? rows[0] : null; 
    },

    // --- FUNGSI UTAMA: CREATE USER DAN PROFILE DALAM SATU TRANSAKSI ---
    createFullUser: async (data) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insert ke tabel PROFILE
            const profileData = {
                nama_lengkap: data.nama_lengkap,
                email: data.email,
                // Tambahkan kolom lain dari tabel PROFILE yang relevan di sini jika ada di form registrasi
                // Misalnya: nik, alamat, no_telepon, id_divisi (jika tidak null)
            };
            const [profileResult] = await connection.execute(
                'INSERT INTO PROFILE (nama_lengkap, email) VALUES (?, ?)', // <-- PERBAIKAN DI SINI
                [profileData.nama_lengkap, profileData.email] // <-- Pastikan urutan nilai sesuai kolom
            );
            const newProfileId = profileResult.insertId;

            // 2. Insert ke tabel USERS
            const userFields = [
                'username', 'email', 'password', 'id_profile',
                'id_level_user', 'id_status_valid', 'verification_token', 'verification_expires'
            ];
            const userValues = [
                data.username, data.email, data.password, newProfileId,
                data.id_level_user, data.id_status_valid, data.verification_token, data.verification_expires
            ];

            const [userResult] = await connection.execute(
                `INSERT INTO USERS (${userFields.join(', ')}) VALUES (${userFields.map(() => '?').join(', ')})`,
                userValues
            );
            const newUserId = userResult.insertId;

            await connection.commit(); // Komit transaksi
            return { newUserId, newProfileId };

        } catch (error) {
            await connection.rollback(); // Rollback jika ada error
            console.error('Transaction failed in createFullUser (SQL Error):', error); // Lebih spesifik lognya
            throw error;
        } finally {
            connection.release();
        }
    },

    // --- FUNGSI VERIFIKASI & RESET TOKEN (Diubah ke async/await) ---
    updateStatusValid: async (id_user, id_status_valid) => {
        const [result] = await db.execute('UPDATE USERS SET id_status_valid = ? WHERE id_user = ?', [id_status_valid, id_user]);
        return result;
    },

    findByVerificationToken: async (token) => {
        const [rows] = await db.execute('SELECT * FROM USERS WHERE verification_token = ? AND verification_expires > NOW()', [token]);
        return rows;
    },

    clearVerificationToken: async (id_user) => {
        const [result] = await db.execute('UPDATE USERS SET verification_token = NULL, verification_expires = NULL WHERE id_user = ?', [id_user]);
        return result;
    },

    // --- FUNGSI UNTUK KIRIM ULANG VERIFIKASI (Diubah ke async/await) ---
    updateVerificationToken: async (id_user, newToken, newExpires) => {
        const [result] = await db.execute(
            'UPDATE USERS SET verification_token = ?, verification_expires = ? WHERE id_user = ?',
            [newToken, newExpires, id_user]
        );
        return result;
    },

    // --- FUNGSI RESET PASSWORD (Diubah ke async/await) ---
    saveResetToken: async (id_user, token, expires) => {
        const [result] = await db.execute('UPDATE USERS SET reset_password_token = ?, reset_password_expires = ? WHERE id_user = ?', [token, expires, id_user]);
        return result;
    },

    findByResetToken: async (token) => {
        const [rows] = await db.execute('SELECT * FROM USERS WHERE reset_password_token = ? AND reset_password_expires > NOW()', [token]);
        return rows;
    },

    updatePassword: async (id_user, hashedPassword) => {
        const [result] = await db.execute('UPDATE USERS SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [hashedPassword, id_user]);
        return result;
    },

    clearResetToken: async (id_user) => {
        const [result] = await db.execute('UPDATE USERS SET reset_password_token = NULL, reset_password_expires = NULL WHERE id_user = ?', [id_user]);
        return result;
    },

    // --- FUNGSI DOKTER DAN LAYANAN (Diubah ke async/await) ---
    findDoctorById: async (id_doctor) => {
        const [rows] = await db.execute('SELECT d.*, u.username, u.email, p.nama_lengkap FROM DOCTORS d JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile WHERE d.id_doctor = ?', [id_doctor]);
        return rows.length > 0 ? rows[0] : null;
    },

    findAllDoctors: async () => {
        const [rows] = await db.execute('SELECT d.*, u.username, u.email, p.nama_lengkap, p.no_telepon FROM DOCTORS d JOIN USERS u ON d.id_user = u.id_user JOIN PROFILE p ON u.id_profile = p.id_profile');
        return rows;
    },

    findAllDoctorsWithDetails: async () => {
        console.log('userModel: findAllDoctorsWithDetails called.'); // Tambahkan log untuk memastikan
        const query = `
            SELECT 
                d.id_doctor,
                u.id_user,
                u.username,
                u.nama_lengkap,
                u.email,
                u.no_telp, 
                d.spesialisasi,
                d.lisensi_no,
                d.pengalaman_tahun
            FROM 
                doctors d
            JOIN 
                users u ON d.id_user = u.id_user
            WHERE 
                u.id_level_user = 2 
                AND u.id_status_valid = 1; 
        `;
        try {
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error("Error in User.findAllDoctorsWithDetails model:", error);
            throw error;
        }
    },

    findAllServices: async () => {
        const [rows] = await db.execute('SELECT * FROM SERVICES');
        return rows;
    },

    // --- FUNGSI BOOKING & APPOINTMENT (Diubah ke async/await) ---
    findAvailableDoctorSchedules: async (id_doctor, date) => {
        console.log('userModel: findAvailableDoctorSchedules - Executing DB query.');
        console.log('userModel: Query params:', [id_doctor, date, date]);
        const [rows] = await db.execute(`
            SELECT
                ds.id_schedule, ds.waktu_mulai, ds.waktu_selesai
            FROM DOCTOR_SCHEDULES ds
            WHERE ds.id_doctor = ?
            AND ds.hari_dalam_minggu = DAYOFWEEK(?)
            AND ds.is_available = TRUE
            AND NOT EXISTS (
                SELECT 1
                FROM APPOINTMENTS a
                JOIN SERVICES s ON a.id_service = s.id_service
                WHERE a.id_doctor = ds.id_doctor
                AND a.tanggal_janji = ?
                AND (
                    TIME_TO_SEC(a.waktu_janji) < TIME_TO_SEC(ds.waktu_selesai) 
                    AND TIME_TO_SEC(a.waktu_janji) + COALESCE(s.durasi_menit, 0) * 60 > TIME_TO_SEC(ds.waktu_mulai)
                )
            )
            ORDER BY ds.waktu_mulai ASC
        `, [id_doctor, date, date]);
        console.log('userModel: findAvailableDoctorSchedules - DB query results:', rows);
        return rows;
    },

    createAppointment: async (appointmentData) => {
        const [result] = await db.execute('INSERT INTO APPOINTMENTS SET ?', [appointmentData]);
        return result;
    },

    findUpcomingAppointmentsByPatientId: async (id_patient) => {
        const [rows] = await db.execute(`
            SELECT 
            a.id_appointment, a.tanggal_janji, a.waktu_janji, a.status_janji, a.catatan_pasien,
            d.spesialisasi, 
            p.nama_lengkap AS doctor_name, 
            s.nama_layanan
            FROM APPOINTMENTS a
            JOIN DOCTORS d ON a.id_doctor = d.id_doctor
            JOIN USERS u_doctor ON d.id_user = u_doctor.id_user
            JOIN PROFILE p ON u_doctor.id_profile = p.id_profile
            JOIN SERVICES s ON a.id_service = s.id_service
            WHERE a.id_patient = ? 
            AND a.tanggal_janji >= CURDATE()
            AND a.status_janji IN ('Pending', 'Confirmed', 'Rescheduled')
            ORDER BY a.tanggal_janji ASC, a.waktu_janji ASC
            `, [id_patient]);
        return rows;
    },

    findPastAppointmentsByPatientId: async (id_patient) => {
        const [rows] = await db.execute(`
            SELECT 
                a.id_appointment, a.tanggal_janji, a.waktu_janji, a.status_janji, a.catatan_pasien,
                d.spesialisasi, 
                p.nama_lengkap AS doctor_name, 
                s.nama_layanan
            FROM APPOINTMENTS a
            JOIN DOCTORS d ON a.id_doctor = d.id_doctor
            JOIN USERS u_doctor ON d.id_user = u_doctor.id_user
            JOIN PROFILE p ON u_doctor.id_profile = p.id_profile
            JOIN SERVICES s ON a.id_service = s.id_service
            WHERE a.id_patient = ? 
            AND (a.tanggal_janji < CURDATE() OR a.status_janji IN ('Completed', 'Cancelled'))
            ORDER BY a.tanggal_janji DESC, a.waktu_janji DESC
            `, [id_patient]);
        return rows;
    },

    // --- FUNGSI PENGELOLAAN USER (Diubah ke async/await) ---
    findAll: async () => {
        console.log('userModel: findAll - Executing DB query for all users.');
        const [rows] = await db.execute('SELECT u.id_user, u.username, u.email, u.id_level_user, u.id_status_valid, p.id_profile, p.nama_lengkap, p.jenis_kelamin, p.tanggal_lahir, p.alamat, p.no_telepon FROM USERS u LEFT JOIN PROFILE p ON u.id_profile = p.id_profile');
        console.log('userModel: findAll - DB query results:', rows);
        console.log('userModel: findAll - DB query results length:', rows ? rows.length : 0);
        return rows;
    },

    updateUser: async (id_user, userData) => {
        // CATATAN: Jika userData mengandung field PROFILE, ini harus di-handle dengan UPDATE JOIN atau fungsi terpisah di model PROFILE.
        const [result] = await db.execute('UPDATE USERS SET ? WHERE id_user = ?', [userData, id_user]);
        return result;
    },

};

module.exports = User;