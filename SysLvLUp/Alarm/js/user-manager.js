/**
 * Centralized User Manager
 * Prevents multiple user IDs from being generated across different pages
 */
class UserManager {
  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sync = null;
  }

  /**
   * Get existing user ID or create a new one
   */
  getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
      console.log('New user ID created:', userId);
    } else {
      console.log('Existing user ID found:', userId);
    }
    return userId;
  }

  /**
   * Get the current user ID
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Initialize sync with the user ID
   */
  initializeSync() {
    if (typeof LocalStorageSync !== 'undefined') {
      this.sync = new LocalStorageSync(this.userId);
      console.log('Sync initialized for user:', this.userId);
      return this.sync;
    } else {
      console.warn('LocalStorageSync not available');
      return null;
    }
  }

  /**
   * Load user data from database
   */
  async loadUserData() {
    try {
      const response = await fetch(`/api/user/${this.userId}`);
      
      if (response.status === 404) {
        console.log('No existing data found for user, starting fresh');
        return { success: true, message: 'No existing data' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.localStorage && Object.keys(result.localStorage).length > 0) {
        // Load data into localStorage
        Object.keys(result.localStorage).forEach(key => {
          const value = result.localStorage[key];
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value);
          }
        });
        console.log('User data loaded from database successfully');
      }
      
      return result;

    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  /**
   * Save user data to database
   */
  async saveUserData() {
    try {
      // Get all localStorage data
      const localStorageData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          localStorageData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          localStorageData[key] = localStorage.getItem(key);
        }
      }

      // Send data to MongoDB
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          localStorageData: localStorageData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('User data saved successfully');
      return true;

    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }
}

// Create global user manager instance
window.userManager = new UserManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserManager;
}
