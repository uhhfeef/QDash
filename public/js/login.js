// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        console.log('[DEBUG] Attempting login for user:', username);
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        const data = await response.json();
        console.log('[DEBUG] Login response:', data);

        if (response.ok) {
            console.log('[DEBUG] Login successful, redirecting to dashboard');
            window.location.href = '/';
        } else {
            console.error('[DEBUG] Login failed:', data.error);
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('[DEBUG] Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            toggleForms(); // Switch back to login form
        } else {
            const data = await response.json();
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Toggle between login and registration forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleLogin = document.getElementById('toggleLogin');
    const toggleRegister = document.getElementById('toggleRegister');
    
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    toggleLogin.classList.toggle('hidden');
    toggleRegister.classList.toggle('hidden');
}

document.getElementById('toggleRegister').addEventListener('click', toggleForms);
document.getElementById('toggleLogin').addEventListener('click', toggleForms);
