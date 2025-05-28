// frontend/public/js/script.js

// --- Bagian Awal: Fungsi Global (getToken, getAuthHeaders) ---
// Fungsi helper untuk mendapatkan token dari localStorage
function getToken() {
    const token = localStorage.getItem('token');
    // Log token hanya sebagian untuk keamanan di console
    console.log('script.js (global): getToken() retrieved token:', token ? token.substring(0, 10) + '...' : 'null');
    return token;
}

// Fungsi helper untuk menambahkan header Authorization
function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('script.js (global): getAuthHeaders() returning WITH Authorization header.');
    } else {
        console.log('script.js (global): getAuthHeaders() returning WITHOUT Authorization header (token is null/empty).');
    }
    return headers;
}

// --- Bagian Fungsi Login dan Registrasi Utama (handleLoginFormSubmit, dll.) ---

// Function to handle login form submission
async function handleLoginFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
        console.log('Frontend: Sending login request to backend for username:', username);
        const response = await fetch('/login', { // Endpoint backend untuk login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Frontend: Received response from backend:', data);

        if (response.ok) {
            alert(data.message);

            if (data.token) {
                try {
                    localStorage.setItem('token', data.token); // Simpan token di localStorage
                    console.log('Frontend: Token saved to localStorage successfully.');

                    // Pastikan token benar-benar bisa diambil setelah disimpan
                    const storedToken = localStorage.getItem('token');
                    if (!storedToken) {
                        console.error('Frontend: ERROR! Token failed to persist in localStorage immediately after saving.');
                        alert('Terjadi masalah saat menyimpan sesi. Silakan coba login kembali.');
                        return; // TIDAK melakukan redirect jika token gagal persist
                    }
                    console.log('Frontend: Token confirmed in localStorage:', storedToken.substring(0, 10) + '...');

                    // Lakukan redirect setelah token dipastikan tersimpan
                    performRedirect(data.user);

                } catch (e) {
                    console.error('Frontend: Error saving token to localStorage:', e);
                    alert('Terjadi masalah saat menyimpan sesi. Silakan coba lagi.');
                }
            } else {
                console.warn('Frontend: Login successful, but no token received in response data. Redirecting without token.');
                performRedirect(data.user); // Tetap coba redirect meskipun tanpa token jika tidak ada masalah lain (misal user guest)
            }
        } else {
            console.log('Frontend: Login failed. Backend message:', data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Frontend: Login request failed (network error or JSON parse error):', error);
        alert('Terjadi kesalahan saat login (cek konsol browser untuk detail).');
    }
}

// Function to handle registration form submission (Admin)
async function handleAdminRegisterFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = {
        nama_lengkap: form.nama_lengkap.value,
        email: form.email.value,
        username: form.username.value,
        password: form.password.value,
        id_level_user: form.id_level_user.value // Ambil dari dropdown
    };
    try {
        console.log('Frontend: Sending admin registration request.');
        const response = await fetch('/admin/register', { // Endpoint admin
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('Frontend: Admin registration response:', result);
        if (response.ok) {
            alert(result.message);
            window.location.href = '/admin/dashboard';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Frontend: Admin Registration error:', error);
        alert('Terjadi kesalahan saat registrasi.');
    }
}

// Function to handle registration form submission (Pengguna)
async function handleRegisterFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const nama_lengkap = form.nama_lengkap.value;
    const email = form.email.value;
    const username = form.username.value;
    const password = form.password.value;
    const id_level_user = form.id_level_user.value; // Ini hidden input, value=4

    try {
        console.log('Frontend: Sending user registration request.');
        const response = await fetch('/register', { // Endpoint backend untuk registrasi
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama_lengkap: nama_lengkap,
                email: email,
                username: username,
                password: password,
                id_level_user: id_level_user
            })
        });

        const data = await response.json();
        console.log('Frontend: User registration response:', data);

        if (response.ok) {
            alert(data.message);
            window.location.href = '/login';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Frontend: Registration error:', error);
        alert('Terjadi kesalahan saat registrasi.');
    }
}

// --- FUNGSI REDIRECT UTAMA ---
function performRedirect(userData) {
    if (userData && userData.id_level_user) {
        console.log('Frontend: Performing redirect based on user level:', userData.id_level_user);
        switch (userData.id_level_user) {
            case 1: // Admin
                window.location.href = '/admin/dashboard';
                break;
            case 2: // Dokter
                window.location.href = '/dokter/dashboard';
                break;
            case 3: // Staff
                window.location.href = '/staff/dashboard';
                break;
            case 4: // Pasien
                window.location.href = '/pasien/dashboard';
                break;
            default:
                window.location.href = '/dashboard';
        }
    } else {
        console.log('Frontend: data.user or id_level_user not found in response, redirecting to default dashboard.');
        window.location.href = '/dashboard';
    }
}

// --- FUNGSI BARU UNTUK LUPA PASSWORD ---
async function handleForgotPasswordFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value;

    try {
        console.log('Frontend: Sending forgot password request for email:', email);
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Frontend: Forgot password response:', data);

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Frontend: Forgot password error:', error);
        alert('Terjadi kesalahan saat meminta reset password.');
    }
}

// --- FUNGSI BARU UNTUK RESET PASSWORD ---
async function handleResetPasswordFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
        alert('Password baru dan konfirmasi password tidak cocok.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
        alert('Token reset password tidak ditemukan di URL.');
        return;
    }

    try {
        console.log('Frontend: Sending reset password request with token:', token.substring(0, 10) + '...');
        const response = await fetch('/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();
        console.log('Frontend: Reset password response:', data);

        if (response.ok) {
            alert(data.message);
            window.location.href = '/login'; // Redirect ke halaman login setelah berhasil
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Frontend: Reset password error:', error);
        alert('Terjadi kesalahan saat mereset password.');
    }
}

// --- Event Listeners untuk Formulir ---
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLoginFormSubmit);
    console.log('Frontend: Login form event listener added.');
}

