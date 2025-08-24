// Daily Quest System
document.addEventListener("DOMContentLoaded", function() {
  console.log('Daily quest page DOM loaded');
  
  // Wait for user manager to be ready
  waitForUserManager();
});

// Wait for user manager to be ready
function waitForUserManager() {
  if (window.userManager && window.userManager.data !== null) {
    console.log('User manager ready, loading daily quest data...');
    loadQuestData();
    setupEventListeners();
    checkForNewDay();
    
    // Set up periodic refresh to stay in sync with other pages
    setupPeriodicRefresh();
  } else {
    console.log('Waiting for user manager...');
    setTimeout(waitForUserManager, 100);
  }
}

// Setup periodic refresh to stay in sync with progress from other pages
function setupPeriodicRefresh() {
  // Refresh quest data every 2 seconds to stay in sync
  setInterval(() => {
    if (window.userManager && window.userManager.data !== null) {
      console.log('Refreshing quest data to stay in sync...');
      loadQuestData();
    }
  }, 2000);
  
  // Also refresh when the page becomes visible (user returns from other pages)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.userManager && window.userManager.data !== null) {
      console.log('Page became visible, refreshing quest data...');
      loadQuestData();
    }
  });
}

// Load quest data from user manager
function loadQuestData() {
  if (window.userManager) {
    const userData = window.userManager.getData();
    const gameData = userData.gameData || {};
    
    console.log('Loading quest data:', gameData);
    
    // Update quest counters
    updateQuestDisplay(gameData);
    
    // Check quest completion status
    checkQuestCompletion(gameData);
  }
}

// Update quest display in the UI
function updateQuestDisplay(gameData) {
  // Update physical quests
  const physicalQuestsElement = document.getElementById('physicalQuests');
  if (physicalQuestsElement) {
    physicalQuestsElement.textContent = gameData.physicalQuests || '[0/4]';
    console.log('Physical quests display updated:', gameData.physicalQuests);
  }
  
  // Update mental quests
  const mentalQuestsElement = document.getElementById('mentalQuests');
  if (mentalQuestsElement) {
    mentalQuestsElement.textContent = gameData.mentalQuests || '[0/3]';
    console.log('Mental quests display updated:', gameData.mentalQuests);
  }
  
  // Update spiritual quests
  const spiritualQuestsElement = document.getElementById('spiritualQuests');
  if (spiritualQuestsElement) {
    spiritualQuestsElement.textContent = gameData.spiritualQuests || '[0/2]';
    console.log('Spiritual quests display updated:', gameData.spiritualQuests);
  }
}

// Check quest completion and enable/disable checkboxes accordingly
function checkQuestCompletion(gameData) {
  console.log('Checking quest completion...');
  
  // Physical quests (0/4)
  const physicalCheckbox = document.getElementById('physical-checkbox');
  if (physicalCheckbox) {
    const physicalQuests = gameData.physicalQuests || '[0/4]';
    const physicalCount = parseInt(physicalQuests.match(/\d+/)[0]);
    const physicalMax = parseInt(physicalQuests.match(/\/(\d+)/)[1]);
    
    if (physicalCount >= physicalMax) {
      physicalCheckbox.disabled = false;
      physicalCheckbox.checked = true;
      console.log('Physical quests completed');
    } else {
      physicalCheckbox.disabled = true;
      physicalCheckbox.checked = false;
      console.log('Physical quests not completed:', physicalCount + '/' + physicalMax);
    }
  }
  
  // Mental quests (0/3)
  const mentalCheckbox = document.getElementById('mental-checkbox');
  if (mentalCheckbox) {
    const mentalQuests = gameData.mentalQuests || '[0/3]';
    const mentalCount = parseInt(mentalQuests.match(/\d+/)[0]);
    const mentalMax = parseInt(mentalQuests.match(/\/(\d+)/)[1]);
    
    if (mentalCount >= mentalMax) {
      mentalCheckbox.disabled = false;
      mentalCheckbox.checked = true;
      console.log('Mental quests completed');
    } else {
      mentalCheckbox.disabled = true;
      mentalCheckbox.checked = false;
      console.log('Mental quests not completed:', mentalCount + '/' + mentalMax);
    }
  }
  
  // Spiritual quests (0/2)
  const spiritualCheckbox = document.getElementById('spiritual-checkbox');
  if (spiritualCheckbox) {
    const spiritualQuests = gameData.spiritualQuests || '[0/2]';
    const spiritualCount = parseInt(spiritualQuests.match(/\d+/)[0]);
    const spiritualMax = parseInt(spiritualQuests.match(/\/(\d+)/)[1]);
    
    if (spiritualCount >= spiritualMax) {
      spiritualCheckbox.disabled = false;
      spiritualCheckbox.checked = true;
      console.log('Spiritual quests completed');
    } else {
      spiritualCheckbox.disabled = true;
      spiritualCheckbox.checked = false;
      console.log('Spiritual quests not completed:', spiritualCount + '/' + spiritualMax);
    }
  }
  
  // Check if all quests are completed
  checkAllQuestsCompleted();
}

