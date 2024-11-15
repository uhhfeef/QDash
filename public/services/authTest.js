export async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('Auth status:', data);
        return data;
    } catch (error) {
        console.error('Error checking auth status:', error);
        return { isAuthenticated: false };
    }
}

// Run the test
checkAuthStatus();