const adminRegisterForm = document.querySelector('#adminRegisterForm');
if (adminRegisterForm) {
    adminRegisterForm.addEventListener('submit', handleAdminRegisterFormSubmit);
    console.log('Frontend: Admin Register form event listener added.');
}

const registerForm = document.querySelector('#registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterFormSubmit);
    console.log('Frontend: User Register form event listener added.');
}

const forgotPasswordForm = document.querySelector('#forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPasswordFormSubmit);
    console.log('Frontend: Forgot password form event listener added.');
}

const resetPasswordForm = document.querySelector('#resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handleResetPasswordFormSubmit);
    console.log('Frontend: Reset password form event listener added.');
}

// --- Fungsi Logout ---
const logoutButton = document.getElementById('logoutButton'); // Pastikan ada tombol logout di HTML Anda
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token'); // Hapus token dari localStorage
        alert('Anda telah logout.');
        window.location.href = '/login'; // Redirect ke halaman login
    });
}

// --- Fungsi Helper untuk Dashboard Admin (dari admin.js) ---

// Fungsi helper untuk mendapatkan nama level pengguna
function getLevelName(id_level_user) {
    switch (id_level_user) {
        case 1: return 'Admin';
        case 2: return 'Dokter';
        case 3: return 'Staff';
        case 4: return 'Pasien';
        default: return 'Tidak Diketahui';
    }
}

// Fungsi helper untuk mendapatkan nama status validasi
function getStatusName(id_status_valid) {
    switch (id_status_valid) {
        case 1: return 'Valid';
        case 2: return 'Belum Valid';
        case 3: return 'Keluar'; // Status nonaktif/dihapus
        default: return 'Tidak Diketahui';
    }
}

