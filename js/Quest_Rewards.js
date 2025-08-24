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
    
  } catch (error) {
    console.error('Error initializing user manager:', error);
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
    
    



