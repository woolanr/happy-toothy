// backend/utils/email.js
const nodemailer = require('nodemailer');

// Konfigurasi transporter email (ganti dengan informasi akun email kamu)
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Contoh: 'Gmail', 'SMTP'
    auth: {
        user: 'admhappytoothy@gmail.com', // Ganti dengan alamat email kamu
        pass: 'qlvi ttbk yvcm tspf'  // Ganti dengan password email kamu (atau gunakan app password jika mengaktifkan 2FA)
    }
});

const sendVerificationEmail = (email, verificationToken) => {
    const mailOptions = {
        from: 'Happy Toothy <your_email@gmail.com>', // Ganti dengan nama dan alamat email kamu
        to: email,
        subject: 'Verifikasi Email Akun Happy Toothy Anda',
        html: `<p>Terima kasih telah mendaftar di Happy Toothy!</p>
               <p>Silakan klik tautan berikut untuk memverifikasi alamat email Anda:</p>
               <a href="http://localhost:3000/verify/${verificationToken}">Verifikasi Email Saya</a>
               <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendVerificationEmail };