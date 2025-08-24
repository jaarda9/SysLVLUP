/**
 * Simple User Manager - Uses player name as user ID
 */
class UserManager {
  constructor() {
    this.userId = null;
    this.data = null;
    this.isLoading = false;
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
    return {
      userId: this.userId,
      dataFound: loadResult.success && this.data && this.data.gameData
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
      // Try to load from /api/sync first (Vercel API)
      let response = await fetch(`/api/sync?userId=${encodeURIComponent(this.userId)}`);
      
      // If sync API fails, try the users API as fallback
      if (response.status === 404) {
        console.log('Sync API not found, trying users API...');
        response = await fetch(`/api/users?userId=${encodeURIComponent(this.userId)}`);
      }
      
      if (response.ok) {
        const result = await response.json();
        if (result.localStorageData) {
          this.data = result.localStorageData;
          console.log('Data loaded successfully from API:', this.data);
          return { success: true, data: this.data };
        } else {
          console.log('No existing data found for user:', this.userId);
          this.data = null;
          return { success: true, message: 'No existing data' };
        }
      } else if (response.status === 404) {
        // Check if it's a 404 from the API (user not found) or a 404 from Vercel (API not found)
        try {
          const errorData = await response.json();
          if (errorData.error === 'User not found') {
            console.log('User not found in database:', this.userId);
            this.data = null;
            return { success: true, message: 'No existing data' };
          }
        } catch (parseError) {
          // If we can't parse the response, it might be a Vercel 404
          console.log('API endpoint not found (404), treating as no existing data');
          this.data = null;
          return { success: true, message: 'No existing data' };
        }
        
        console.log('No existing data found for user:', this.userId);
        this.data = null;
        return { success: true, message: 'No existing data' };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's a network error or API is not available, treat as no existing data
      console.log('API error, treating as no existing data');
      this.data = null;
      return { success: true, message: 'No existing data' };
    } finally {
      this.isLoading = false;
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
   * Create initial data structure for new player
   */
  createInitialData(playerName) {
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
