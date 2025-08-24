/**
 * URL Sync Helper
 * Helps users sync their data across different URLs
 */
class URLSyncHelper {
  constructor() {
    this.checkAndSync();
  }

  /**
   * Check if we need to sync data across URLs
   */
  checkAndSync() {
    const currentUrl = window.location.href;
    const persistentUserId = localStorage.getItem('persistentUserId');
    const oldUserId = localStorage.getItem('userId');
    
    console.log('URL Sync Helper - Current URL:', currentUrl);
    console.log('URL Sync Helper - Persistent User ID:', persistentUserId);
    console.log('URL Sync Helper - Old User ID:', oldUserId);
    
    // If we have a persistent user ID, ensure it's being used
    if (persistentUserId && oldUserId && persistentUserId !== oldUserId) {
      console.log('URL Sync Helper - Migrating to persistent user ID');
      this.migrateToPersistentUserId(persistentUserId);
    }
    
    // Check if we're on a different URL and need to sync
    this.checkForCrossUrlSync();
  }

  /**
   * Migrate to persistent user ID
   */
  migrateToPersistentUserId(persistentUserId) {
    // Update any references to use the persistent ID
    if (window.userManager) {
      window.userManager.userId = persistentUserId;
    }
    
    // Clean up old user ID
    localStorage.removeItem('userId');
    
    console.log('URL Sync Helper - Migration complete');
  }

  /**
   * Check if we need to sync across different URLs
   */
  checkForCrossUrlSync() {
    const persistentUserId = localStorage.getItem('persistentUserId');
    
    if (!persistentUserId) {
      console.log('URL Sync Helper - No persistent user ID found');
      return;
    }
    
    // Try to load data for this user ID
    this.loadDataForUserId(persistentUserId);
  }

  /**
   * Load data for a specific user ID
   */
  async loadDataForUserId(userId) {
    try {
      console.log('URL Sync Helper - Loading data for user:', userId);
      
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const apiEndpoint = isProduction ? '/api/user' : 'http://localhost:3000/api/user';
      
      const response = await fetch(`${apiEndpoint}/${userId}`);
      
      if (response.status === 404) {
        console.log('URL Sync Helper - No data found for user, starting fresh');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.localStorage && Object.keys(result.localStorage).length > 0) {
        console.log('URL Sync Helper - Loading data from database');
        
        // Load data into localStorage
        Object.keys(result.localStorage).forEach(key => {
          const value = result.localStorage[key];
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value);
          }
        });
        
        console.log('URL Sync Helper - Data loaded successfully');
        
        // Reload page to update UI
        if (window.location.pathname.includes('alarm.html') || 
            window.location.pathname.includes('status.html') ||
            window.location.pathname.includes('daily_quest.html')) {
          console.log('URL Sync Helper - Reloading page to update UI');
          window.location.reload();
        }
      }
      
    } catch (error) {
      console.error('URL Sync Helper - Error loading data:', error);
    }
  }

  /**
   * Get current user ID (for debugging)
   */
  getCurrentUserId() {
    return localStorage.getItem('persistentUserId') || localStorage.getItem('userId');
  }

  /**
   * Clear all user data (for testing)
   */
  clearAllData() {
    localStorage.clear();
    console.log('URL Sync Helper - All data cleared');
  }
}

// Create global instance
window.urlSyncHelper = new URLSyncHelper();
