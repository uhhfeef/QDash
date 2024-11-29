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
        
        console.log('[DEBUG] Session is valid');
        document.documentElement.classList.remove('loading');
        document.documentElement.classList.add('loaded');
    } catch (error) {
        console.error('[DEBUG] Error validating session:', error);
        window.location.href = '/login';
    }
});

// Handle logout button click
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    if (confirm('Are you sure you want to logout?')) {
        try {
            console.log('[DEBUG] Logging out...');
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                console.log('[DEBUG] Logout successful');
                window.location.href = '/login';
            } else {
                console.error('[DEBUG] Logout failed');
                const error = await response.text();
                alert(`Logout failed: ${error}`);
            }
        } catch (error) {
            console.error('[DEBUG] Error during logout:', error);
            alert('Error during logout. Please try again.');
        }
    }
});