/**
 * Centralized User Manager
 * Single source of truth for user identification and data synchronization
 * Supports both authenticated users and anonymous users
 */
class UserManager {
  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sync = null;
    this.initializeSync();
    
    // Load user data immediately when user manager is created
    this.loadUserData().then(result => {
      console.log('Initial user data load result:', result);
    }).catch(error => {
      console.error('Error loading initial user data:', error);
    });
  }

  /**
   * Get existing user ID or create a new one
   */
  getOrCreateUserId() {
    // Check if we already have a userId stored
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      // Generate a new userId with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      userId = `user_${timestamp}_${randomString}`;
      
      // Store the userId in localStorage
      localStorage.setItem('userId', userId);
      console.log('Generated new userId:', userId);
    } else {
      console.log('Using existing userId:', userId);
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
      console.log('Loading user data for userId:', this.userId);
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
        
        // Trigger a page reload to update the UI with loaded data
        if (window.location.pathname.includes('alarm.html') || 
            window.location.pathname.includes('status.html') ||
            window.location.pathname.includes('daily_quest.html')) {
          console.log('Reloading page to update UI with loaded data');
          window.location.reload();
        }
      }
      
      return result;

    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't throw error - allow app to continue with local data
      return { success: false, error: error.message };
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
   * Simple sync function for compatibility with existing code
   */
  async syncToDatabase() {
    return this.saveUserData();
  }

  /**
   * Check if user data exists in database
   */
  async userDataExists() {
    try {
      const response = await fetch(`/api/user/${this.userId}`);
      return response.status !== 404;
    } catch (error) {
      console.error('Error checking user data:', error);
      return false;
    }
  }
}

// Create global user manager instance
window.userManager = new UserManager();

// Simple alias for backward compatibility
window.simpleUser = window.userManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserManager;
}
