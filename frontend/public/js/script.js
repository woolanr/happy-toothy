// frontend/public/js/script.js

// --- Bagian Awal: Fungsi Global (getToken, getAuthHeaders) ---
function getToken() {
    const token = localStorage.getItem('token');
    return token;
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('script.js (global): getAuthHeaders() returning WITH Authorization header.');
    }
    return headers;
}


// --- Fungsi Login, Registrasi, Redirect, Logout, dll. ---
async function handleLoginFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
        console.log('Frontend: Sending login request to backend for username:', username);
        const response = await fetch('/login', { 
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

                    const storedToken = localStorage.getItem('token');
                    if (!storedToken) {
                        console.error('Frontend: ERROR! Token failed to persist in localStorage immediately after saving.');
                        alert('Terjadi masalah saat menyimpan sesi. Silakan coba login kembali.');
                        return; 
                    }
                    console.log('Frontend: Token confirmed in localStorage:', storedToken.substring(0, 10) + '...');

                    performRedirect(data.user);

                } catch (e) {
                    console.error('Frontend: Error saving token to localStorage:', e);
                    alert('Terjadi masalah saat menyimpan sesi. Silakan coba lagi.');
                }
            } else {
                console.warn('Frontend: Login successful, but no token received in response data. Redirecting without token.');
                performRedirect(data.user);
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

async function handleAdminRegisterFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const data = {
        nama_lengkap: form.nama_lengkap.value,
        email: form.email.value,
        username: form.username.value,
        password: form.password.value,
        id_level_user: form.id_level_user.value
    };
    try {
        console.log('Frontend: Sending admin registration request.');
        const response = await fetch('/admin/register', { 
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

async function handleRegisterFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const nama_lengkap = form.nama_lengkap.value;
    const email = form.email.value;
    const username = form.username.value;
    const password = form.password.value;
    const id_level_user = form.id_level_user.value;

    try {
        console.log('Frontend: Sending user registration request.');
        const response = await fetch('/register', { 
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
        
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('text/html')) {
            window.location.href = '/verification';
            console.log('Frontend: Redirecting to verification page.');
        } else if (response.ok && contentType && contentType.includes('application/json')) {
            const data = await response.json();
            alert(data.message);
            if (data.user && data.user.id_level_user === 1) {
                window.location.href = '/admin/dashboard';
            }
        } else {
            const errorMessage = await response.text(); 
            console.error('Frontend: Registration failed with status', response.status, 'and message:', errorMessage);
            alert(`Terjadi kesalahan saat registrasi: ${response.status} - ${errorMessage.substring(0, 100)}...`);
        }

    } catch (error) {
        console.error('Frontend: Registration network or unexpected error:', error);
        alert('Terjadi masalah koneksi atau server tidak merespons. Mohon coba lagi.');
    }
}

async function handleResendVerificationEmail(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value;

    try {
        console.log('Frontend: Sending resend verification email request for:', email);
        const response = await fetch('/resend-verification', { // Ini adalah endpoint backend yang baru
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Frontend: Resend verification email response:', data);

        if (response.ok) {
            alert(data.message || 'Email verifikasi telah berhasil dikirim ulang. Silakan cek kotak masuk Anda.');
            form.reset();
        } else {
            alert(data.message || 'Gagal mengirim ulang email verifikasi. Mohon coba lagi.');
        }
    } catch (error) {
        console.error('Frontend: Error resending verification email:', error);
        alert('Terjadi kesalahan saat mengirim ulang email verifikasi.');
    }
}

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
            window.location.href = '/login';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Frontend: Reset password error:', error);
        alert('Terjadi kesalahan saat mereset password.');
    }
}

// --- Fungsi Helper Dashboard Admin ---
function getLevelName(id_level_user) {
    switch (id_level_user) {
        case 1: return 'Admin';
        case 2: return 'Dokter';
        case 3: return 'Staff';
        case 4: return 'Pasien';
        default: return 'Tidak Diketahui';
    }
}

function getStatusName(id_status_valid) {
    switch (id_status_valid) {
        case 1: return 'Valid';
        case 2: return 'Belum Valid';
        case 3: return 'Keluar';
        default: return 'Tidak Diketahui';
    }
}

// --- Fungsi Fetch Data Dashboard Admin ---
async function fetchDashboardData() {
    try {
        console.log('script.js (fetchDashboardData): Fetching dashboard data...');
        const response = await fetch('/admin/dashboard-data', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (response.ok) {
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

// --- Fungsi Manajemen Pengguna (CRUD Users) ---
async function fetchUsers() {
    try {
        console.log('script.js (fetchUsers): Fetching users data...');
        const response = await fetch('/admin/users', { 
            method: 'GET',
            headers: getAuthHeaders() 
        });
        const result = await response.json();
        const userListBody = document.getElementById('userListBody');

        if (response.ok && result.users && userListBody) {
            userListBody.innerHTML = ''; 
            result.users.forEach(user => {
                const row = userListBody.insertRow();
                let actionButtons = '';

                if (user.id_status_valid === 3) { 
                    actionButtons = `<button class="btn btn-sm btn-success activate-btn" data-userid="${user.id_user}" data-username="${user.username}">Aktifkan</button>`;
                } else {
                    actionButtons = `
                        <button class="btn btn-sm btn-edit edit-btn" data-id="${user.id_user}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id_user}" data-userid="${user.id_user}">Nonaktifkan</button> 
                        ${user.id_status_valid !== 1 ? `<button class="btn btn-sm btn-warning verify-btn" data-id="${user.id_user}">Verifikasi</button>` : ''}
                    `;
                }

                row.innerHTML = `
                    <td>${user.id_user}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.nama_lengkap || '-'}</td>
                    <td>${getLevelName(user.id_level_user)}</td>
                    <td>${getStatusName(user.id_status_valid)}</td>
                    <td class="user-actions">
                        ${actionButtons}
                    </td>
                `;
            });

            // Re-attach event listeners
            document.querySelectorAll('#userListBody .edit-btn').forEach(button => {
                button.addEventListener('click', handleEditUser);
            });
            document.querySelectorAll('#userListBody .delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteUser); // Ini untuk menonaktifkan user umum
            });
            document.querySelectorAll('#userListBody .verify-btn').forEach(button => {
                button.addEventListener('click', handleVerifyUser);
            });
            document.querySelectorAll('#userListBody .activate-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.dataset.userid;
                    const userName = this.dataset.username;
                    handleActivateUser(userId, userName);
                });
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

function createEditUserModal(user) {
    console.log("createEditUserModal called with user data:", user);
    // Hapus modal lama jika ada (untuk menghindari duplikasi jika error sebelumnya tidak menghapus)
    const existingModal = document.getElementById('editUserModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'editUserModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;

    // Ambil data dokter dari objek user jika ada (karena User.findById sudah di-JOIN dengan DOCTORS)
    const initialSpesialisasi = user.spesialisasi || ''; 
    const initialLisensiNo = user.lisensi_no || '';  
    const initialPengalaman = user.pengalaman_tahun !== null ? user.pengalaman_tahun : ''; 

    modal.innerHTML = `
        <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h3>Edit Pengguna</h3>
            <form id="editUserForm">
                <input type="hidden" id="edit_id_user" value="${user.id_user}">
                <input type="hidden" id="edit_id_profile" value="${user.id_profile || ''}">
                <input type="hidden" id="edit_current_id_level_user" value="${user.id_level_user}">
                <div class="form-group">
                    <label for="edit_nama_lengkap">Nama Lengkap:</label>
                    <input type="text" id="edit_nama_lengkap" name="nama_lengkap" value="${user.nama_lengkap || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit_email">Email:</label>
                    <input type="email" id="edit_email" name="email" value="${user.email || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit_username">Username:</label>
                    <input type="text" id="edit_username" name="username" value="${user.username || ''}" required>
                </div>
                <div class="form-group">
                    <label for="edit_password">Password Baru (Opsional)</label>
                    <input type="password" id="edit_password" name="password" placeholder="Kosongkan jika tidak ingin mengubah">
                </div>
                <div class="form-group">
                    <label for="edit_no_telepon">No. Telepon (Opsional)</label>
                    <input type="tel" id="edit_no_telepon" name="no_telepon" value="${user.no_telepon || ''}">
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

                <div id="doctorSpecificFieldsContainer" style="display: none; border-top: 1px solid #eee; margin-top: 15px; padding-top: 15px;">
                    <h4>Detail Spesifik Dokter:</h4>
                    <div class="form-group">
                        <label for="edit_spesialisasi">Spesialisasi:</label>
                        <input type="text" id="edit_spesialisasi" name="spesialisasi" value="${initialSpesialisasi}">
                    </div>
                    <div class="form-group">
                        <label for="edit_lisensi_no">No. Lisensi:</label>
                        <input type="text" id="edit_lisensi_no" name="lisensi_no" value="${initialLisensiNo}">
                    </div>
                    <div class="form-group">
                        <label for="edit_pengalaman_tahun">Pengalaman (Tahun):</label>
                        <input type="number" id="edit_pengalaman_tahun" name="pengalaman_tahun" min="0" value="${initialPengalaman}">
                    </div>
                </div>
                <div class="form-actions" style="margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                    <button type="button" id="closeEditUserModalBtn" class="btn btn-secondary">Batal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // --- Logika untuk menampilkan/menyembunyikan field dokter ---
    const levelDropdown = document.getElementById('edit_id_level_user');
    const doctorFieldsContainer = document.getElementById('doctorSpecificFieldsContainer');
    const spesialisasiInput = document.getElementById('edit_spesialisasi');
    const lisensiInput = document.getElementById('edit_lisensi_no');
    const pengalamanInput = document.getElementById('edit_pengalaman_tahun');
    const closeButton = document.getElementById('closeEditUserModalBtn');
    const editForm = document.getElementById('editUserForm');

    function toggleDoctorFields() {
        if (!levelDropdown) {
            console.error("Error di toggleDoctorFields: Elemen dropdown 'edit_id_level_user' tidak ditemukan!");
            if (doctorFieldsContainer) doctorFieldsContainer.style.display = 'none';
            return;
        }
        if (doctorFieldsContainer && spesialisasiInput && lisensiInput && pengalamanInput) {
            if (levelDropdown.value === '2') { // Value '2' untuk Dokter
                doctorFieldsContainer.style.display = 'block';
                spesialisasiInput.required = true;
                lisensiInput.required = true;
                pengalamanInput.required = true;
            } else {
                doctorFieldsContainer.style.display = 'none';
                spesialisasiInput.required = false;
                lisensiInput.required = false;
                pengalamanInput.required = false;
            }
        } else {
        }
    }

    if (levelDropdown) {
        toggleDoctorFields(); 
        levelDropdown.addEventListener('change', toggleDoctorFields);
    } else {
        console.error("createEditUserModal: Elemen dropdown 'edit_id_level_user' tidak ditemukan setelah modal di-append.");
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
    } else {
        console.error("createEditUserModal: Tombol 'closeEditUserModalBtn' tidak ditemukan.");
    }

    if (editForm) {
        editForm.addEventListener('submit', handleUpdateUser);
    } else {
        console.error("createEditUserModal: Form 'editUserForm' tidak ditemukan.");
    }
}

async function handleEditUser(event) { // Dipanggil saat tombol "Edit" di tabel pengguna diklik
    console.log('handleEditUser triggered. Event target:', event.target);

    const userId = event.target.dataset.id;
    console.log('handleEditUser: Attempting to edit userId:', userId);

    if (!userId) {
        console.error('handleEditUser: userId is undefined or null. Button data-id might be missing or incorrect.');
        alert('Gagal memulai proses edit: ID pengguna tidak ditemukan.');
        return;
    }

    try {
        console.log(`handleEditUser: Fetching data for user ID: ${userId} from /admin/users/${userId}`);
        
        const response = await fetch(`/admin/users/${userId}`, { 
            method: 'GET',
            headers: getAuthHeaders()
        });
        console.log('handleEditUser: Fetch response status:', response.status);

        let result;
        try {
            result = await response.json();
            console.log('handleEditUser: Fetched user data result:', result); 
        } catch (jsonError) {
            console.error('handleEditUser: Error parsing JSON response:', jsonError);
            const responseText = await response.text(); 
            console.error('handleEditUser: Response text was:', responseText);
            alert('Gagal memproses data pengguna dari server. Respons tidak valid.');
            return;
        }

        if (response.ok && result.users) { // Backend mengirim { users: userObject }
            createEditUserModal(result.users); // Panggil createEditUserModal dengan data yang diterima
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (response.status === 404) {
            alert('Pengguna tidak ditemukan di server.');         
            console.error('handleEditUser: User not found (404) for ID:', userId);
        } else {
            alert(result.message || 'Gagal memuat data pengguna untuk diedit.');
            console.error('handleEditUser: Failed to load user data, result:', result);
        }
    } catch (error) {
        // Ini akan menangkap error jaringan atau error dari throw di try-catch JSON parsing
        console.error('script.js (handleEditUser): Error fetching user for edit:', error);
        alert('Terjadi kesalahan saat memuat data pengguna untuk diedit.');
    }
}

async function handleUpdateUser(event) { // Ini fungsi untuk SUBMIT dari modal edit PENGGUNA UMUM
    event.preventDefault();
    const form = event.target; // form adalah #editUserForm dari modal dinamis
    const userId = document.getElementById('edit_id_user').value;
    const profileId = document.getElementById('edit_id_profile').value;
    const currentLevelUser = document.getElementById('edit_current_id_level_user').value; // Ambil level awal

    // Persiapkan data untuk tabel USERS
    const updatedUserData = {
        username: form.edit_username.value,
        email: form.edit_email.value,
        id_level_user: parseInt(form.edit_id_level_user.value),
        id_status_valid: parseInt(form.edit_id_status_valid.value)
    };
    if (form.edit_password && form.edit_password.value) { // Cek jika elemen password ada
        updatedUserData.password = form.edit_password.value;
    }

    // Persiapkan data untuk tabel PROFILE
    const updatedProfileData = {
        nama_lengkap: form.edit_nama_lengkap.value,
        email: form.edit_email.value, 
        no_telepon: form.edit_no_telepon.value || null
    };

    // Persiapkan data spesifik dokter JIKA levelnya adalah Dokter (2)
    let doctorSpecificData = null;
    if (updatedUserData.id_level_user === 2) {
        const spesialisasi = form.edit_spesialisasi ? form.edit_spesialisasi.value : null;
        const lisensi_no = form.edit_lisensi_no ? form.edit_lisensi_no.value : null;
        const pengalaman_tahun_val = form.edit_pengalaman_tahun ? form.edit_pengalaman_tahun.value : null;

        if (!spesialisasi || !lisensi_no || pengalaman_tahun_val === null || pengalaman_tahun_val === '') {
            alert('Untuk level Dokter, field Spesialisasi, No. Lisensi, dan Pengalaman wajib diisi.');
            return;
        }
        doctorSpecificData = {
            spesialisasi: spesialisasi,
            lisensi_no: lisensi_no,
            pengalaman_tahun: parseInt(pengalaman_tahun_val)
        };
    }

    const dataToSend = {
        userData: updatedUserData,
        profileData: updatedProfileData,
        doctorData: doctorSpecificData, 
        id_profile: profileId,
        current_id_level_user: parseInt(currentLevelUser) // Kirim level awal untuk logika backend
    };
    console.log('Data yang dikirim untuk update pengguna (handleUpdateUser):', dataToSend);
    
    try {
        // Endpoint ini (/admin/users/:id) akan ditangani oleh userController.updateUser
        // userController.updateUser perlu dirombak untuk menangani dataToSend yang kompleks ini
        const response = await fetch(`/admin/users/${userId}`, { 
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(dataToSend)
        });
        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message || 'Pengguna berhasil diperbarui.');
            const modalToRemove = document.getElementById('editUserModal');
            if (modalToRemove) modalToRemove.remove();
            fetchUsers(); 
        } else {
            alert(result.message || 'Gagal memperbarui pengguna.');
            console.error('Gagal memperbarui pengguna (frontend):', result);
        }
    } catch (error) {
        console.error('script.js (handleUpdateUser): Error updating user:', error);
        alert('Terjadi kesalahan saat memperbarui pengguna.');
    }
}

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

async function handleVerifyUser(event) {
    const userId = event.target.dataset.id;
    const userName = event.target.closest('tr')?.querySelector('td:nth-child(2)')?.textContent || `pengguna ID ${userId}`;

    if (confirm(`Anda yakin ingin memverifikasi pengguna ID: ${userId}?`)) {
        try {
            const response = await fetch(`/admin/users/${userId}/verify`, { // Endpoint baru
                method: 'PUT', // PUT tetap cocok untuk mengubah status resource
                headers: getAuthHeaders()
            });
            const result = await response.json();

            if (response.ok && result.success) { // Pastikan backend mengirim success: true
                alert(result.message || `Pengguna "${userName}" berhasil diverifikasi.`);
                fetchUsers(); // Muat ulang daftar pengguna
            } else {
                alert(result.message || `Gagal memverifikasi pengguna "${userName}".`);
                console.error('Gagal memverifikasi pengguna (frontend):', result);
            }
        } catch (error) {
            console.error('script.js (handleVerifyUser): Error verifying user:', error);
            alert('Terjadi kesalahan saat memverifikasi pengguna.');
        }
    }
}

//--- Fungsi Manajemen Dokter ---
async function fetchDoctors() {
    try {
        console.log('script.js (fetchDoctors): Fetching doctors data...');
        const response = await fetch('/admin/doctors', { 
            method: 'GET',
            headers: getAuthHeaders()
        });
        const result = await response.json();
        console.log('script.js (fetchDoctors): API Response result:', result);

        const doctorListBody = document.getElementById('doctorListBody');
        console.log('script.js (fetchDoctors): doctorListBody element:', doctorListBody);

        if (response.ok && result.success && result.data && doctorListBody) {
            populateDoctorTable(result.data);
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else {
            console.error('script.js (fetchDoctors): Conditions check failed:');
            console.error('  response.ok:', response.ok);
            console.error('  result.success:', result.success);
            console.error('  result.data:', result.data); 
            console.error('  doctorListBody exists:', !!doctorListBody);
            
            console.error('script.js (fetchDoctors): Failed to fetch doctors -', result.message);
            if (doctorListBody) {
                const colspanCount = document.querySelector('#doctor-management-section table thead th')?.parentElement.childElementCount || 8; // Dinamis hitung colspan
                doctorListBody.innerHTML = `<tr><td colspan="${colspanCount}" class="text-center">${result.message || 'Gagal memuat data dokter (data tidak valid).'}</td></tr>`;
            } else {
                 alert(result.message || 'Gagal memuat data dokter (elemen tabel tidak ditemukan).');
            }
        }
    } catch (error) {
        console.error('script.js (fetchDoctors): Error fetching doctors:', error);
        const doctorListBody = document.getElementById('doctorListBody');
        if (doctorListBody) {
            const colspanCount = document.querySelector('#doctor-management-section table thead th')?.parentElement.childElementCount || 8;
            doctorListBody.innerHTML = `<tr><td colspan="${colspanCount}" class="text-center">Terjadi kesalahan saat memuat data dokter.</td></tr>`;
        } else {
            alert('Terjadi kesalahan saat memuat data dokter.');
        }
    }
}

function populateDoctorTable(doctors) {
    console.log('populateDoctorTable called with doctors:', doctors);
    const doctorListBody = document.getElementById('doctorListBody');
    if (!doctorListBody) {
        console.error("populateDoctorTable: Element with ID 'doctorListBody' not found.");
        return;
    }
    doctorListBody.innerHTML = ''; 

    const headers = document.querySelectorAll('#doctor-management-section table thead th');
    const colspanCount = headers.length || 9; 

    if (doctors && doctors.length > 0) {
        console.log('populateDoctorTable: Processing doctors data to create table rows.');
        doctors.forEach(doctor => {
            const row = doctorListBody.insertRow();
            const rowHTML = `
                <td>${doctor.id_doctor || 'N/A'}</td> 
                <td>${doctor.id_user || 'N/A'}</td>
                <td>${doctor.nama_lengkap || 'N/A'}</td>
                <td>${doctor.spesialisasi || '-'}</td>
                <td>${doctor.email || '-'}</td> 
                <td>${doctor.no_telepon || '-'}</td>
                <td>${doctor.lisensi_no || '-'}</td>
                <td>${doctor.pengalaman_tahun !== null ? doctor.pengalaman_tahun : '-'}</td>
                <td class="user-actions"> 
                    <button class="btn btn-sm btn-edit edit-btn" data-id="${doctor.id_doctor}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${doctor.id_doctor}">Hapus</button>
                </td>
            `;
            row.innerHTML = rowHTML;

            const editButton = row.querySelector('.edit-btn');
            if (editButton) {
                editButton.addEventListener('click', function() {
                    const doctorId = this.dataset.id;
                    handleEditDoctorFlow(doctorId);
                });
            }
            const deleteButton = row.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    const doctorId = this.dataset.id;
                    const userId = this.dataset.userid; // Ambil userId dari data attribute
                    const doctorName = doctor.nama_lengkap || `Dokter dengan ID ${doctorId}`; // Untuk pesan konfirmasi
                    handleDeactivateDoctor(doctorId, userId, doctorName); // Panggil fungsi baru
                });
            }
        });
    } else {
        console.log('populateDoctorTable: No doctors data to display. Showing "Tidak ada data dokter."');
        doctorListBody.innerHTML = `<tr><td colspan="${colspanCount}" class="text-center">Tidak ada data dokter.</td></tr>`;
    }
}

// FUungsi Untuk  Alur Edit Dokter
async function handleEditDoctorFlow(doctorId) {
    console.log(`handleEditDoctorFlow called for doctorId: ${doctorId}`);
    const addDoctorModalElement = document.getElementById('addDoctorModal');
    const addDoctorForm = document.getElementById('addDoctorForm'); 
    const modalTitle = addDoctorModalElement.querySelector('.modal-header h2');
    const submitButton = addDoctorForm.querySelector('button[type="submit"]');
    const editDoctorIdInput = document.getElementById('editDoctorId'); 

    if (!addDoctorModalElement || !addDoctorForm || !modalTitle || !submitButton || !editDoctorIdInput) {
        console.error('Satu atau lebih elemen modal untuk edit dokter tidak ditemukan.');
        alert('Gagal menyiapkan form edit dokter. Elemen tidak ditemukan.');
        return;
    }

    try {
        const response = await fetch(`/admin/doctors/${doctorId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const result = await response.json();

        if (response.ok && result.success && result.data) {
            const doctor = result.data;
            console.log('Data dokter diterima untuk diedit:', doctor);

            document.getElementById('addDoctor_nama_lengkap').value = doctor.nama_lengkap || '';
            document.getElementById('addDoctor_username').value = doctor.username || '';
            document.getElementById('addDoctor_email').value = doctor.email || '';
            
            const passwordField = document.getElementById('addDoctor_password');
            if (passwordField) {
                passwordField.value = ''; 
                passwordField.placeholder = 'Kosongkan jika tidak ingin mengubah password';
            }

            document.getElementById('addDoctor_no_telepon').value = doctor.no_telepon || ''; 
            document.getElementById('addDoctor_spesialisasi').value = doctor.spesialisasi || ''; 
            document.getElementById('addDoctor_lisensi_no').value = doctor.lisensi_no || '';     
            document.getElementById('addDoctor_pengalaman_tahun').value = doctor.pengalaman_tahun !== null ? doctor.pengalaman_tahun : '';
            
            editDoctorIdInput.value = doctor.id_doctor;

            modalTitle.textContent = 'Edit Data Dokter';
            submitButton.textContent = 'Update Data Dokter';
            
            addDoctorModalElement.style.display = 'block';
        } else {
            alert(result.message || `Gagal mengambil data dokter dengan ID: ${doctorId}`);
            console.error('Gagal mengambil data dokter untuk diedit:', result);
        }
    } catch (error) {
        console.error('Error di handleEditDoctorFlow:', error);
        alert('Terjadi kesalahan saat mencoba memuat data dokter untuk diedit.');
    }
}

async function handleDeactivateDoctor(doctorId, userId, doctorName) {
    console.log(`handleDeactivateDoctor called for doctorId: ${doctorId}, userId: ${userId}, name: ${doctorName}`);

    if (confirm(`Anda yakin ingin menonaktifkan akun dokter "${doctorName}" (User ID: ${userId})? Data dokter akan tetap ada tetapi akunnya tidak bisa login.`)) {
        try {
            const response = await fetch(`/admin/doctors/${doctorId}/deactivate`, {
                method: 'PUT', 
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(result.message || `Akun dokter "${doctorName}" berhasil dinonaktifkan.`);
                fetchDoctors(); 
            } else {
                alert(result.message || `Gagal menonaktifkan akun dokter "${doctorName}".`);
                console.error('Gagal menonaktifkan dokter:', result);
            }
        } catch (error) {
            console.error('Error di handleDeactivateDoctor:', error);
            alert('Terjadi kesalahan saat mencoba menonaktifkan akun dokter.');
        }
    } else {
        console.log('Deactivation cancelled by user.');
    }
}

async function handleActivateUser(userId, userName) {
    console.log(`handleActivateUser called for userId: ${userId}, name: ${userName}`);

    if (confirm(`Anda yakin ingin mengaktifkan kembali akun untuk "${userName}" (User ID: ${userId})?`)) {
        try {
            const response = await fetch(`/admin/users/${userId}/activate`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(result.message || `Akun untuk "${userName}" berhasil diaktifkan kembali.`);
                if (document.getElementById('userListBody')) {
                    fetchUsers(); 
                }
            } else {
                alert(result.message || `Gagal mengaktifkan akun untuk "${userName}".`);
                console.error('Gagal mengaktifkan akun:', result);
            }
        } catch (error) {
            console.error('Error di handleActivateUser:', error);
            alert('Terjadi kesalahan saat mencoba mengaktifkan akun pengguna.');
        }
    } else {
        console.log('Activation cancelled by user.');
    }
}

// --- Fungsi untuk Pasien Dashboard & Booking ---
async function fetchPatientDashboardData() {
    try {
        console.log('script.js (fetchPatientDashboardData): Fetching patient dashboard data...');
        const response = await fetch('/pasien/dashboard-data', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (response.ok) {
            const userProfile = data.userProfile;
            console.log('script.js (fetchPatientDashboardData): Patient profile data received:', userProfile);

            // Pastikan elemen ada sebelum mencoba mengupdate
            const patientUsernameEl = document.getElementById('patientUsername');
            const patientNamaLengkapEl = document.getElementById('patientNamaLengkap');
            const patientEmailEl = document.getElementById('patientEmail');
            const patientJenisKelaminEl = document.getElementById('patientJenisKelamin');
            const patientUsiaEl = document.getElementById('patientUsia');
            const patientNoTeleponEl = document.getElementById('patientNoTelepon');
            const patientAlamatEl = document.getElementById('patientAlamat');

            if (patientUsernameEl) patientUsernameEl.textContent = userProfile.username || '-';
            if (patientNamaLengkapEl) patientNamaLengkapEl.textContent = userProfile.nama_lengkap || '-';
            if (patientEmailEl) patientEmailEl.textContent = userProfile.email || '-';
            if (patientJenisKelaminEl) patientJenisKelaminEl.textContent = userProfile.jenis_kelamin || '-';
            if (patientUsiaEl) patientUsiaEl.textContent = userProfile.usia || '-';
            if (patientNoTeleponEl) patientNoTeleponEl.textContent = userProfile.no_telepon || '-';
            if (patientAlamatEl) patientAlamatEl.textContent = userProfile.alamat || '-';

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

async function loadAvailableDoctorSlots() {
    const doctorId = document.getElementById('doctorSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    
    appointmentTimeSelect.innerHTML = '<option value="">Memuat slot...</option>';

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
                    const option = document.createElement('option');
                    option.value = schedule.waktu_mulai;
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
            form.reset();
            // Muat ulang daftar janji temu mendatang
            fetchPatientDashboardData();
        } else if (response.status === 401 || response.status === 403) {
            alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';        
        } else if (response.status === 409) { // Status 409 untuk bentrok/slot tidak tersedia
            alert(result.message || 'Slot janji temu sudah terisi atau tidak tersedia. Mohon pilih waktu lain.');
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
    // Pindahkan semua event listener form dan tombol global ke sini
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginFormSubmit);
    
    const adminRegisterForm = document.querySelector('#adminRegisterForm');
    if (adminRegisterForm) adminRegisterForm.addEventListener('submit', handleAdminRegisterFormSubmit);
    
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegisterFormSubmit);
    
    const resendVerificationForm = document.querySelector('#resendVerificationForm');
    if (resendVerificationForm) resendVerificationForm.addEventListener('submit', handleResendVerificationEmail);
    
    const forgotPasswordForm = document.querySelector('#forgotPasswordForm');
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPasswordFormSubmit);
    
    const resetPasswordForm = document.querySelector('#resetPasswordForm');
    if (resetPasswordForm) resetPasswordForm.addEventListener('submit', handleResetPasswordFormSubmit);
    
    // Event listener untuk form Tambah Pengguna (dari section add-user di dashboard.ejs)
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
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
                const response = await fetch('/admin/users', { // POST ke endpoint tambah user
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(userData)
                });
                const result = await response.json();

                if (response.ok && result.success) { // Asumsi backend mengirim success:true
                    alert(result.message);
                    form.reset();
                    // Jika section user-list aktif, panggil fetchUsers untuk refresh.
                    // Atau, jika ingin selalu refresh:
                    if (typeof fetchUsers === 'function' && document.getElementById('userListBody')) {
                         fetchUsers();
                    }
                    // Mungkin juga perlu menutup section 'add-user-section' dan menampilkan 'user-list-section'
                    // Ini bisa dihandle oleh logika navigasi di dashboard.ejs atau di sini
                } else {
                    alert(result.message || 'Gagal menambahkan pengguna.');
                }
            } catch (error) {
                console.error('script.js (addUserForm submit): Error adding user:', error);
                alert('Terjadi kesalahan saat menambahkan pengguna.');
            }
        });
    }

    const globalLogoutButton = document.getElementById('logoutButton'); 
    if (globalLogoutButton) {
        globalLogoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('Anda telah logout.');
            window.location.href = '/login';
        });
    }

    // Panggilan Fungsi Dashboard Awal
    const currentPath = window.location.pathname;
    if (currentPath === '/admin/dashboard') {
        console.log('script.js (DOMContentLoaded): On admin dashboard page. Attempting to fetch initial data.');
        const token = getToken();
        if (!token) {
            console.warn('script.js (DOMContentLoaded): No token found for admin dashboard. Redirecting to login.');
            alert('Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return; // Hentikan eksekusi lebih lanjut jika tidak ada token
        }
        // fetchDashboardData dipanggil dari inline script di dashboard.ejs setelah elemennya ada
        // fetchUsers juga dipanggil dari showSection di dashboard.ejs saat section user-list aktif
    } else if (currentPath === '/pasien/dashboard') {
        // ... (logika untuk dashboard pasien) ...
    } else {
        console.log('script.js (DOMContentLoaded): Not on admin or patient dashboard. Skipping specific initial data fetch for those.');
    }

    // --- Navigasi & Dropdown Menu ---
    const hasDropdown = document.querySelector('.has-dropdown');
    if (hasDropdown) {
        hasDropdown.addEventListener('click', function(e) {
            e.preventDefault(); // Mencegah link default
            this.querySelector('.dropdown-menu').classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!hasDropdown.contains(e.target) && !e.target.closest('.dropdown-menu')) {
                hasDropdown.querySelector('.dropdown-menu').classList.remove('active');
            }
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }

    // --- Testimonial Carousel ---
    const carousel = document.querySelector('.testimonial-carousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;

    if (carousel && prevBtn && nextBtn) {
        const items = carousel.children;
        const totalItems = items.length;

        function showItem(index) {
            for (let i = 0; i < totalItems; i++) {
                items[i].style.display = 'none';
            }
            if (items[index]) {
                items[index].style.display = 'block';
            }
        }

        if (totalItems > 0) {
            showItem(currentIndex);
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalItems - 1;
            showItem(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < totalItems - 1) ? currentIndex + 1 : 0;
            showItem(currentIndex);
        });
    }

    // --- Animasi Sederhana (contoh: Hero CTA Button) ---
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        heroCta.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.03)' },
            { transform: 'scale(1)' }
        ], {
            duration: 1000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
});