// Check if all quests are completed and enable the final completion checkbox
function checkAllQuestsCompleted() {
  const physicalCheckbox = document.getElementById('physical-checkbox');
  const mentalCheckbox = document.getElementById('mental-checkbox');
  const spiritualCheckbox = document.getElementById('spiritual-checkbox');
  const completeCheckbox = document.getElementById('complete');
  
  if (physicalCheckbox && mentalCheckbox && spiritualCheckbox && completeCheckbox) {
    const allCompleted = !physicalCheckbox.disabled && !mentalCheckbox.disabled && !spiritualCheckbox.disabled;
    
    if (allCompleted) {
      completeCheckbox.disabled = false;
      console.log('All quests completed, final checkbox enabled');
    } else {
      completeCheckbox.disabled = true;
      completeCheckbox.checked = false;
      console.log('Not all quests completed, final checkbox disabled');
    }
  }
}

// Setup event listeners for checkboxes
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Physical quest checkbox
  const physicalCheckbox = document.getElementById('physical-checkbox');
  if (physicalCheckbox) {
    physicalCheckbox.addEventListener('change', function() {
      console.log('Physical quest checkbox changed:', this.checked);
      if (this.checked) {
        // Quest completed - could add rewards here
        console.log('Physical quest completed!');
      }
    });
  }
  
  // Mental quest checkbox
  const mentalCheckbox = document.getElementById('mental-checkbox');
  if (mentalCheckbox) {
    mentalCheckbox.addEventListener('change', function() {
      console.log('Mental quest checkbox changed:', this.checked);
      if (this.checked) {
        // Quest completed - could add rewards here
        console.log('Mental quest completed!');
      }
    });
  }
  
  // Spiritual quest checkbox
  const spiritualCheckbox = document.getElementById('spiritual-checkbox');
  if (spiritualCheckbox) {
    spiritualCheckbox.addEventListener('change', function() {
      console.log('Spiritual quest checkbox changed:', this.checked);
      if (this.checked) {
        // Quest completed - could add rewards here
        console.log('Spiritual quest completed!');
      }
    });
  }
  
  // Final completion checkbox
  const completeCheckbox = document.getElementById('complete');
  if (completeCheckbox) {
    completeCheckbox.addEventListener('change', function() {
      console.log('Final completion checkbox changed:', this.checked);
      if (this.checked) {
        // All quests completed - could add major rewards here
        console.log('All daily quests completed!');
        handleDailyQuestCompletion();
      }
    });
  }
  
  // Setup quest counter navigation listeners
  setupQuestNavigationListeners();
}

