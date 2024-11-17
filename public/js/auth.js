// Session check and authentication logic
document.addEventListener('DOMContentLoaded', async () => {
    document.documentElement.classList.add('loading');
    console.log('[DEBUG] Checking session...');
    
    // Instead of checking document.cookie, just try to validate the session
    try {
        console.log('[DEBUG] Validating session with server...');
        const response = await fetch('/api/validate-session', {
            credentials: 'include'  // This will send the HttpOnly cookie
        });
        
        const data = await response.json();
        console.log('[DEBUG] Session validation response:', data);
        
        if (!response.ok || !data.valid) {
            console.log('[DEBUG] Invalid session, redirecting to login');
            window.location.href = '/login';
            return;
        }
        
        // Valid session, show the dashboard
        console.log('[DEBUG] Valid session, showing dashboard');
        document.documentElement.classList.remove('loading');
        document.documentElement.classList.add('loaded');
        
        // Update UI with username if available
        if (data.username) {
            const usernameDisplay = document.createElement('span');
            usernameDisplay.textContent = `Welcome, ${data.username}`;
            usernameDisplay.classList.add('text-gray-600', 'mr-4');
            document.querySelector('header').insertBefore(usernameDisplay, document.getElementById('logoutBtn'));
        }
    } catch (error) {
        console.error('[DEBUG] Session validation error:', error);
        window.location.href = '/login';
    }
    
    // Setup logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'  // Add this to send cookies
                });

                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    const data = await response.json();
                    alert(data.error || 'Logout failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Logout failed. Please try again.');
            }
        });
    }
});

// Handle page load visibility
window.addEventListener('load', () => {
    document.documentElement.classList.remove('loading');
    document.documentElement.classList.add('loaded');
});