// Fungsi untuk mengambil data dashboard
async function fetchDashboardData() {
    try {
        console.log('script.js (fetchDashboardData): Fetching dashboard data...');
        const response = await fetch('/admin/dashboard-data', {
            method: 'GET',
            headers: getAuthHeaders() // Gunakan header otentikasi
        });
        const data = await response.json();

        if (response.ok) {
            // Periksa apakah elemen HTML ada sebelum memperbarui
            const totalUsersEl = document.getElementById('totalUsers');
            const totalDoctorsEl = document.getElementById('totalDoctors');
            const pendingVerificationsEl = document.getElementById('pendingVerifications');
            const adminUsernameEl = document.getElementById('adminUsername');
            const adminNamaLengkapEl = document.getElementById('adminNamaLengkap'); // Tambahkan ini
            const adminJenisKelaminEl = document.getElementById('adminJenisKelamin'); // Tambahkan ini
            const adminUsiaEl = document.getElementById('adminUsia'); // Tambahkan ini

            if (totalUsersEl) totalUsersEl.textContent = data.summary.totalUsers;
            if (totalDoctorsEl) totalDoctorsEl.textContent = data.summary.totalDoctors;
            if (pendingVerificationsEl) pendingVerificationsEl.textContent = data.summary.pendingVerifications;
            
            // Perbarui info user yang login
            if (adminUsernameEl) adminUsernameEl.textContent = data.user.username;
            if (adminNamaLengkapEl) adminNamaLengkapEl.textContent = data.user.nama_lengkap;
            if (adminJenisKelaminEl) adminJenisKelaminEl.textContent = data.user.jenis_kelamin;
            if (adminUsiaEl) adminUsiaEl.textContent = data.user.usia;

        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Gagal memuat data dashboard.');
        }
    } catch (error) {
        console.error('script.js (fetchDashboardData): Error fetching dashboard data:', error);
        alert('Terjadi kesalahan saat memuat data dashboard.');
    }
}

// Fungsi untuk mengambil daftar pengguna dan mengisi tabel
async function fetchUsers() {
    try {
        console.log('script.js (fetchUsers): Fetching users data...');
        const response = await fetch('/admin/users', { // API untuk ambil semua pengguna
            method: 'GET',
            headers: getAuthHeaders() // Gunakan header otentikasi
        });
        const result = await response.json();

        const userListBody = document.getElementById('userListBody');

        if (response.ok && result.users && userListBody) {
            userListBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang
            result.users.forEach(user => {
                const row = userListBody.insertRow();
                row.innerHTML = `
                    <td>${user.id_user}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.nama_lengkap || '-'}</td>
                    <td>${getLevelName(user.id_level_user)}</td>
                    <td>${getStatusName(user.id_status_valid)}</td>
                    <td class="user-actions">
                        <button class="edit-btn" data-id="${user.id_user}">Edit</button>
                        <button class="delete-btn" data-id="${user.id_user}">Hapus</button>
                        ${user.id_status_valid !== 1 ? `<button class="verify-btn" data-id="${user.id_user}">Verifikasi</button>` : ''}
                    </td>
                `;
            });

            // Tambahkan event listener untuk tombol aksi setelah data dimuat
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEditUser);
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteUser);
            });
            document.querySelectorAll('.verify-btn').forEach(button => {
                button.addEventListener('click', handleVerifyUser);
            });

        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            alert(result.message || 'Gagal memuat daftar pengguna.');
        }
    } catch (error) {
        console.error('script.js (fetchUsers): Error fetching users:', error);
        alert('Terjadi kesalahan saat memuat daftar pengguna.');
    }
}

