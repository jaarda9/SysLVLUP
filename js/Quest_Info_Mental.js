// Mental Quest System - Updated for new UserManager
let userManager = null;
let currentUserData = null;

document.addEventListener("DOMContentLoaded", function() {
  console.log('Mental Quest page loaded');
  
  // Check if we have a player name
  const playerName = localStorage.getItem('playerName');
  if (!playerName) {
    console.log('No player found, redirecting to alarm page');
    setTimeout(() => {
      window.location.href = 'alarm.html';
    }, 1000);
    return;
  }
  
  // Initialize user manager and load data
  initializeQuestPage();
});

// Initialize the quest page
async function initializeQuestPage() {
  try {
    // Create user manager instance
    userManager = new UserManager();
    
    // Set the user ID and load data
    await userManager.setUserId(localStorage.getItem('playerName'));
    
    // Get current data
    currentUserData = userManager.getData();
    
    if (currentUserData && currentUserData.gameData) {
      console.log('User data loaded:', currentUserData.gameData);
      loadData(currentUserData.gameData);
    } else {
      console.log('No existing data, using defaults');
      loadData({});
    }
    
    // Render the mental tasks
    renderMentalTasks();
    
  } catch (error) {
    console.error('Error initializing quest page:', error);
    // Fallback to default data
    loadData({});
    renderMentalTasks();
  }
}

// Load Data Function
function loadData(savedData) {
  if (savedData) {
    // Load saved data into UI
    const levelNumber = document.querySelector(".level-number");
    if (levelNumber) levelNumber.textContent = savedData.level || 1;
    
    const hpFill = document.getElementById("hp-fill");
    if (hpFill) hpFill.style.width = (savedData.hp || 100) + "%";
    
    const mpFill = document.getElementById("mp-fill");
    if (mpFill) mpFill.style.width = (savedData.mp || 100) + "%";
    
    const stmFill = document.getElementById("stm-fill");
    if (stmFill) stmFill.style.width = (savedData.stm || 100) + "%";
    
    const expFill = document.getElementById("exp-fill");
    if (expFill) expFill.style.width = (savedData.exp || 0) + "%";
    
    const fatValue = document.getElementById("Fatvalue");
    if (fatValue) fatValue.textContent = savedData.fatigue || 0;
    
    const jobText = document.getElementById("job-text");
    if (jobText) jobText.textContent = savedData.name || "Your Name";
    
    const pingText = document.getElementById("ping-text");
    if (pingText) pingText.textContent = savedData.ping || "60 ms";
    
    const guildText = document.getElementById("guild-text");
    if (guildText) guildText.textContent = savedData.guild || "Reaper";
    
    const raceText = document.getElementById("race-text");
    if (raceText) raceText.textContent = savedData.race || "Hunter";
    
    const titleText = document.getElementById("title-text");
    if (titleText) titleText.textContent = savedData.title || "None";
    
    const regionText = document.getElementById("region-text");
    if (regionText) regionText.textContent = savedData.region || "TN";
    
    const locationText = document.getElementById("location-text");
    if (locationText) locationText.textContent = savedData.location || "Hospital";
    
    // Load attributes if they exist
    if (savedData.Attributes) {
      const strElement = document.getElementById("str");
      if (strElement) strElement.textContent = `STR: ${savedData.Attributes.STR}`;
      
      const vitElement = document.getElementById("vit");
      if (vitElement) vitElement.textContent = `VIT: ${savedData.Attributes.VIT}`;
      
      const agiElement = document.getElementById("agi");
      if (agiElement) agiElement.textContent = `AGI: ${savedData.Attributes.AGI}`;
      
      const intElement = document.getElementById("int");
      if (intElement) intElement.textContent = `INT: ${savedData.Attributes.INT}`;
      
      const perElement = document.getElementById("per");
      if (perElement) perElement.textContent = `PER: ${savedData.Attributes.PER}`;
      
      const wisElement = document.getElementById("wis");
      if (wisElement) wisElement.textContent = `WIS: ${savedData.Attributes.WIS}`;
    }
  } else {
    resetData();
  }
}

// Reset Data Function
function resetData() {
  const defaultGameData = {
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
  };
  
  if (userManager) {
    userManager.setData('gameData', defaultGameData);
  }
  
  loadData(defaultGameData);
}

