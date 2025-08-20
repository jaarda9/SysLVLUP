/**
 * Database Commands for LocalStorage Sync
 * Push and fetch all localStorage data to/from MongoDB
 */

class DatabaseManager {
  constructor(userId, apiBaseUrl = '') {
    this.userId = userId;
    this.apiBaseUrl = apiBaseUrl || window.location.origin;
  }

  /**
   * Push ALL localStorage data to database
   * @returns {Promise} - Result of the push operation
   */
  async pushAllData() {
    try {
      const allData = this._getAllLocalStorage();
      
      if (Object.keys(allData).length === 0) {
        console.log('No localStorage data to push');
        return { success: true, message: 'No data to push' };
      }

      const response = await fetch(`${this.apiBaseUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          localStorageData: allData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Push successful:', result);
      return result;

    } catch (error) {
      console.error('❌ Push failed:', error);
      throw error;
    }
  }

  /**
   * Fetch ALL data from database and restore to localStorage
   * @returns {Promise} - The fetched data
   */
  async fetchAllData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user/${this.userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ No data found in database for this user');
          return { localStorage: {} };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      const localStorageData = userData.localStorage || {};
      
      // Restore all data to localStorage
      this._restoreToLocalStorage(localStorageData);
      
      console.log('✅ Fetch successful:', localStorageData);
      return localStorageData;

    } catch (error) {
      console.error('❌ Fetch failed:', error);
      throw error;
    }
  }

  /**
   * Sync: Push current data, then fetch latest from database
   * @returns {Promise} - Combined result
   */
  async sync() {
    try {
      console.log('🔄 Starting sync...');
      
      // Push current localStorage
      const pushResult = await this.pushAllData();
      
      // Fetch latest from database
      const fetchResult = await this.fetchAllData();
      
      return {
        success: true,
        push: pushResult,
        fetch: fetchResult
      };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  /**
   * Get all localStorage data as object
   * @private
   */
  _getAllLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  }

  /**
   * Restore data to localStorage
   * @private
   */
  _restoreToLocalStorage(data) {
    // Clear existing localStorage
    localStorage.clear();
    
    // Restore all data
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    });
  }

  /**
   * Quick command: Push data
   * Usage: await db.push()
   */
  async push() {
    return this.pushAllData();
  }

  /**
   * Quick command: Pull data
   * Usage: await db.pull()
   */
  async pull() {
    return this.fetchAllData();
  }
}

// Global commands for easy use
window.DatabaseCommands = {
  /**
   * Initialize database manager
   * Usage: const db = initDB('user123');
   */
  initDB: (userId, apiBaseUrl) => new DatabaseManager(userId, apiBaseUrl),

  /**
   * Quick push command
   * Usage: await pushData();
   */
  pushData: async (userId, apiBaseUrl) => {
    const db = new DatabaseManager(userId, apiBaseUrl);
    return db.pushAllData();
  },

  /**
   * Quick pull command
   * Usage: await pullData();
   */
  pullData: async (userId, apiBaseUrl) => {
    const db = new DatabaseManager(userId, apiBaseUrl);
    return db.fetchAllData();
  },

  /**
   * Quick sync command
   * Usage: await syncData();
   */
  syncData: async (userId, apiBaseUrl) => {
    const db = new DatabaseManager(userId, apiBaseUrl);
    return db.sync();
  }
};

// Usage examples:
// const db = new DatabaseManager('user123');
// await db.push();        // Push all localStorage to database
// await db.pull();        // Pull all data from database to localStorage
// await db.sync();        // Push then pull (full sync)