// --- FUNGSI MANAJEMEN CRUD PENGGUNA  ---
function createEditUserModal(user) {
    const modal = document.createElement('div');
    modal.id = 'editUserModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 500px; width: 90%;">
            <h3>Edit Pengguna</h3>
            <form id="editUserForm">
                <input type="hidden" id="edit_id_user" value="${user.id_user}">
                <div class="form-group">
                    <label for="edit_nama_lengkap">Nama Lengkap:</label>
                    <input type="text" id="edit_nama_lengkap" name="nama_lengkap" value="${user.nama_lengkap || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit_email">Email:</label>
                    <input type="email" id="edit_email" name="email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label for="edit_username">Username:</label>
                    <input type="text" id="edit_username" name="username" value="${user.username}" required>
                </div>
                <div class="form-group">
                    <label for="edit_id_level_user">Level Pengguna:</label>
                    <select id="edit_id_level_user" name="id_level_user" required>
                        <option value="1" ${user.id_level_user === 1 ? 'selected' : ''}>Admin</option>
                        <option value="2" ${user.id_level_user === 2 ? 'selected' : ''}>Dokter</option>
                        <option value="3" ${user.id_level_user === 3 ? 'selected' : ''}>Staff</option>
                        <option value="4" ${user.id_level_user === 4 ? 'selected' : ''}>Pasien</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_id_status_valid">Status Validasi:</label>
                    <select id="edit_id_status_valid" name="id_status_valid" required>
                        <option value="1" ${user.id_status_valid === 1 ? 'selected' : ''}>Valid</option>
                        <option value="2" ${user.id_status_valid === 2 ? 'selected' : ''}>Belum Valid</option>
                        <option value="3" ${user.id_status_valid === 3 ? 'selected' : ''}>Keluar</option>
                    </select>
                </div>
                <button type="submit" style="background-color: #28a745; margin-right: 10px;">Simpan Perubahan</button>
                <button type="button" id="closeModalBtn" style="background-color: #dc3545;">Batal</button>
            </form>
        </div>
    `;

     document.body.appendChild(modal);

    // Event listener untuk tombol Batal
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.remove();
    });

    // Event listener untuk submit form edit
    document.getElementById('editUserForm').addEventListener('submit', handleUpdateUser);
}

// Fungsi untuk menangani edit pengguna (akan menampilkan modal/form terpisah)
async function handleEditUser(event) {
    const userId = event.target.dataset.id;
    try {
        const response = await fetch(`/admin/users/${userId}`, { // Path sudah benar
            method: 'GET',
            headers: getAuthHeaders()
        });
        const result = await response.json();

        // Penting: result.users adalah objek user sekarang (karena backend mengirim users: userObject)
        if (response.ok && result.users) { // Periksa result.users (objek user)
            createEditUserModal(result.users); // <<<-- KIRIM OBJEK USER KE MODAL
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (response.status === 404) {
            alert('Pengguna tidak ditemukan.');
        } else {
            alert(result.message || 'Gagal memuat data pengguna untuk diedit.');
        }
    } catch (error) {
        console.error('script.js (handleEditUser): Error fetching user for edit:', error);
        alert('Terjadi kesalahan saat memuat data pengguna untuk diedit.');
    }
}

async function handleUpdateUser(event) {
    event.preventDefault();
    const form = event.target;
    const userId = document.getElementById('edit_id_user').value;

    const updatedData = {
        nama_lengkap: form.nama_lengkap.value,
        email: form.email.value,
        username: form.username.value,
        id_level_user: parseInt(form.id_level_user.value),
        id_status_valid: parseInt(form.id_status_valid.value)
    };
    
    try {
        const response = await fetch(`/admin/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedData)
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            document.getElementById('editUserModal').remove(); // Tutup modal
            fetchUsers(); // Muat ulang daftar pengguna
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            alert(result.message || 'Gagal memperbarui pengguna.');
        }
    } catch (error) {
        console.error('script.js (handleUpdateUser): Error updating user:', error);
        alert('Terjadi kesalahan saat memperbarui pengguna.');
    }
}

// Fungsi untuk menangani hapus/nonaktifkan pengguna
async function handleDeleteUser(event) {
    const userId = event.target.dataset.id;
    if (confirm(`Anda yakin ingin menonaktifkan/menghapus pengguna ID: ${userId}?`)) {
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchUsers();
            } else if (response.status === 401 || response.status === 403) {
                alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                alert(result.message || 'Gagal menghapus pengguna.');
            }
        } catch (error) {
            console.error('script.js (handleDeleteUser): Error deleting user:', error);
            alert('Terjadi kesalahan saat menghapus pengguna.');
        }
    }
}

