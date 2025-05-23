// Function to handle login form submission
async function handleLoginFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
        console.log('Frontend: Sending login request to backend for username:', username); // Log di frontend
        const response = await fetch('/login', { // Endpoint backend untuk login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Frontend: Received response from backend:', data); // Log respons lengkap dari backend

        if (response.ok) {
            alert(data.message); // Menampilkan "Login Berhasil!"

            // Lakukan redirect berdasarkan id_level_user
            if (data.user && data.user.id_level_user) {
                console.log('Frontend: Redirecting based on user level:', data.user.id_level_user); // Log redirect
                switch (data.user.id_level_user) {
                    case 1: // Admin
                        window.location.href = '/admin/dashboard';
                        break;
                    case 2: // Dokter
                        window.location.href = '/dokter/dashboard'; // Atau halaman dashboard dokter
                        break;
                    case 3: // Staff
                        window.location.href = '/staff/dashboard'; // Atau halaman dashboard staff
                        break;
                    case 4: // Pasien
                        window.location.href = '/pasien/dashboard'; // Atau halaman dashboard pasien
                        break;
                    default:
                        window.location.href = '/dashboard'; // Default jika level tidak dikenali
                }
            } else {
                console.log('Frontend: data.user or id_level_user not found in response, redirecting to default dashboard.');
                window.location.href = '/dashboard'; // Fallback jika data.user atau id_level_user tidak ada (seharusnya tidak terjadi)
            }
        } else {
            console.log('Frontend: Login failed. Backend message:', data.message); // Log error dari backend
            alert(data.message); // Menampilkan pesan error dari backend
        }
    } catch (error) {
        console.error('Frontend: Login request failed (network error or JSON parse error):', error); // Log error jaringan/parsing
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
        const response = await fetch('/admin/register', { // Endpoint admin berbeda (contoh)
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
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
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const nama_lengkap = form.nama_lengkap.value;
    const email = form.email.value;
    const username = form.username.value;
    const password = form.password.value;
    const id_level_user = form.id_level_user.value; // Ini harusnya hidden input, value=4

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
            alert(data.message); // Show success message
            // Redirect to login page or show a message to check email
            window.location.href = '/login'; // Contoh redirect
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Frontend: Registration error:', error);
        alert('Terjadi kesalahan saat registrasi.');
    }
}

// Add event listeners to the forms
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