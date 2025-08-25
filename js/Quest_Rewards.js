// Quest Rewards System - Simplified and Clean
let userManager = null;
let questType = null;

document.addEventListener("DOMContentLoaded", function() {
  console.log('Quest Rewards page loaded');
  
  // Get quest type from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  questType = urlParams.get('data');
  console.log('Quest type:', questType);
  
  // Check if we have a player name
  const playerName = localStorage.getItem('playerName');
  if (!playerName) {
    console.log('No player found, redirecting to alarm page');
    setTimeout(() => {
      window.location.href = 'alarm.html';
    }, 1000);
    return;
  }
  
  // Initialize user manager
  initializeUserManager();
});

// Initialize user manager
async function initializeUserManager() {
  try {
    // Create user manager instance
    userManager = new UserManager();
    
    // Set the user ID and load data
    await userManager.setUserId(localStorage.getItem('playerName'));
    
    console.log('User manager initialized for rewards page');
    // Apply final quest costs/progress on rewards page load
    await applyQuestCompletionEffects();
    
  } catch (error) {
    console.error('Error initializing user manager:', error);
  }
}

// Apply quest completion costs and finalize progress once
async function applyQuestCompletionEffects() {
  try {
    if (!userManager) return;
    const userData = userManager.getData();
    if (!userData || !userData.gameData) return;
    const gameData = userData.gameData;

    if (!questType) {
      console.warn('No questType provided. Skipping cost application.');
      return;
    }

    if (questType === 'physical') {
      if (gameData.physicalQuests === '[4/4]') {
        console.log('Physical quests already finalized. Skipping costs.');
      } else {
        const startHP = Math.max(0, parseInt(gameData.hp) || 100);
        const startSTM = Math.max(0, parseInt(gameData.stm) || 100);
        const startFatigue = parseInt(gameData.fatigue) || 0;
        gameData.hp = Math.max(0, startHP - 20);
        gameData.stm = Math.max(0, startSTM - 20);
        gameData.fatigue = startFatigue + 20;
        gameData.physicalQuests = '[4/4]';
        console.log(`Applied Physical costs: HP ${startHP}->${gameData.hp}, STM ${startSTM}->${gameData.stm}, Fatigue ${startFatigue}->${gameData.fatigue}`);
      }
    } else if (questType === 'mental') {
      if (gameData.mentalQuests === '[3/3]') {
        console.log('Mental quests already finalized. Skipping costs.');
      } else {
        const startMP = Math.max(0, parseInt(gameData.mp) || 100);
        const startSTM = Math.max(0, parseInt(gameData.stm) || 100);
        const startFatigue = parseInt(gameData.fatigue) || 0;
        gameData.mp = Math.max(0, startMP - 20);
        gameData.stm = Math.max(0, startSTM - 10);
        gameData.fatigue = startFatigue + 20;
        gameData.mentalQuests = '[3/3]';
        console.log(`Applied Mental costs: MP ${startMP}->${gameData.mp}, STM ${startSTM}->${gameData.stm}, Fatigue ${startFatigue}->${gameData.fatigue}`);
      }
    } else if (questType === 'spiritual') {
      if (gameData.spiritualQuests === '[2/2]') {
        console.log('Spiritual quests already finalized. Skipping costs.');
      } else {
        const startMP = Math.max(0, parseInt(gameData.mp) || 100);
        const startSTM = Math.max(0, parseInt(gameData.stm) || 100);
        const startFatigue = parseInt(gameData.fatigue) || 0;
        gameData.mp = Math.max(0, startMP - 20);
        gameData.stm = Math.max(0, startSTM - 10);
        gameData.fatigue = startFatigue + 20;
        gameData.spiritualQuests = '[2/2]';
        console.log(`Applied Spiritual costs: MP ${startMP}->${gameData.mp}, STM ${startSTM}->${gameData.stm}, Fatigue ${startFatigue}->${gameData.fatigue}`);
      }
    }

    // Save only if we changed something
    userManager.setData('gameData', userData.gameData);
    userManager.lastLoadTime = 0; // force immediate save
    const result = await userManager.saveUserData();
    if (result && result.success) {
      console.log('Quest completion effects saved.');
    } else {
      console.warn('Quest completion effects save skipped or failed.', result);
    }
  } catch (e) {
    console.error('Error applying quest completion effects:', e);
  }
}

// Accept rewards and redirect to status page
function acceptRewards() {
  console.log('Accepting rewards for quest type:', questType);
  
  // Show success message
  showNotification('🎉 Rewards accepted!', 'success');
  
  // Redirect to status page after a short delay
  setTimeout(() => {
    window.location.href = 'status.html';
  }, 1500);
}

// Decline rewards and redirect to status page
function declineRewards() {
  console.log('Declining rewards for quest type:', questType);
  
  // Show message
  showNotification('Rewards declined', 'info');
  
  // Redirect to status page after a short delay
  setTimeout(() => {
    window.location.href = 'status.html';
  }, 1500);
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
    
    



