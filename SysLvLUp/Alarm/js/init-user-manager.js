/**
 * User Manager Initialization Script
 * Ensures the centralized user manager is available on all pages
 * This should be included in all HTML files before other scripts
 */

// Check if user manager is already loaded
if (typeof window.userManager === 'undefined') {
    console.log('User manager not found, loading it now...');
    
    // Create a simple user manager if the full one isn't available
    window.userManager = {
        getUserId: function() {
            let userId = localStorage.getItem('userId');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('userId', userId);
                console.log('New user ID created:', userId);
            }
            return userId;
        },
        
        syncToDatabase: async function() {
            try {
                const userId = this.getUserId();
                const localStorageData = {};
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    try {
                        localStorageData[key] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        localStorageData[key] = localStorage.getItem(key);
                    }
                }
                
                const response = await fetch('/api/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        localStorageData: localStorageData
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                console.log('Sync successful with simple user manager');
                return true;
                
            } catch (error) {
                console.error('Error syncing with simple user manager:', error);
                throw error;
            }
        }
    };
    
    // Alias for backward compatibility
    window.simpleUser = window.userManager;
    
    console.log('Simple user manager initialized');
} else {
    console.log('User manager already available');
}
