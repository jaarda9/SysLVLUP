// Daily Quest System
let userManager = null;
let currentUserData = null;

document.addEventListener("DOMContentLoaded", function() {
  console.log('Daily quest page DOM loaded');
  
  // Check if we have a player name and can access user data
  checkForUserData();
});

// Check if we have user data available
async function checkForUserData() {
  const playerName = localStorage.getItem('playerName');
  
  if (playerName) {
    console.log('Player found:', playerName);
    // Initialize user manager and load quest data
    await initializeUserManager();
  } else {
    console.log('No player found, redirecting to alarm page');
    // No player, redirect to alarm page
    setTimeout(() => {
      window.location.href = 'alarm.html';
    }, 1000);
  }
}

// Initialize user manager and load data
async function initializeUserManager() {
  try {
    // Create user manager instance
    userManager = new UserManager();
    
    // Set the user ID and load data
    const result = await userManager.setUserId(localStorage.getItem('playerName'));
    
    // Get current data
    currentUserData = userManager.getData();
    
    if (result.dataFound && currentUserData && currentUserData.gameData) {
      console.log('User data loaded:', currentUserData.gameData);
      // Check for daily reset before loading quest data
      await checkAndPerformDailyReset();
      // Load quest data from user data
      loadQuestDataFromUserData();
    } else {
      console.log('No existing data, using defaults');
      loadQuestDataFromStorage();
    }
    
    setupEventListeners();
    setupQuestNavigationListeners();
    
  } catch (error) {
    console.error('Error initializing user manager:', error);
    // Fallback to default data
    loadQuestDataFromStorage();
    setupEventListeners();
    setupQuestNavigationListeners();
  }
}