// Fungsi untuk menangani verifikasi email (opsional, jika admin bisa memverifikasi manual)
async function handleVerifyUser(event) {
    const userId = event.target.dataset.id;
    if (confirm(`Anda yakin ingin memverifikasi pengguna ID: ${userId}?`)) {
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ id_status_valid: 1 })
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchUsers();
            } else if (response.status === 401 || response.status === 403) {
                alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                alert(result.message || 'Gagal memverifikasi pengguna.');
            }
        } catch (error) {
            console.error('script.js (handleVerifyUser): Error verifying user:', error);
            alert('Terjadi kesalahan saat memverifikasi pengguna.');
        }
    }
}

async function fetchPatientDashboardData() {
    try {
        console.log('script.js (fetchPatientDashboardData): Fetching patient dashboard data...');
        const response = await fetch('/pasien/dashboard-data', {
            method: 'GET',
            headers: getAuthHeaders() // Gunakan header otentikasi
        });
        const data = await response.json();

        if (response.ok) {
            const userProfile = data.userProfile;
            console.log('script.js (fetchPatientDashboardData): Patient profile data received:', userProfile);

            // Perbarui elemen HTML dengan data dari backend
            document.getElementById('patientUsername').textContent = userProfile.username || '-';
            document.getElementById('patientNamaLengkap').textContent = userProfile.nama_lengkap || '-';
            document.getElementById('patientEmail').textContent = userProfile.email || '-';
            document.getElementById('patientJenisKelamin').textContent = userProfile.jenis_kelamin || '-';
            document.getElementById('patientUsia').textContent = userProfile.usia || '-';
            document.getElementById('patientNoTelepon').textContent = userProfile.no_telepon || '-';
            document.getElementById('patientAlamat').textContent = userProfile.alamat || '-';

            // TODO: Isi janji temu mendatang dan riwayat kunjungan
            const upcomingAppointmentsList = document.getElementById('upcomingAppointments');
            if (upcomingAppointmentsList) {
                if (data.upcomingAppointments && data.upcomingAppointments.length > 0) {
                    console.log('script.js: Populating upcoming appointments.');
                    upcomingAppointmentsList.innerHTML = data.upcomingAppointments.map(app =>
                        `<li class="appointment-item">
                        <div>
                        <strong>${new Date(app.tanggal_janji).toLocaleDateString()} ${app.waktu_janji}</strong><br>
                        Dr. ${app.doctor_name} (${app.spesialisasi})<br>
                        Layanan: ${app.nama_layanan}<br>
                        Status: ${app.status_janji} 
                        </div>
                        </li>`
                        ).join('');
                } else {
                    console.log('script.js: No upcoming appointments found.');
                    upcomingAppointmentsList.innerHTML = `<li class="appointment-item">Tidak ada janji temu mendatang.</li>`;
                }
            }

            const visitHistoryList = document.getElementById('visitHistory');
            if (visitHistoryList) {
                if (data.visitHistory && data.visitHistory.length > 0) {
                    console.log('script.js: Populating visit history.');
                    visitHistoryList.innerHTML = data.visitHistory.map(visit =>
                        `<li class="appointment-item">
                        <div>
                        <strong>${new Date(visit.tanggal_janji).toLocaleDateString()} ${visit.waktu_janji}</strong><br>
                        Dr. ${visit.doctor_name} (${visit.spesialisasi})<br>
                        Layanan: ${visit.nama_layanan}<br>
                        Status: ${visit.status_janji}
                        </div>
                        </li>`
                    ).join('');
                } else {
                    visitHistoryList.innerHTML = `<li class="appointment-item">Tidak ada riwayat kunjungan.</li>`;
                }
            }

        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Gagal memuat data dashboard pasien.');
        }
    } catch (error) {
        console.error('script.js (fetchPatientDashboardData): Error fetching patient dashboard data:', error);
        alert('Terjadi kesalahan saat memuat data dashboard pasien.');
    }
}

