document.addEventListener("DOMContentLoaded", function() {
  console.log('Alarm page DOM loaded');
  
  // Set up event listeners immediately since we don't need user manager for this page
  setupEventListeners();
});

// Setup event listeners for the alarm page
function setupEventListeners() {
  const playerBtn = document.getElementById("playerBtn");
  if (playerBtn) {
    playerBtn.addEventListener("click", function () {
      console.log('Player button clicked');
      
      // Check if player has a name set in localStorage
      const playerName = localStorage.getItem('playerName');
      
      if (playerName && playerName.trim() !== '') {
        console.log('Player has name, redirecting to status.html');
        window.location.href = "status.html";
      } else {
        console.log('No player name found, redirecting to Initiation.html');
        window.location.href = "Initiation.html";
      }
    });
    console.log('Player button event listener added');
  } else {
    console.error('Player button not found');
  }
}

