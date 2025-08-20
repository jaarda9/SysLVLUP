   /**
 * Sync all localStorage data to MongoDB database
 */
class LocalStorageSync {
  constructor(userId, apiEndpoint = '/api/sync') {
    this.userId = userId;
    this.apiEndpoint = apiEndpoint;
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
   * Auto-sync on page unload or at intervals
   */
  setupAutoSync(options = {}) {
    const { onUnload = true, interval = null } = options;

    if (onUnload) {
      // Sync when user leaves the page
      window.addEventListener('beforeunload', (e) => {
        this.syncToDatabase().catch(console.error);
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
// const sync = new LocalStorageSync('user123', '/api/sync');
// sync.syncToDatabase();
// sync.setupAutoSync({ interval: 30000 }); // Auto-sync every 30 seconds