// Memuat data dokter dan layanan ke dropdown
async function loadBookingFormData() {
    try {
        console.log('script.js: Loading booking form data (doctors and services)...');
        const response = await fetch('/booking/form-data', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (response.ok) {
            const doctorSelect = document.getElementById('doctorSelect');
            const serviceSelect = document.getElementById('serviceSelect');

            if (doctorSelect) {
            doctorSelect.innerHTML = '<option value="">Pilih Dokter</option>';
            data.doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id_doctor;
                option.textContent = `Dr. ${doctor.nama_lengkap} (${doctor.spesialisasi})`;
                doctorSelect.appendChild(option);
            });
        }

        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>';
            data.services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id_service;
                option.textContent = `${service.nama_layanan} (${service.durasi_menit} menit)`;
                serviceSelect.appendChild(option);
            });
        }    
        console.log('script.js: Doctors and services loaded.');
        } else {
            alert(data.message || 'Gagal memuat pilihan dokter dan layanan.');
        }
    } catch (error) {
        console.error('script.js: Error loading booking form data:', error);
        alert('Terjadi kesalahan saat memuat pilihan booking.');
    }
}

// Memuat jadwal kosong dokter berdasarkan dokter dan tanggal
async function loadAvailableDoctorSlots() {
    const doctorId = document.getElementById('doctorSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    
    appointmentTimeSelect.innerHTML = '<option value="">Memuat slot...</option>'; // Placeholder

    if (!doctorId || !date) {
        appointmentTimeSelect.innerHTML = '<option value="">Pilih tanggal dan dokter...</option>';
        return;
    }

    try {
        console.log(`script.js: Loading available slots for doctor ${doctorId} on ${date}...`);
        const response = await fetch(`/booking/available-slots?id_doctor=${doctorId}&date=${date}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (response.ok) {
            appointmentTimeSelect.innerHTML = '<option value="">Pilih Waktu</option>';
            if (data.schedules && data.schedules.length > 0) {
                data.schedules.forEach(schedule => {
                    // Anda mungkin perlu memecah slot jadwal menjadi interval durasi layanan di sini
                    // Contoh sederhana: hanya menampilkan waktu mulai jadwal
                    const option = document.createElement('option');
                    option.value = schedule.waktu_mulai; // Format HH:MM:SS
                    option.textContent = `${schedule.waktu_mulai.substring(0, 5)} - ${schedule.waktu_selesai.substring(0, 5)}`;
                    appointmentTimeSelect.appendChild(option);
                });
                console.log(`script.js: ${data.schedules.length} slots loaded.`);
            } else {
                appointmentTimeSelect.innerHTML = '<option value="">Tidak ada slot tersedia</option>';
                console.log('script.js: No slots found for selected doctor and date.');
            }
        } else {
            alert(data.message || 'Gagal memuat jadwal dokter.');
        }
    } catch (error) {
        console.error('script.js: Error loading available doctor slots:', error);
        alert('Terjadi kesalahan saat memuat jadwal dokter.');
    }
}

// Menangani submit form janji temu baru
async function handleNewAppointmentFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const appointmentData = {
        id_doctor: form.doctorSelect.value,
        id_service: form.serviceSelect.value,
        tanggal_janji: form.appointmentDate.value,
        waktu_janji: form.appointmentTime.value,
        catatan_pasien: form.patientNotes.value
    };

    if (!appointmentData.id_doctor || !appointmentData.id_service || !appointmentData.tanggal_janji || !appointmentData.waktu_janji) {
        alert('Mohon lengkapi semua pilihan janji temu.');
        return;
    }

    try {
        console.log('script.js: Submitting new appointment:', appointmentData);
        const response = await fetch('/booking/create', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(appointmentData)
        });
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            form.reset(); // Reset form
            // Muat ulang daftar janji temu mendatang
            fetchPatientDashboardData(); // Untuk update appointments dan profile
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            alert(result.message || 'Gagal membuat janji temu.');
        }
    } catch (error) {
        console.error('script.js: Error creating new appointment:', error);
        alert('Terjadi kesalahan saat membuat janji temu.');
    }
}

// --- Event listener utama untuk DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('script.js (DOMContentLoaded): DOM fully loaded and parsed.');

    // --- Inisialisasi Event Listeners untuk Formulir ---
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
        console.log('Frontend: Login form event listener added.');
    }

    const adminRegisterForm = document.querySelector('#adminRegisterForm');
    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', handleAdminRegisterFormSubmit);
        console.log('Frontend: Admin Register form event listener added.');
    }

    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
        console.log('Frontend: User Register form event listener added.');
    }

    const forgotPasswordForm = document.querySelector('#forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordFormSubmit);
        console.log('Frontend: Forgot password form event listener added.');
    }

    const resetPasswordForm = document.querySelector('#resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPasswordFormSubmit);
        console.log('Frontend: Reset password form event listener added.');
    }

    const addUserForm = document.getElementById('addUserForm'); // <--- Pindah ke sini
    if (addUserForm) { // Pastikan elemen form ada di halaman (yaitu di dashboard admin)
        addUserForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const userData = {
                nama_lengkap: form.addUser_nama_lengkap.value,
                email: form.addUser_email.value,
                username: form.addUser_username.value,
                password: form.addUser_password.value,
                id_level_user: parseInt(form.addUser_id_level_user.value)
            };

            try {
                const response = await fetch('/admin/users', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(userData)
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    form.reset();
                    fetchUsers();
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(result.message || 'Gagal menambahkan pengguna.');
                }
            } catch (error) {
                console.error('script.js (addUserForm): Error adding user:', error);
                alert('Terjadi kesalahan saat menambahkan pengguna.');
            }
        });
    }
    // --- AKHIR BAGIAN KODE UNTUK FORM "TAMBAH PENGGUNA BARU" ---

    // --- Fungsi Logout ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('Anda telah logout.');
            window.location.href = '/login';
        });
    }

    // --- Panggilan Fungsi Dashboard/User Management ---
    const currentPath = window.location.pathname;

    // Hanya jalankan logika fetch data dashboard/users jika berada di halaman admin dashboard
    if (currentPath === '/admin/dashboard') {
        console.log('script.js (DOMContentLoaded): On admin dashboard page. Attempting to fetch data.');
        const token = getToken();
        if (!token) {
            console.warn('script.js (DOMContentLoaded): No token found for admin dashboard. Redirecting to login.');
            alert('Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }
        fetchDashboardData();
        fetchUsers();
    } else if (currentPath === '/pasien/dashboard') {
        console.log('script.js (DOMContentLoaded): On patient dashboard page. Attempting to fetch data.');
        const token = getToken();
        if (!token) {
            console.warn('script.js (DOMContentLoaded): No token found for patient dashboard. Redirecting to login.');
            alert('Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }
        fetchPatientDashboardData();

        // --- TAMBAH INI UNTUK BOOKING ---
        // Panggil untuk memuat dokter dan layanan saat halaman pasien dimuat
        loadBookingFormData(); 

        const doctorSelect = document.getElementById('doctorSelect');
        const appointmentDate = document.getElementById('appointmentDate');
        const newAppointmentForm = document.getElementById('newAppointmentForm');

        if (doctorSelect) {
            doctorSelect.addEventListener('change', loadAvailableDoctorSlots);
        }
        if (appointmentDate) {
            appointmentDate.addEventListener('change', loadAvailableDoctorSlots);
            // Set tanggal minimum hari ini
            appointmentDate.min = new Date().toISOString().split('T')[0];
        }
        if (newAppointmentForm) {
            newAppointmentForm.addEventListener('submit', handleNewAppointmentFormSubmit);
        }
        // --- AKHIR PENAMBAHAN UNTUK BOOKING ---
    } else {
        console.log('script.js (DOMContentLoaded): Not on admin or patient dashboard. Skipping data fetch.');
    }
});

    // Jika ada halaman dashboard lain (dokter, staff, pasien) yang juga perlu data terautentikasi,
    // Anda bisa menambahkan kondisi serupa di sini
    // else if (currentPath.startsWith('/dokter/dashboard')) {
    //     const token = getToken();
    //     if (!token) {
    //         alert('Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.');
    //         localStorage.removeItem('token');
    //         window.location.href = '/login';
    //         return;
    //     }
    //     // Panggil fungsi fetch data untuk dokter
    //     // fetchDokterData();
    //}
