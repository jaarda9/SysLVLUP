/**
 * Authentication Manager
 * Allows users to access their data from multiple devices
 * Uses email/password authentication to sync data across devices
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  /**
   * Initialize authentication system
   */
  async init() {
    // Check if user was previously logged in
    const savedEmail = localStorage.getItem('userEmail');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedEmail && savedToken) {
      try {
        // Verify token is still valid
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: savedEmail,
            token: savedToken
          })
        });
        
        if (response.ok) {
          this.currentUser = { email: savedEmail };
          this.isAuthenticated = true;
          console.log('User automatically logged in:', savedEmail);
          
          // Load user-specific data
          await this.loadUserData();
          return true;
        }
      } catch (error) {
        console.log('Auto-login failed, requiring manual login');
        this.logout();
      }
    }
    return false;
  }

  /**
   * Register new user
   */
  async register(email, password) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Store authentication data
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userId', result.userId);
      
      this.currentUser = { email: email };
      this.isAuthenticated = true;
      
      console.log('User registered successfully:', email);
      return { success: true, message: 'Registration successful' };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Login existing user
   */
  async login(email, password) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Store authentication data
      localStorage.setItem('userEmail', email);
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userId', result.userId);
      
      this.currentUser = { email: email };
      this.isAuthenticated = true;
      
      // Load user data from server
      await this.loadUserData();
      
      console.log('User logged in successfully:', email);
      return { success: true, message: 'Login successful' };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Invalid credentials' };
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    // Keep userId for local data, but mark as anonymous
    localStorage.setItem('isAnonymous', 'true');
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    console.log('User logged out');
  }

  /**
   * Load user data from server
   */
  async loadUserData() {
    if (!this.isAuthenticated) return;
    
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Merge server data with local data
        this.mergeDataWithServer(userData);
        console.log('User data loaded from server');
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * Merge server data with local data
   */
  mergeDataWithServer(serverData) {
    // Implementation depends on your data structure
    // This is a basic example - you might want more sophisticated merging
    if (serverData.localStorage) {
      Object.keys(serverData.localStorage).forEach(key => {
        if (!localStorage.getItem(key)) {
          const value = serverData.localStorage[key];
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value);
          }
        }
      });
    }
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }

  /**
   * Get current user email
   */
  getCurrentUser() {
    return this.currentUser ? this.currentUser.email : null;
  }

  /**
   * Get authentication headers for API calls
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await window.authManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
