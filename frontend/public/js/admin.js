// frontend/public/js/admin.js

// Fungsi helper untuk mendapatkan token dari localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Fungsi helper untuk menambahkan header Authorization
function getAuthHeaders() {
    const token = getToken();
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Sertakan token JWT
        };
    }
    // Jika tidak ada token, tetap kirim Content-Type: application/json
    return { 'Content-Type': 'application/json' }; 
}

document.addEventListener('DOMContentLoaded', async () => {
    // Fungsi untuk mengambil data dashboard
    async function fetchDashboardData() {
        try {
            // Memanggil API backend untuk data dashboard
            const response = await fetch('/admin/dashboard-data', {
                method: 'GET',
                headers: getAuthHeaders() // Gunakan header otentikasi
            });
            const data = await response.json();

            if (response.ok) {
                // Update elemen HTML dengan data dari backend
                document.getElementById('totalUsers').textContent = data.summary.totalUsers;
                document.getElementById('totalDoctors').textContent = data.summary.totalDoctors;
                document.getElementById('pendingVerifications').textContent = data.summary.pendingVerifications;
                document.getElementById('adminUsername').textContent = data.user.username; // Asumsi API mengembalikan username admin
            } else if (response.status === 401 || response.status === 403) {
                // Jika tidak terautentikasi atau tidak berizin, paksa logout
                alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                localStorage.removeItem('token'); // Hapus token kadaluarsa
                window.location.href = '/login'; // Redirect ke halaman login
            } else {
                alert(data.message || 'Gagal memuat data dashboard.');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            alert('Terjadi kesalahan saat memuat data dashboard.');
        }
    }

    // Fungsi untuk mengambil daftar pengguna dan mengisi tabel
    async function fetchUsers() {
        try {
            const response = await fetch('/admin/users', { // API untuk ambil semua pengguna
                method: 'GET',
                headers: getAuthHeaders() // Gunakan header otentikasi
            });
            const result = await response.json();

            const userListBody = document.getElementById('userListBody');
            userListBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang

            if (response.ok && result.users) {
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
            console.error('Error fetching users:', error);
            alert('Terjadi kesalahan saat memuat daftar pengguna.');
        }
    }

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

    // Fungsi untuk menangani penambahan pengguna
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const userData = {
                nama_lengkap: form.nama_lengkap.value,
                email: form.email.value,
                username: form.username.value,
                password: form.password.value,
                id_level_user: parseInt(form.id_level_user.value) // Pastikan dikirim sebagai angka
            };

            try {
                const response = await fetch('/admin/users', { // API POST untuk tambah pengguna
                    method: 'POST',
                    headers: getAuthHeaders(), // Gunakan header otentikasi
                    body: JSON.stringify(userData)
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    form.reset(); // Reset form setelah sukses
                    fetchUsers(); // Muat ulang daftar pengguna
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(result.message || 'Gagal menambahkan pengguna.');
                }
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Terjadi kesalahan saat menambahkan pengguna.');
            }
        });
    }

    // Fungsi untuk menangani edit pengguna (akan menampilkan modal/form terpisah)
    async function handleEditUser(event) {
        const userId = event.target.dataset.id;
        alert(`Fungsi Edit untuk User ID: ${userId} akan diimplementasikan. Anda bisa membuat modal/form terpisah di sini.`);
        // Nanti di sini Anda akan mengambil data user berdasarkan ID,
        // menampilkan modal/form edit dengan data tersebut,
        // dan mengirim update ke API /admin/users/:id (PUT)
        // Contoh:
        // const updatedData = { /* data yang diedit */ };
        // const response = await fetch(`/admin/users/${userId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updatedData) });
        // if (response.ok) fetchUsers();
    }

    // Fungsi untuk menangani hapus/nonaktifkan pengguna
    async function handleDeleteUser(event) {
        const userId = event.target.dataset.id;
        if (confirm(`Anda yakin ingin menonaktifkan/menghapus pengguna ID: ${userId}?`)) {
            try {
                const response = await fetch(`/admin/users/${userId}`, { // API DELETE untuk hapus/nonaktifkan
                    method: 'DELETE',
                    headers: getAuthHeaders() // Gunakan header otentikasi
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    fetchUsers(); // Muat ulang daftar pengguna
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(result.message || 'Gagal menghapus pengguna.');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Terjadi kesalahan saat menghapus pengguna.');
            }
        }
    }

    // Fungsi untuk menangani verifikasi email (opsional, jika admin bisa memverifikasi manual)
    async function handleVerifyUser(event) {
        const userId = event.target.dataset.id;
        if (confirm(`Anda yakin ingin memverifikasi pengguna ID: ${userId}?`)) {
            try {
                const response = await fetch(`/admin/users/${userId}`, { // API PUT untuk update status
                    method: 'PUT',
                    headers: getAuthHeaders(), // Gunakan header otentikasi
                    body: JSON.stringify({ id_status_valid: 1 }) // Set status menjadi valid (1)
                });
                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    fetchUsers(); // Muat ulang daftar pengguna
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sesi Anda telah berakhir atau Anda tidak memiliki izin. Silakan login kembali.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(result.message || 'Gagal memverifikasi pengguna.');
                }
            } catch (error) {
                console.error('Error verifying user:', error);
                alert('Terjadi kesalahan saat memverifikasi pengguna.');
            }
        }
    }


    // Panggil fungsi-fungsi saat halaman dimuat
    fetchDashboardData(); // Memuat data ringkasan
    fetchUsers(); // Memuat daftar pengguna

    // Logout Functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token'); // Hapus token dari localStorage
            alert('Anda telah logout.');
            window.location.href = '/login'; // Redirect ke halaman login
        });
    }
});