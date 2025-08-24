/**
 * Authentication Manager for Multi-Device Support
 * Handles user registration, login, and cross-device data synchronization
 */
class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.userId = null;
    this.email = null;
    this.token = null;
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  initializeAuth() {
    this.token = localStorage.getItem('authToken');
    this.email = localStorage.getItem('userEmail');
    this.userId = localStorage.getItem('authenticatedUserId');
    
    if (this.token && this.email && this.userId) {
      this.isAuthenticated = true;
      console.log('User authenticated:', this.email);
    } else {
      console.log('User not authenticated');
    }
  }

  /**
   * Register a new user
   */
  async register(email, password) {
    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/register';

      let response;
      if (isProduction) {
        // Vercel deployment - use action-based API
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'register',
            email, 
            password 
          })
        });
      } else {
        // Local development - use direct endpoint
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Store authentication data
      this.token = result.token;
      this.userId = result.userId;
      this.email = email;
      this.isAuthenticated = true;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('userEmail', this.email);
      localStorage.setItem('authenticatedUserId', this.userId);
      
      console.log('Registration successful:', this.email);
      return result;

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login existing user
   */
  async login(email, password) {
    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/login';

      let response;
      if (isProduction) {
        // Vercel deployment - use action-based API
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'login',
            email, 
            password 
          })
        });
      } else {
        // Local development - use direct endpoint
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      
      // Store authentication data
      this.token = result.token;
      this.userId = result.userId;
      this.email = email;
      this.isAuthenticated = true;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('userEmail', this.email);
      localStorage.setItem('authenticatedUserId', this.userId);
      
      console.log('Login successful:', this.email);
      return result;

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.token = null;
    this.email = null;
    this.userId = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authenticatedUserId');
    
    console.log('User logged out');
  }

  /**
   * Verify authentication token
   */
  async verifyToken() {
    if (!this.token || !this.email) {
      return false;
    }

    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/verify-token';

      let response;
      if (isProduction) {
        // Vercel deployment - use action-based API
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'verify-token',
            email: this.email, 
            token: this.token 
          })
        });
      } else {
        // Local development - use direct endpoint
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: this.email, 
            token: this.token 
          })
        });
      }

      return response.ok;

    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Get authenticated user data
   */
  async getUserData() {
    if (!this.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`/api/user/${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Sync data for authenticated user
   */
  async syncData(localStorageData) {
    if (!this.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          userId: this.userId,
          localStorageData: localStorageData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      return await response.json();

    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for device linking
   */
  generateDeviceLinkCode() {
    if (!this.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    const linkData = {
      userId: this.userId,
      email: this.email,
      timestamp: Date.now()
    };

    return btoa(JSON.stringify(linkData));
  }

  /**
   * Link device using QR code
   */
  async linkDevice(qrCodeData) {
    try {
      const linkData = JSON.parse(atob(qrCodeData));
      
      // Verify the link data is recent (within 5 minutes)
      if (Date.now() - linkData.timestamp > 5 * 60 * 1000) {
        throw new Error('QR code expired');
      }

      // Set up authentication for this device
      this.userId = linkData.userId;
      this.email = linkData.email;
      
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/device-link';

      let response;
      if (isProduction) {
        // Vercel deployment - use action-based API
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'device-link',
            userId: linkData.userId,
            email: linkData.email 
          })
        });
      } else {
        // Local development - use direct endpoint
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: linkData.userId,
            email: linkData.email 
          })
        });
      }

      if (!response.ok) {
        throw new Error('Device linking failed');
      }

      const result = await response.json();
      this.token = result.token;
      this.isAuthenticated = true;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('userEmail', this.email);
      localStorage.setItem('authenticatedUserId', this.userId);
      
      console.log('Device linked successfully');
      return result;

    } catch (error) {
      console.error('Device linking error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Get current user info
   */
  getUserInfo() {
    return {
      isAuthenticated: this.isAuthenticated,
      email: this.email,
      userId: this.userId
    };
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
