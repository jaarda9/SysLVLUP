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
    await this.loadUserData();
    
    return this.userId;
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
      const response = await fetch(`/api/user/${encodeURIComponent(this.userId)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          this.data = result.data;
          console.log('Data loaded successfully:', this.data);
          return { success: true, data: this.data };
        } else {
          console.log('No existing data found for user:', this.userId);
          this.data = null;
          return { success: true, message: 'No existing data' };
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.data = null;
      return { success: false, error: error.message };
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

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          data: this.data
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data saved successfully:', result);
        return { success: true, data: result };
      } else {
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
