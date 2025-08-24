   /**
 * Sync all localStorage data to MongoDB database
 */
class LocalStorageSync {
  constructor(userId = null, apiEndpoint = null) {
    // If no userId provided, try to get from localStorage or generate new one
    this.userId = userId || this.getUserId();
    
    // Determine API endpoint based on environment
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    } else {
      // Check if we're in production (Vercel) or development
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      this.apiEndpoint = isProduction ? '/api/sync' : 'http://localhost:3000/api/sync';
    }
  }
  
  /**
   * Get existing user ID or create a new one
   */
  getUserId() {
    // Check if we already have a userId stored
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      // Generate a new userId with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      userId = `user_${timestamp}_${randomString}`;
      
      // Store the userId in localStorage
      localStorage.setItem('userId', userId);
      console.log('Generated new userId in sync:', userId);
    } else {
      console.log('Using existing userId in sync:', userId);
    }
    
    return userId;
  }

  /**
   * Get all data from localStorage as an object
   */
  getAllLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        // Try to parse as JSON, if it fails, store as string
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  }

  /**
   * Sync all localStorage data to the database
   */
  async syncToDatabase() {
    try {
      const localStorageData = this.getAllLocalStorageData();
      
      if (Object.keys(localStorageData).length === 0) {
        console.log('No localStorage data to sync');
        return { success: true, message: 'No data to sync' };
      }

      console.log('Syncing data to:', this.apiEndpoint);
      console.log('User ID:', this.userId);
      console.log('Data to sync:', localStorageData);

      const response = await fetch(this.apiEndpoint, {
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Sync successful:', result);
      return result;

    } catch (error) {
      console.error('Error syncing to database:', error);
      throw error;
    }
  }

  /**
   * Load data from database to localStorage
   */
  async loadFromDatabase() {
    try {
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const userApiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/user';
      
      const response = await fetch(`${userApiEndpoint}?userId=${this.userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No existing data found for user, starting fresh');
          return { success: true, message: 'No existing data' };
        }
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
        console.log('Data loaded from database successfully');
      }
      
      return result;

    } catch (error) {
      console.error('Error loading from database:', error);
      throw error;
    }
  }

  /**
   * Auto-sync on page unload or at intervals
   */
  setupAutoSync(options = {}) {
    const { onUnload = true, interval = null, onLoad = true } = options;

    if (onLoad) {
      // Load data when page loads
      this.loadFromDatabase().catch(console.error);
    }

    if (onUnload) {
      // Sync when user leaves the page
      window.addEventListener('beforeunload', (e) => {
        this.syncToDatabase().catch(console.error);
      });
      
      // Also sync on page visibility change (for mobile devices)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.syncToDatabase().catch(console.error);
        }
      });
    }

    if (interval) {
      // Sync at regular intervals
      setInterval(() => {
        this.syncToDatabase().catch(console.error);
      }, interval);
    }
  }

  /**
   * Sync specific keys only
   */
  async syncSpecificKeys(keys) {
    const allData = this.getAllLocalStorageData();
    const filteredData = {};
    
    keys.forEach(key => {
      if (allData.hasOwnProperty(key)) {
        filteredData[key] = allData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      console.log('No matching keys found to sync');
      return { success: true, message: 'No matching data' };
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          localStorageData: filteredData
        })
      });

      const result = await response.json();
      console.log('Partial sync successful:', result);
      return result;

    } catch (error) {
      console.error('Error syncing specific keys:', error);
      throw error;
    }
  }
}

// Usage example:
// const sync = new LocalStorageSync();
// sync.setupAutoSync({ interval: 30000 }); // Auto-sync every 30 seconds
// sync.syncToDatabase();

