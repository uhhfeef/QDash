export function createLoginPage() {
    const loginContainer = document.createElement('div');
    loginContainer.className = 'min-h-screen flex items-center justify-center bg-gray-50';
    
    function createLoginForm() {
        return `
            <form id="loginForm" class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="username" class="sr-only">Username</label>
                        <input id="username" name="username" type="text" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Username">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password" name="password" type="password" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Password">
                    </div>
                </div>
                <div>
                    <button type="submit" 
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Sign in
                    </button>
                </div>
            </form>
        `;
    }

    function createRegisterForm() {
        return `
            <form id="registerForm" class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="reg-username" class="sr-only">Username</label>
                        <input id="reg-username" name="username" type="text" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Username">
                    </div>
                    <div>
                        <label for="reg-email" class="sr-only">Email</label>
                        <input id="reg-email" name="email" type="email" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Email">
                    </div>
                    <div>
                        <label for="reg-password" class="sr-only">Password</label>
                        <input id="reg-password" name="password" type="password" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Password">
                    </div>
                    <div>
                        <label for="reg-confirm-password" class="sr-only">Confirm Password</label>
                        <input id="reg-confirm-password" name="confirmPassword" type="password" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                            placeholder="Confirm Password">
                    </div>
                </div>
                <div>
                    <button type="submit" 
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Register
                    </button>
                </div>
            </form>
        `;
    }

    let isLoginView = true;
    
    function updateView() {
        loginContainer.innerHTML = `
            <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        ${isLoginView ? 'Sign in to Dashboard' : 'Create an Account'}
                    </h2>
                </div>
                ${isLoginView ? createLoginForm() : createRegisterForm()}
                <div class="text-center">
                    <button id="toggleForm" class="text-indigo-600 hover:text-indigo-500">
                        ${isLoginView ? 'Need an account? Register' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        `;

        // Add form handlers
        if (isLoginView) {
            const form = loginContainer.querySelector('#loginForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: username, password }),
                        credentials: 'include'
                    });

                    if (response.ok) {
                        window.location.reload();
                    } else {
                        const data = await response.json();
                        alert(data.error || 'Login failed');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Login failed. Please try again.');
                }
            });
        } else {
            const form = loginContainer.querySelector('#registerForm');
            form.addEventListener('submit', async (e) => {
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
                        isLoginView = true;
                        updateView();
                    } else {
                        const data = await response.json();
                        alert(data.error || 'Registration failed');
                    }
                } catch (error) {
                    console.error('Registration error:', error);
                    alert('Registration failed. Please try again.');
                }
            });
        }

        // Add toggle handler
        const toggleBtn = loginContainer.querySelector('#toggleForm');
        toggleBtn.addEventListener('click', () => {
            isLoginView = !isLoginView;
            updateView();
        });
    }

    // Initialize view
    updateView();
    return loginContainer;
}
