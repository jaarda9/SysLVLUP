// Authentication Check Utility
// Include this script in all pages that require authentication

function checkAuthentication() {
    const authenticated = localStorage.getItem('authenticated');
    const authTimestamp = localStorage.getItem('authTimestamp');
    const sessionKey = localStorage.getItem('sessionKey');
    
    // Check if authentication exists and is recent (within 24 hours)
    if (!authenticated || !authTimestamp || !sessionKey) {
        window.location.href = 'index.html';
        return false;
    }
    
    const now = Date.now();
    const authTime = parseInt(authTimestamp);
    const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);
    
    if (hoursSinceAuth > 24) {
        // Clear old authentication
        localStorage.removeItem('authenticated');
        localStorage.removeItem('authTimestamp');
        localStorage.removeItem('sessionKey');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('sessionKey');
    window.location.href = 'index.html';
}

// Run authentication check immediately when script loads
if (typeof window !== 'undefined') {
    // Only check if we're not already on the login page
    if (!window.location.pathname.includes('index.html') && 
        !window.location.pathname.endsWith('/') && 
        !window.location.pathname.endsWith('index.html')) {
        checkAuthentication();
    }
}
