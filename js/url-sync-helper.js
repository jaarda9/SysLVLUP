/**
 * Simplified URL Sync Helper
 * Works with direct MongoDB data fetching
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
    
    // The user manager will handle data loading automatically
    console.log('URL Sync Helper - User manager will handle data loading');
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