// Setup quest counter navigation listeners
function setupQuestNavigationListeners() {
  console.log('Setting up quest navigation listeners...');
  
  // Physical quest counter - navigate to physical quests page
  const physicalQuestsElement = document.getElementById('physicalQuests');
  if (physicalQuestsElement) {
    physicalQuestsElement.style.cursor = 'pointer';
    physicalQuestsElement.title = 'Click to go to Physical Quests page';
    physicalQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Physical Quests page...');
      window.location.href = 'Quest_Info_Physical.html';
    });
    console.log('Physical quest navigation listener added');
  }
  
  // Mental quest counter - navigate to mental quests page
  const mentalQuestsElement = document.getElementById('mentalQuests');
  if (mentalQuestsElement) {
    mentalQuestsElement.style.cursor = 'pointer';
    mentalQuestsElement.title = 'Click to go to Mental Quests page';
    mentalQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Mental Quests page...');
      window.location.href = 'Quest_Info_Mental.html';
    });
    console.log('Mental quest navigation listener added');
  }
  
  // Spiritual quest counter - navigate to spiritual quests page
  const spiritualQuestsElement = document.getElementById('spiritualQuests');
  if (spiritualQuestsElement) {
    spiritualQuestsElement.style.cursor = 'pointer';
    spiritualQuestsElement.title = 'Click to go to Spiritual Quests page';
    spiritualQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Spiritual Quests page...');
      window.location.href = 'Quest_Info_Spiritual.html';
    });
    console.log('Spiritual quest navigation listener added');
  }
}

// Handle daily quest completion
function handleDailyQuestCompletion() {
  console.log('Handling daily quest completion...');
  
  if (window.userManager) {
    const userData = window.userManager.getData();
    const gameData = userData.gameData || {};
    
    // Add rewards or experience
    const currentExp = parseInt(gameData.exp) || 0;
    const newExp = currentExp + 50; // Give 50 exp for completing daily quests
    
    // Update game data
    gameData.exp = newExp;
    
    // Save updated data
    window.userManager.setData('gameData', gameData);
    
    // Sync to database
    syncToDatabase().then(() => {
      console.log('Daily quest completion saved');
      showNotification('Daily quests completed! +50 EXP', 'success');
    }).catch(error => {
      console.error('Error saving daily quest completion:', error);
    });
  }
}

// Check for new day and reset quests if needed
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString();
  const userData = window.userManager ? window.userManager.getData() : {};
  const lastResetDate = userData.lastResetDate;
  
  console.log('Current Date:', currentDate);
  console.log('Last Reset Date:', lastResetDate);
  
  // If no date is saved or the day has changed, reset the quests
  if (!lastResetDate || lastResetDate !== currentDate) {
    console.log('New day detected, resetting daily quests...');
    resetDailyQuests(currentDate);
  } else {
    console.log('Same day, no reset needed');
  }
}

// Reset daily quests
function resetDailyQuests(currentDate) {
  if (window.userManager) {
    const userData = window.userManager.getData();
    const gameData = userData.gameData || {};
    
    // Reset quest progress
    gameData.physicalQuests = '[0/4]';
    gameData.mentalQuests = '[0/3]';
    gameData.spiritualQuests = '[0/2]';
    
    // Update last reset date
    userData.lastResetDate = currentDate;
    
    // Save updated data
    window.userManager.setData('gameData', gameData);
    window.userManager.setData('lastResetDate', currentDate);
    
    // Sync to database
    syncToDatabase().then(() => {
      console.log('Daily quests reset successfully');
      // Reload quest display
      loadQuestData();
    }).catch(error => {
      console.error('Error resetting daily quests:', error);
    });
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Use user manager for syncing
async function syncToDatabase() {
  if (window.userManager) {
    try {
      await window.userManager.saveUserData();
      console.log('Sync successful via user manager');
      return { success: true, message: 'Data synced successfully' };
    } catch (error) {
      console.error('Error syncing to database:', error);
      throw error;
    }
  } else {
    console.warn('User manager not available for syncing');
    return { success: false, message: 'User manager not available' };
  }
}
