/**
 * Simplified User Manager
 * Fetches data directly from MongoDB without localStorage conflicts
 */
class UserManager {
  constructor() {
    this.userId = this.getOrCreateUserId();
    this.data = null;
    this.isLoading = false;
    
    // Initialize with basic data structure immediately
    this.data = {
      gameData: {
        level: 1,
        hp: 100,
        mp: 100,
        stm: 100,
        exp: 0,
        fatigue: 0,
        name: "Your Name",
        ping: "60",
        guild: "Reaper",
        race: "Hunter",
        title: "None",
        region: "TN",
        location: "Hospital",
        physicalQuests: "[0/4]",
        mentalQuests: "[0/3]",
        spiritualQuests: "[0/2]",
        Attributes: {
          STR: 10,
          VIT: 10,
          AGI: 10,
          INT: 10,
          PER: 10,
          WIS: 10,
        },
        stackedAttributes: {
          STR: 0,
          VIT: 0,
          AGI: 0,
          INT: 0,
          PER: 0,
          WIS: 0,
        },
      },
      lastResetDate: new Date().toLocaleDateString(),
      STS: 0
    };
    
    // Try to load data from MongoDB if available
    this.loadUserData().then(result => {
      console.log('Initial user data load result:', result);
    }).catch(error => {
      console.log('MongoDB not available, using local data:', error.message);
      // Data is already initialized above, so we're good
    });
  }

  /**
   * Get existing user ID or create a new one
   */
  getOrCreateUserId() {
    // Try to get a persistent user ID that works across URLs
    let userId = localStorage.getItem('persistentUserId');
    
    if (!userId) {
      // Check if we have any existing userId to migrate
      const oldUserId = localStorage.getItem('userId');
      
      if (oldUserId) {
        // Use the existing userId as the persistent one
        userId = oldUserId;
        localStorage.setItem('persistentUserId', userId);
        localStorage.removeItem('userId'); // Clean up old key
        console.log('Migrated existing userId to persistent:', userId);
      } else {
        // Generate a new persistent userId
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        userId = `user_${timestamp}_${randomString}`;
        
        // Store the persistent userId
        localStorage.setItem('persistentUserId', userId);
        console.log('Generated new persistent userId:', userId);
      }
    } else {
      console.log('Using existing persistent userId:', userId);
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
   * Load user data directly from MongoDB
   */
  async loadUserData() {
    if (this.isLoading) {
      console.log('Already loading data, skipping...');
      return;
    }
    
    this.isLoading = true;
    
    try {
      console.log('Loading user data directly from MongoDB for userId:', this.userId);
      
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/user';
      
      const response = await fetch(`${apiEndpoint}/${this.userId}`);
      
      if (response.status === 404) {
        console.log('No existing data found for user, starting fresh');
        // Keep the default data we already set
        return { success: true, message: 'No existing data' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Merge with existing data instead of replacing
      if (result.localStorage) {
        this.data = { ...this.data, ...result.localStorage };
      }
      
      console.log('User data loaded directly from MongoDB:', this.data);
      
      // Trigger UI update if needed
      this.updateUI();
      
      return result;

    } catch (error) {
      console.error('Error loading user data:', error);
      // Keep the default data we already set
      return { success: false, error: error.message };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Save user data directly to MongoDB
   */
  async saveUserData(dataToSave = null) {
    try {
      // Use provided data or current data
      const data = dataToSave || this.data || {};
      
      console.log('Saving user data directly to MongoDB:', data);
      
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/sync' : 'http://localhost:3000/api/sync';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          localStorageData: data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('User data saved directly to MongoDB:', result);
      return result;

    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Get data from memory (not localStorage)
   */
  getData(key = null) {
    if (key) {
      return this.data[key];
    }
    return this.data;
  }

  /**
   * Set data in memory (not localStorage)
   */
  setData(key, value) {
    this.data[key] = value;
    console.log('Data set in memory:', key, value);
  }

  /**
   * Update data and save to MongoDB
   */
  async updateData(key, value) {
    this.setData(key, value);
    await this.saveUserData();
  }

  /**
   * Update UI with current data
   */
  updateUI() {
    // Dispatch custom event for UI components to listen to
    const event = new CustomEvent('userDataUpdated', { 
      detail: { data: this.data, userId: this.userId } 
    });
    window.dispatchEvent(event);
  }

  /**
   * Simple sync function for compatibility
   */
  async syncToDatabase() {
    return this.saveUserData();
  }

  /**
   * Check if user data exists in database
   */
  async userDataExists() {
    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/user';
      
      const response = await fetch(`${apiEndpoint}/${this.userId}`);
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