// Save Data Function
async function saveData() {
  if (!userManager) {
    console.warn('User manager not available');
    return;
  }
  
  try {
    // Get current form data
    const newData = {
      level: parseInt(document.querySelector(".level-number")?.textContent) || 1,
      hp: parseInt(document.getElementById("hp-fill")?.style.width) || 100,
      mp: parseInt(document.getElementById("mp-fill")?.style.width) || 100,
      stm: parseInt(document.getElementById("stm-fill")?.style.width) || 100,
      exp: parseInt(document.getElementById("exp-fill")?.style.width) || 0,
      fatigue: parseInt(document.querySelector(".fatigue-value")?.textContent) || 0,
      name: document.getElementById("job-text")?.textContent || "Your Name",
      ping: document.getElementById("ping-text")?.textContent || "60 ms",
      guild: document.getElementById("guild-text")?.textContent || "Reaper",
      race: document.getElementById("race-text")?.textContent || "Hunter",
      title: document.getElementById("title-text")?.textContent || "None",
      region: document.getElementById("region-text")?.textContent || "TN",
      location: document.getElementById("location-text")?.textContent || "Hospital",
    };

    // Get existing data
    const existingData = userManager.getData();
    const gameData = existingData.gameData || {};

    // Merge existing data with updated data
    const mergedData = { ...gameData, ...newData };

    // Save the merged data via user manager
    if (userManager) {
      userManager.setData('gameData', mergedData);
      
      // Save to database
      const result = await userManager.saveUserData();
      if (result.success) {
        console.log('Data saved successfully');
      } else {
        console.error('Error saving data:', result.error);
      }
    }
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Define the mental tasks that are the same every day
const mentalTasks = [
    { name: "Study Session", target: "2 hours", xp: 2.5, stats: { INT: 1 }, completed: false },
    { name: "Problem Solving", target: "5 problems", xp: 2.5, stats: { INT: 1 }, completed: false },
    { name: "Reading", target: "50 pages", xp: 2.5, stats: { PER: 1 }, completed: false }
];

// Function to render mental tasks
function renderMentalTasks() {
    const goalItemsDiv = document.getElementById("goal-items");
    if (!goalItemsDiv) {
        console.error('Goal items div not found');
        return;
    }

    goalItemsDiv.innerHTML = ''; // Clear existing tasks

    mentalTasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("goal-item");

        taskDiv.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-reps">[${task.target}]</span>
            <input type="checkbox" ${task.completed ? "checked" : ""} onchange="completeMentalTask('${task.name}')">
        `;
        goalItemsDiv.appendChild(taskDiv);
    });

    updateCompleteCheckbox();
}

// Function to toggle the completion state of a mental task
function completeMentalTask(taskName) {
    const task = mentalTasks.find(t => t.name === taskName);
    if (task) {
        task.completed = !task.completed;
        console.log(`Task ${taskName} ${task.completed ? 'completed' : 'uncompleted'}`);
    }
    renderMentalTasks(); // Re-render the tasks to reflect changes
    updateCompleteCheckbox(); // Update the overall completion status
}

// Modified updateCompleteCheckbox function
function updateCompleteCheckbox() {
    const allCompleted = mentalTasks.every(task => task.completed);
    const completeCheckbox = document.getElementById("complete");

    if (completeCheckbox) {
        completeCheckbox.checked = allCompleted;

        // If all tasks are completed, trigger completion
        if (allCompleted) {
            console.log('All mental tasks completed!');
            
            // Update the mental quest progress in user data
            updateMentalQuestProgress();
            
            // Trigger completion animation and redirect
            const label = completeCheckbox.nextElementSibling;
            if (label) {
                label.classList.remove('animate'); // Remove class if it exists
                void label.offsetWidth; // Trigger reflow to reset the animation
                label.classList.add('animate'); // Add class to trigger animation
            }
            
            // Redirect to reward page after animation
            setTimeout(function() {
                window.location.href = 'Quest_Rewards.html?data=mental';
            }, 1000);
        }
    }
}

// Update mental quest progress in user data
async function updateMentalQuestProgress() {
    if (!userManager) {
        console.warn('User manager not available');
        return;
    }
    
    try {
        // Get current user data
        const userData = userManager.getData();
        const gameData = userData.gameData || {};
        
        console.log('Updating mental quest stats...');
        
        // Add XP reward
        const currentExp = parseInt(gameData.exp) || 0;
        gameData.exp = currentExp + 5;
        console.log(`XP increased from ${currentExp} to ${gameData.exp}`);
        
        // Decrease MP and STM, increase fatigue
        const currentMP = Math.max(0, parseInt(gameData.mp) || 100);
        gameData.mp = Math.max(0, currentMP - 20);
        console.log(`MP decreased from ${currentMP} to ${gameData.mp}`);
        
        const currentSTM = Math.max(0, parseInt(gameData.stm) || 100);
        gameData.stm = Math.max(0, currentSTM - 10);
        console.log(`STM decreased from ${currentSTM} to ${gameData.stm}`);
        
        const currentFatigue = parseInt(gameData.fatigue) || 0;
        gameData.fatigue = currentFatigue + 20;
        console.log(`Fatigue increased from ${currentFatigue} to ${gameData.fatigue}`);
        
        // Add stacked attributes (will be applied on level up)
        if (!gameData.stackedAttributes) {
            gameData.stackedAttributes = { STR: 0, VIT: 0, AGI: 0, INT: 0, PER: 0, WIS: 0 };
        }
        
        // Mental training gives INT and PER bonuses
        gameData.stackedAttributes.INT += 2;  // Intelligence from study and problem solving
        gameData.stackedAttributes.PER += 1;  // Perception from reading
        
        console.log('Stacked attributes updated:', gameData.stackedAttributes);
        
        // Check for level up
        if (gameData.exp >= 100) {
            await handleLevelUp(gameData);
        }
        
        // Update mental quest progress to completed
        gameData.mentalQuests = "[3/3]";
        
        // Update user data
        userManager.setData('gameData', gameData);
        
        // Save to database
        const result = await userManager.saveUserData();
        if (result.success) {
            console.log('Mental quest progress and stats saved successfully');
        } else {
            console.error('Error saving mental quest progress:', result.error);
        }
        
    } catch (error) {
        console.error('Error updating mental quest progress:', error);
    }
}

// Handle level up when XP reaches 100
async function handleLevelUp(gameData) {
    console.log('🎉 LEVEL UP!');
    
    // Reset XP and increase level
    gameData.exp = gameData.exp - 100;
    gameData.level = parseInt(gameData.level || 1) + 1;
    
    console.log(`Level increased to ${gameData.level}, XP reset to ${gameData.exp}`);
    
    // Apply stacked attributes to base attributes
    if (gameData.stackedAttributes && gameData.Attributes) {
        console.log('Applying stacked attributes to base attributes...');
        
        for (let stat in gameData.stackedAttributes) {
            if (gameData.Attributes[stat] !== undefined) {
                const oldValue = gameData.Attributes[stat];
                gameData.Attributes[stat] += gameData.stackedAttributes[stat];
                console.log(`${stat}: ${oldValue} → ${gameData.Attributes[stat]} (+${gameData.stackedAttributes[stat]})`);
            }
        }
        
        // Reset stacked attributes
        for (let stat in gameData.stackedAttributes) {
            gameData.stackedAttributes[stat] = 0;
        }
        
        console.log('Stacked attributes reset to 0');
    }
    
    // Restore HP, MP, and STM to full on level up
    gameData.hp = 100;
    gameData.mp = 100;
    gameData.stm = 100;
    console.log('HP, MP, and STM restored to full on level up');
}

// Function to complete a quest and gain XP
async function completeMentalQuest(taskName) {
    const task = mentalTasks.find(t => t.name === taskName);

    if (task && !task.completed) {
        try {
            // Mark task as completed locally
            task.completed = true;
            console.log(`Quest completed: ${taskName}`);
            
            // Get current game data
            const gameData = currentUserData.gameData;
            
            // Parse current quest progress
            const currentProgress = gameData.mentalQuests || "[0/3]";
            const match = currentProgress.match(/\[(\d+)\/(\d+)\]/);
            const currentCompleted = match ? parseInt(match[1]) : 0;
            const totalQuests = match ? parseInt(match[2]) : 3;
            
            // Update quest progress
            const newCompleted = Math.min(currentCompleted + 1, totalQuests);
            gameData.mentalQuests = `[${newCompleted}/${totalQuests}]`;
            
            // Add EXP for completing the quest
            gameData.exp = (gameData.exp || 0) + 25;
            console.log(`EXP gained: +25 (Total: ${gameData.exp})`);
            
            // Add stacked attributes for mental training
            if (!gameData.stackedAttributes) {
                gameData.stackedAttributes = { STR: 0, VIT: 0, AGI: 0, INT: 0, PER: 0, WIS: 0 };
            }
            gameData.stackedAttributes.INT += 2;  // Intelligence from mental training
            gameData.stackedAttributes.PER += 1;  // Perception from mental training
            
            console.log('Stacked attributes updated:', gameData.stackedAttributes);
            
            // Check for level up
            if (gameData.exp >= 100) {
                await handleLevelUp(gameData);
            }
            
            // Update user data
            userManager.setData('gameData', gameData);
            
            // Save to database
            const result = await userManager.saveUserData();
            if (result.success) {
                console.log('Quest completion saved successfully');
                showNotification(`✅ Quest completed! +25 EXP, +2 INT, +1 PER`, 'success');
            } else {
                console.error('Error saving quest completion:', result.error);
                showNotification('❌ Error saving quest completion', 'error');
            }
            
            // Update the task display
            renderMentalTasks();
            updateCompleteCheckbox();
            
            // Update UI to reflect new stats
            loadData(gameData);
            
        } catch (error) {
            console.error('Error completing quest:', error);
            showNotification('❌ Error completing quest', 'error');
        }
    }
}

// Function to update the Mental Status Card (display user XP and stats)
function updateMentalStatusCard() {
    if (currentUserData && currentUserData.gameData) {
        const exp = currentUserData.gameData.exp || 0;
        const int = currentUserData.gameData.Attributes?.INT || 10;
        const per = currentUserData.gameData.Attributes?.PER || 10;
        console.log(`Current XP: ${exp}`);
        console.log(`Stats: INT - ${int}, PER - ${per}`);
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 
                         type === 'error' ? 'linear-gradient(135deg, #f44336, #da190b)' : 
                         'linear-gradient(135deg, #2196F3, #0b7dda)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            text-align: center;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        ">
            ${message}
        </div>
    `;
    
    // Add CSS animation
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
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Auto-redirect to penalty page after 2 hours (7200000 ms)
setTimeout(function() {
    console.log('Auto-redirecting to penalty page');
    window.location.href = 'Penalty_Quest.html';
}, 7200000); 
