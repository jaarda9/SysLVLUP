/**
 * Simple Single User Management
 * Uses a fixed user ID to prevent multiple users from being created
 */
class SimpleUserManager {
  constructor() {
    this.userId = 'single_user_12345'; // Fixed user ID
    this.initializeUser();
  }

  /**
   * Initialize the user (always the same user)
   */
  initializeUser() {
    localStorage.setItem('userId', this.userId);
    console.log('Simple user manager initialized with ID:', this.userId);
  }

  /**
   * Get the user ID
   */
  getUserId() {
    return this.userId;
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

  /**
   * Simple sync function for compatibility
   */
  async syncToDatabase() {
    return this.saveUserData();
  }
}

// Create global simple user manager instance
window.simpleUser = new SimpleUserManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleUserManager;
}
