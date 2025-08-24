// Initiation Phase with Typing Animation
let typingIndex = 0;
let typingSpeed = 50; // Speed of typing animation
const introText = `Welcome, young initiate, to the sacred halls of SysLVLUP.

You stand at the threshold of a journey that will test your mind, body, and spirit. This is not merely a game - it is a path to self-discovery and growth.

The trials ahead will challenge your:
• Physical endurance and strength
• Mental clarity and wisdom  
• Spiritual resilience and faith

Each quest completed, each challenge overcome, brings you closer to understanding your true potential.

Are you ready to begin your initiation?
Will you accept the quest and embrace the path of the warrior?

The choice is yours, but remember: once you step forward, there is no turning back.

Choose wisely, young one...`;

document.addEventListener("DOMContentLoaded", function() {
  console.log('Initiation page DOM loaded');
  
  // Wait for user manager to be ready
  waitForUserManager();
});

// Wait for user manager to be ready
function waitForUserManager() {
  if (window.userManager && window.userManager.data !== null) {
    console.log('User manager ready, starting initiation...');
    startTypingAnimation();
    setupEventListeners();
  } else {
    console.log('Waiting for user manager...');
    setTimeout(waitForUserManager, 100);
  }
}

// Start the typing animation
function startTypingAnimation() {
  console.log('Starting typing animation...');
  const introTextElement = document.getElementById('intro-text');
  
  if (!introTextElement) {
    console.error('Intro text element not found');
    return;
  }
  
  // Clear any existing text
  introTextElement.textContent = '';
  
  // Start typing
  typeNextChar();
}

// Type the next character
function typeNextChar() {
  const introTextElement = document.getElementById('intro-text');
  
  if (typingIndex < introText.length) {
    const char = introText.charAt(typingIndex);
    
    // Handle line breaks
    if (char === '\n') {
      introTextElement.innerHTML += '<br>';
    } else {
      introTextElement.textContent += char;
    }
    
    typingIndex++;
    
    // Continue typing
    setTimeout(typeNextChar, typingSpeed);
  } else {
    console.log('Typing animation complete');
    // Show buttons after typing is complete
    showQuestButtons();
  }
}

// Show the quest buttons
function showQuestButtons() {
  const questButtons = document.querySelector('.quest-buttons');
  if (questButtons) {
    questButtons.style.opacity = '1';
    questButtons.style.animation = 'fadeIn 1s ease forwards';
  }
}

// Setup event listeners
function setupEventListeners() {
  const acceptQuestBtn = document.getElementById('accept-quest');
  const denyQuestBtn = document.getElementById('deny-quest');
  
  if (acceptQuestBtn) {
    acceptQuestBtn.addEventListener('click', function() {
      console.log('Quest accepted, proceeding to game...');
      acceptQuest();
    });
  }
  
  if (denyQuestBtn) {
    denyQuestBtn.addEventListener('click', function() {
      console.log('Quest denied, returning to alarm...');
      denyQuest();
    });
  }
}

// Handle quest acceptance
function acceptQuest() {
  if (window.userManager) {
    // Set initial game data
    const initialGameData = {
      level: 1,
      hp: 100,
      mp: 100,
      stm: 100,
      exp: 0,
      fatigue: 0,
      name: "Your Name",
      ping: "60",
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
      lastResetDate: new Date().toLocaleDateString(),
      STS: 0
    };
    
    // Save the initial game data
    window.userManager.setData('gameData', initialGameData);
    
    // Sync to database
    syncToDatabase().then(() => {
      console.log('Initial game data saved, redirecting to status page...');
      // Redirect to the main game status page
      window.location.href = 'status.html';
    }).catch(error => {
      console.error('Error saving initial data:', error);
      // Still redirect even if save fails
      window.location.href = 'status.html';
    });
  } else {
    console.warn('User manager not available, redirecting anyway...');
    window.location.href = 'status.html';
  }
}

// Handle quest denial
function denyQuest() {
  // Show a message and redirect back to alarm
  showNotification('Quest denied. Returning to alarm...', 'warning');
  
  setTimeout(() => {
    window.location.href = 'alarm.html';
  }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.querySelector('p').textContent = message;
    notification.classList.remove('hidden');
    
    // Add type-specific styling
    notification.className = `notification ${type}`;
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
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