// Check if daily reset is needed and perform it
async function checkAndPerformDailyReset() {
  try {
    const currentData = userManager.getData();
    if (!currentData || !currentData.gameData) {
      console.log('No game data available for daily reset check');
      return;
    }
    
    // Use reliable YYYY-MM-DD comparison (match status.js)
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    let lastResetDate = currentData.lastResetDate;
    let lastResetDateObj = null;

    if (lastResetDate) {
      if (lastResetDate.includes('-')) {
        lastResetDateObj = new Date(lastResetDate);
      } else {
        const parts = lastResetDate.split('/');
        if (parts.length === 3) {
          lastResetDateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    }

    const lastResetString = lastResetDateObj ? lastResetDateObj.toISOString().split('T')[0] : null;

    console.log('Daily reset check (daily_quest.js):', { todayString, lastResetDate, lastResetString });

    // If it's a new day, perform the reset
    if (lastResetString !== todayString) {
      console.log('New day detected, performing daily reset...');
      await performDailyReset();
    } else {
      console.log('Same day, no reset needed');
    }
    
  } catch (error) {
    console.error('Error during daily reset check:', error);
  }
}

// Perform the daily reset
async function performDailyReset() {
  try {
    console.log('Performing daily reset...');
    
    const currentData = userManager.getData();
    const gameData = currentData.gameData;
    
    // Reset HP, MP, stamina, and fatigue to full
    gameData.hp = 100;
    gameData.mp = 100;
    gameData.stm = 100;
    gameData.fatigue = 0;

    // Reset daily quests
    gameData.physicalQuests = "[0/4]";
    gameData.mentalQuests = "[0/3]";
    gameData.spiritualQuests = "[0/2]";
    
    // Reset quest cost application flags so costs can apply again today
    gameData.questCostsApplied = { physical: false, mental: false, spiritual: false };
    
    // Update the last reset date (YYYY-MM-DD)
    currentData.lastResetDate = new Date().toISOString().split('T')[0];
    
    // Save the reset data to the database
    await userManager.saveUserData();
    
    console.log('Daily reset completed successfully');
    
    // Show notification to user
    showDailyResetNotification();
    
  } catch (error) {
    console.error('Error performing daily reset:', error);
  }
}

// Show notification for daily reset
function showDailyResetNotification() {
  const notification = document.createElement('div');
  notification.className = 'daily-reset-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-weight: bold;
      text-align: center;
      animation: slideDown 0.5s ease-out;
    ">
      <div style="font-size: 24px; margin-bottom: 10px;">🌅 Daily Reset Complete!</div>
      <div style="font-size: 16px; opacity: 0.9;">
        HP, MP, Stamina, Fatigue, and Daily Quests have been reset.
      </div>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Load quest data from user data (from database)
function loadQuestDataFromUserData() {
  console.log('Loading quest data from user data...');
  
  const gameData = currentUserData.gameData || {};
  
  // Update quest display with actual data
  updateQuestDisplay(gameData);
  
  // Check quest completion status
  checkQuestCompletion(gameData);
}

// Load quest data from localStorage (fallback)
function loadQuestDataFromStorage() {
  console.log('Loading quest data from storage (fallback)...');
  
  // For now, use default quest data
  const defaultQuestData = {
    physicalQuests: "[0/4]",
    mentalQuests: "[0/3]",
    spiritualQuests: "[0/2]"
  };
  
  // Update quest display
  updateQuestDisplay(defaultQuestData);
  
  // Check quest completion status
  checkQuestCompletion(defaultQuestData);
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
      console.log('Physical quests not completed yet');
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
      console.log('Mental quests not completed yet');
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
      console.log('Spiritual quests not completed yet');
    }
  }
  
  // Check if all quests are completed
  checkAllQuestsCompleted(gameData);
}

// Check if all quests are completed
function checkAllQuestsCompleted(gameData) {
  const physicalQuests = gameData.physicalQuests || '[0/4]';
  const mentalQuests = gameData.mentalQuests || '[0/3]';
  const spiritualQuests = gameData.spiritualQuests || '[0/2]';
  
  const physicalCount = parseInt(physicalQuests.match(/\d+/)[0]);
  const physicalMax = parseInt(physicalQuests.match(/\/(\d+)/)[1]);
  const mentalCount = parseInt(mentalQuests.match(/\d+/)[0]);
  const mentalMax = parseInt(mentalQuests.match(/\/(\d+)/)[1]);
  const spiritualCount = parseInt(spiritualQuests.match(/\d+/)[0]);
  const spiritualMax = parseInt(spiritualQuests.match(/\/(\d+)/)[1]);
  
  const allCompleted = (physicalCount >= physicalMax) && 
                      (mentalCount >= mentalMax) && 
                      (spiritualCount >= spiritualMax);
  
  const completeCheckbox = document.getElementById('complete');
  if (completeCheckbox) {
    completeCheckbox.disabled = !allCompleted;
    completeCheckbox.checked = allCompleted;
    
    if (allCompleted) {
      console.log('All daily quests completed!');
      showNotification('🎉 All daily quests completed!', 'success');
    }
  }
}

// Set up event listeners for the daily quest page
function setupEventListeners() {
  // Physical quest checkbox
  const physicalCheckbox = document.getElementById('physical-checkbox');
  if (physicalCheckbox) {
    physicalCheckbox.addEventListener('change', function() {
      if (this.checked) {
        console.log('Physical quests marked as completed');
        showNotification('Physical training completed! 💪', 'success');
      }
    });
  }
  
  // Mental quest checkbox
  const mentalCheckbox = document.getElementById('mental-checkbox');
  if (mentalCheckbox) {
    mentalCheckbox.addEventListener('change', function() {
      if (this.checked) {
        console.log('Mental quests marked as completed');
        showNotification('Mental training completed! 🧠', 'success');
      }
    });
  }
  
  // Spiritual quest checkbox
  const spiritualCheckbox = document.getElementById('spiritual-checkbox');
  if (spiritualCheckbox) {
    spiritualCheckbox.addEventListener('change', function() {
      if (this.checked) {
        console.log('Spiritual quests marked as completed');
        showNotification('Spiritual training completed! ✨', 'success');
      }
    });
  }
  
  // Complete checkbox
  const completeCheckbox = document.getElementById('complete');
  if (completeCheckbox) {
    completeCheckbox.addEventListener('change', function() {
      if (this.checked) {
        console.log('All daily quests completed!');
        showNotification('🎉 All daily quests completed! You are amazing!', 'success');
        handleDailyQuestCompletion();
      }
    });
  }
}

// Set up navigation listeners for quest counters
function setupQuestNavigationListeners() {
  // Physical quests navigation
  const physicalQuestsElement = document.getElementById('physicalQuests');
  if (physicalQuestsElement) {
    physicalQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Physical Quest page');
      window.location.href = 'Quest_Info_Physical.html';
    });
  }
  
  // Mental quests navigation
  const mentalQuestsElement = document.getElementById('mentalQuests');
  if (mentalQuestsElement) {
    mentalQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Mental Quest page');
      window.location.href = 'Quest_Info_Mental.html';
    });
  }
  
  // Spiritual quests navigation
  const spiritualQuestsElement = document.getElementById('spiritualQuests');
  if (spiritualQuestsElement) {
    spiritualQuestsElement.addEventListener('click', function() {
      console.log('Navigating to Spiritual Quest page');
      window.location.href = 'Quest_Info_Spiritual.html';
    });
  }
}

// Handle daily quest completion
function handleDailyQuestCompletion() {
  console.log('Daily quest completion reward!');
  showNotification('🏆 Daily quest completed! +50 EXP earned!', 'success');
  
  // Here you would typically update the user's data
  // For now, just show the notification
}

// Show notification message
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#4CAF50';
      break;
    case 'warning':
      notification.style.backgroundColor = '#FF9800';
      break;
    case 'error':
      notification.style.backgroundColor = '#F44336';
      break;
    default:
      notification.style.backgroundColor = '#2196F3';
  }
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
