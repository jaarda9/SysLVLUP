// Initiation Phase with Typing Animation
let typingIndex = 0;
let typingSpeed = 50; // Speed of typing animation
const introText = `Welcome, young initiate, to the sacred halls of SysLVLUP.

You stand at the threshold of a journey that will test your mind, body, and spirit. This is not merely a game - it is a path to self-discovery and growth.

The trials ahead will challenge your:
• Physical endurance and strength
• Mental clarity and wisdom  
• Spiritual resilience and faith .

 Each quest completed, each challenge overcome, brings you closer to understanding your true potential.

 Are you ready to begin your initiation?
 Will you accept the quest and embrace the path of the warrior?

 The choice is yours, but remember: once you step forward, there is no turning back.

 Choose wisely, young one...`;

// Initialize the initiation page immediately
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initiation page loaded, starting immediately...');
  startTypingAnimation();
  setupEventListeners();
});

// Start the typing animation for the intro text
function startTypingAnimation() {
  const introTextElement = document.querySelector('.intro-text');
  if (!introTextElement) {
    console.error('Intro text element not found');
    return;
  }

  const fullText = introTextElement.textContent;
  introTextElement.textContent = '';
  introTextElement.style.visibility = 'visible';

  let currentIndex = 0;
  
  function typeNextChar() {
    if (currentIndex < fullText.length) {
      introTextElement.textContent += fullText[currentIndex];
      currentIndex++;
      setTimeout(typeNextChar, 50); // Adjust speed here
    } else {
      // Animation finished, show the quest buttons
      console.log('Typing animation finished, showing quest buttons');
      showQuestButtons();
    }
  }
  
  typeNextChar();
}

// Show the Accept/Deny buttons after typing animation
function showQuestButtons() {
  const questButtons = document.querySelector('.quest-buttons');
  if (questButtons) {
    questButtons.classList.add('show');
    console.log('Quest buttons shown');
  } else {
    console.error('Quest buttons container not found');
  }
}

// Set up event listeners
function setupEventListeners() {
  const acceptBtn = document.getElementById('accept-quest');
  const denyBtn = document.getElementById('deny-quest');
  
  if (acceptBtn) {
    acceptBtn.addEventListener('click', acceptQuest);
  }
  
  if (denyBtn) {
    denyBtn.addEventListener('click', denyQuest);
  }
}

// Handle quest acceptance
function acceptQuest() {
  console.log('Quest accepted! Redirecting to status page...');
  
  // Show notification
  showNotification('Quest accepted! You are now a player.', 'success');
  
  // Redirect to status page where player will enter their name
  setTimeout(() => {
    window.location.href = 'status.html';
  }, 1500);
}

// Handle quest denial
function denyQuest() {
  console.log('Quest denied! Returning to alarm...');
  
  // Show notification
  showNotification('Quest denied. Returning to alarm...', 'warning');
  
  // Redirect back to alarm page
  setTimeout(() => {
    window.location.href = 'alarm.html';
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
