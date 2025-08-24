document.addEventListener("DOMContentLoaded", function() {
  console.log('Alarm page DOM loaded');
  
  // Wait for user manager to be ready
  waitForUserManager();
});

// Wait for user manager to be ready
function waitForUserManager() {
  if (window.userManager && window.userManager.data !== null) {
    console.log('User manager ready, setting up alarm page...');
    setupEventListeners();
  } else {
    console.log('Waiting for user manager...');
    setTimeout(waitForUserManager, 100);
  }
}

// Setup event listeners after user manager is ready
function setupEventListeners() {
  const playerBtn = document.getElementById("playerBtn");
  if (playerBtn) {
    playerBtn.addEventListener("click", function () {
      console.log('Player button clicked');
      
      if (window.userManager) {
        const userData = window.userManager.getData();
        const gameData = userData.gameData || {};
        
        if (gameData.name === "Your Name") {
          console.log('Redirecting to Initiation.html');
          window.location.href = "Initiation.html";
        } else {
          console.log('Redirecting to status.html');
          window.location.href = "status.html";
        }
      } else {
        console.warn('User manager not available, redirecting to Initiation.html');
        window.location.href = "Initiation.html";
      }
    });
    console.log('Player button event listener added');
  } else {
    console.error('Player button not found');
  }
}

// Use user manager for syncing (if needed for this page)
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

