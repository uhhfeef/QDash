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
            document.getElementById('loginError').textContent = data.error;
            document.getElementById('loginError').classList.remove('hidden');
        }
    } catch (error) {
        console.error('[DEBUG] Error during login:', error);
        document.getElementById('loginError').textContent = 'An error occurred during login. Please try again.';
        document.getElementById('loginError').classList.remove('hidden');
    }
});

// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('registerError').textContent = 'Passwords do not match';
        document.getElementById('registerError').classList.remove('hidden');
        return;
    }

    try {
        console.log('[DEBUG] Attempting registration for user:', username);
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('[DEBUG] Registration response:', data);

        if (response.ok) {
            console.log('[DEBUG] Registration successful');
            toggleForms(); // Switch back to login form
            document.getElementById('registrationSuccess').classList.remove('hidden');
        } else {
            console.error('[DEBUG] Registration failed:', data.error);
            document.getElementById('registerError').textContent = data.error;
            document.getElementById('registerError').classList.remove('hidden');
        }
    } catch (error) {
        console.error('[DEBUG] Error during registration:', error);
        document.getElementById('registerError').textContent = 'An error occurred during registration. Please try again.';
        document.getElementById('registerError').classList.remove('hidden');
    }
});

function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registrationSuccess = document.getElementById('registrationSuccess');
    
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    registrationSuccess.classList.add('hidden');
}

document.getElementById('toggleRegister').addEventListener('click', toggleForms);
document.getElementById('toggleLogin').addEventListener('click', toggleForms);
