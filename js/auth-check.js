// Authentication Check Utility
// Include this script in all pages that require authentication

function checkAuthentication() {
    // Wait for user manager to be available
    if (!window.userManager) {
        console.warn('User manager not available, redirecting to login');
        window.location.href = 'index.html';
        return false;
    }

    const userData = window.userManager.getData();
    const authenticated = userData.authenticated;
    const authTimestamp = userData.authTimestamp;
    const sessionKey = userData.sessionKey;
    
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
        window.userManager.updateData('authenticated', false);
        window.userManager.updateData('authTimestamp', null);
        window.userManager.updateData('sessionKey', null);
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    if (window.userManager) {
        window.userManager.updateData('authenticated', false);
        window.userManager.updateData('authTimestamp', null);
        window.userManager.updateData('sessionKey', null);
    }
    window.location.href = 'index.html';
}

// Run authentication check immediately when script loads
if (typeof window !== 'undefined') {
    // Only check if we're not already on the login page
    if (!window.location.pathname.includes('index.html') &&
        !window.location.pathname.endsWith('/') &&
        !window.location.pathname.endsWith('index.html')) {
        
        // Wait for user manager to load data before checking auth
        if (window.userManager && window.userManager.data) {
            checkAuthentication();
        } else {
            // Listen for user data to be loaded
            window.addEventListener('userDataUpdated', function() {
                checkAuthentication();
            });
        }
    }
}
