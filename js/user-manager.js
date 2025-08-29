/**
 * Simple User Manager - Uses player name as user ID
 */
class UserManager {
  constructor() {
    this.userId = null;
    this.data = null;
    this.isLoading = false;
    this.lastLoadTime = 0;
  }

  /**
   * Set the user ID (player name) and load data
   */
  async setUserId(playerName) {
    if (!playerName || playerName.trim() === '') {
      throw new Error('Player name cannot be empty');
    }
    
    this.userId = playerName.trim();
    console.log('User ID set to:', this.userId);
    
    // Try to load existing data for this player
    const loadResult = await this.loadUserData();
    
    // Return both the user ID and whether data was found
    const dataFound = !!(loadResult.success && this.data && this.data.gameData);
    console.log('Data found check:', {
      loadResultSuccess: loadResult.success,
      hasData: !!this.data,
      hasGameData: !!(this.data && this.data.gameData),
      dataFound: dataFound
    });
    
    return {
      userId: this.userId,
      dataFound: dataFound
    };
  }

  /**
   * Get the current user ID (player name)
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Check if user ID is set
   */
  hasUserId() {
    return this.userId !== null;
  }

  /**
   * Load user data from MongoDB using player name as ID
   */
  async loadUserData() {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    if (this.isLoading) {
      console.log('Already loading data, skipping...');
      return { success: false, message: 'Already loading' };
    }

    this.isLoading = true;
    console.log('Loading user data for:', this.userId);

    try {
      // Try to load from /api/user/:userId endpoint
      const timestamp = Date.now();
      const userUrl = `/api/user/${encodeURIComponent(this.userId)}?_t=${timestamp}`;
      console.log('Trying user API URL:', userUrl);
      let response = await fetch(userUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('User API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data loaded from database:', userData);
        
        // Extract gameData from localStorage field
        if (userData.localStorage && userData.localStorage.gameData) {
          this.data = userData.localStorage;
        } else {
          // Create initial data structure
          this.data = this.createInitialData(this.userId);
        }
        
        this.isLoading = false;
        return { success: true, message: 'Data loaded successfully' };
      } else if (response.status === 404) {
        console.log('User not found in database:', this.userId);
        // Create initial data structure for new user
        this.data = this.createInitialData(this.userId);
        this.isLoading = false;
        return { success: true, message: 'New user created' };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.isLoading = false;
      return { success: false, message: error.message };
    }
  }

  /**
   * Save user data to MongoDB
   */
  async saveUserData() {
    if (!this.userId) {
      throw new Error('User ID not set');
    }

    if (!this.data) {
      throw new Error('No data to save');
    }

    // Prevent saving immediately after loading (within 5 seconds)
    const timeSinceLoad = Date.now() - this.lastLoadTime;
    if (timeSinceLoad < 5000) {
      console.log('Skipping save - data was loaded recently (', timeSinceLoad, 'ms ago)');
      return { success: true, message: 'Save skipped - data loaded recently' };
    }

    console.log('Saving user data for:', this.userId);
    console.log('Data to save:', this.data);

    try {
      const requestBody = {
        userId: this.userId,
        localStorageData: this.data
      };
      
      console.log('Request body:', requestBody);
      
      // Try sync API first, then users API as fallback
      let response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // If sync API fails, try users API
      if (response.status === 404) {
        console.log('Sync API not found, trying users API...');
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Data saved successfully via API:', result);
        return { success: true, data: result };
      } else {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get data from memory
   */
  getData() {
    return this.data;
  }

  /**
   * Set data in memory
   */
  setData(key, value) {
    if (!this.data) {
      this.data = {};
    }
    
    if (key === 'gameData') {
      this.data.gameData = value;
    } else {
      this.data[key] = value;
    }
    
    console.log('Data updated:', key, value);
  }

  /**
   * Update specific data fields
   */
  updateData(updates) {
    if (!this.data) {
      this.data = {};
    }
    
    Object.assign(this.data, updates);
    console.log('Data updated with:', updates);
  }

  /**
   * Update user data (alias for updateData for compatibility)
   */
  async updateUserData(updates) {
    this.updateData(updates);
    // Optionally save to database
    return await this.saveUserData();
  }

  /**
   * Create initial data structure for new player
   */
  createInitialData(playerName) {
    // Check if we already have data for this user (shouldn't happen, but safety check)
    if (this.data && this.data.userId === playerName) {
      console.log('WARNING: Attempting to create initial data for existing user:', playerName);
      console.log('Using existing data instead of creating new');
      return this.data;
    }
    
    this.data = {
      userId: playerName,
      gameData: {
        level: 1,
        hp: 100,
        mp: 100,
        stm: 100,
        exp: 0,
        fatigue: 0,
        name: playerName,
        job: "None",
        ping: "60 ms",
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
      STS: 0,
      authenticated: true,
      authTimestamp: Date.now()
    };
    
    console.log('Initial data created for:', playerName);
    return this.data;
  }
}

// Make it available globally
window.UserManager = UserManager;

// Create and initialize a global instance
window.userManager = new UserManager();

// Auto-initialize with a default user ID for testing
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Use a consistent test user ID instead of creating new ones
        const defaultUserId = 'testUser';
        await window.userManager.setUserId(defaultUserId);
        console.log('UserManager initialized with default ID:', defaultUserId);
    } catch (error) {
        console.error('Error initializing UserManager:', error);
    }
});
