  async function syncToDatabase() {
    try {
      // Use centralized user manager if available
      if (window.userManager) {
        await window.userManager.syncToDatabase();
        console.log('Sync successful using centralized user manager');
        return { success: true, message: 'Data synced successfully' };
      }
      
      // Fallback to original logic if user manager not available
      const localStorageData = JSON.parse(localStorage.getItem("gameData"));
      
      if (!localStorageData || Object.keys(localStorageData).length === 0) {
        console.log('No localStorage data to sync');
        return { success: true, message: 'No data to sync' };
      }

      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return { success: false, message: 'No userId available' };
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          localStorageData: localStorageData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Sync successful:', result);
      return result;

    } catch (error) {
      console.error('Error syncing to database:', error);
      throw error;
    }
  }

let x = 0;
let timer; // Timer variable
let isRunning = false;
let totalDuration = 3000; // Total duration in seconds (50 minutes)
let startTime; // Variable to store the start time
let currentCheckboxId = '';
let currentSTS = parseInt(localStorage.getItem("STS")) || 0; // Default to 0 if STS is not set

function openPomodoro(task, checkboxId) {
    document.getElementById('task-title').textContent = task;
    document.getElementById('pomodoro-modal').style.display = 'block';
    resetTimer(); // Reset timer when opening
    currentCheckboxId = checkboxId; // Store the checkbox ID
}

function showNotification() {
    const notification = document.getElementById("notification");
    
    // Ensure the notification is visible before adding the class
    notification.classList.remove("hidden"); // Remove hidden class if it exists

    // Add the show class to make it visible
    notification.classList.add("show");

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show"); // Remove show class to hide it
        notification.classList.add("hidden"); // Add hidden class back
    }, 3000);
}


function checkForNewDay() {
    const currentDate = new Date().toLocaleDateString(); // Get today's date
    const lastResetDate = localStorage.getItem("lastResetDate"); // Get the last reset date from localStorage
  
    console.log("Current Date:", currentDate);
    console.log("Last Reset Date:", lastResetDate);
  
    // If no date is saved or the day has changed, reset the stats
    if (!lastResetDate || lastResetDate !== currentDate) {
        console.log("Resetting daily stats...");
        currentSTS = 0; // Reset daily quests
        localStorage.setItem("STS", currentSTS); // Update STS in localStorage
        localStorage.setItem("lastResetDate", currentDate); // Update the last reset date
    } else {
        console.log("No reset needed.");
    }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Retrieve currentSTS from localStorage
    currentSTS = parseInt(localStorage.getItem("STS")) || 0; // Default to 0 if STS is not set
    checkForNewDay(); // Check for new day and reset stats if necessary
});

function customRound(num) {
    return (num - Math.floor(num)) > 0.4 ? Math.ceil(num) : Math.floor(num);
  }
  
  let num1 = 2.4;
  console.log(customRound(num1));  // Output: 3
  
  let num2 = 2.3;
  console.log(customRound(num2));  // Output: 2
  

function shakeElement() {
    const element = document.getElementById("complete");
    let position = 0;
    const interval = setInterval(() => {
      position = (position + 1) % 4;
      const offset = position % 2 === 0 ? -10 : 10;
      element.style.transform = `translateX(${offset}px)`;

      if (position === 0) {
        clearInterval(interval);
        element.style.transform = "translateX(0px)";
      }
    }, 100);
  }

function closePomodoro() {
    document.getElementById('pomodoro-modal').style.display = 'none';
    resetTimer(); // Reset timer when closing
}


function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now(); // Record the start time
        timer = setInterval(updateTimerDisplay, 1000); // Update display every second
    }
}


function updateTimerDisplay() {
    const currentTime = Date.now(); // Get the current time
    const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds
    const timeLeft = totalDuration - elapsedTime; // Calculate remaining time

    if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        document.getElementById(currentCheckboxId).checked = true; // Check the checkbox
        currentSTS += 1;
        
        showNotification(); // Show the notification when time is up

        // Update game data
        
        const savedData = JSON.parse(localStorage.getItem("gameData"));
        savedData.exp += 2; // Award 1 XP
        savedData.stackedAttributes["INT"] += 0.5;
        let currentMP = parseInt(savedData.mp) - 2;
        savedData.mp = currentMP;
        let currentSTM = parseInt(savedData.stm) - 3;
        savedData.stm = currentSTM;
        let currentFAT = parseInt(savedData.fatigue) + 3;
        savedData.fatigue = currentFAT;
        localStorage.setItem("STS", currentSTS);
        localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data
        console.log('heyyuu');

        // Check if x equals 3
        if (currentSTS >= 3) {
            setTimeout(function () {
                console.log(x);
                const savedData = JSON.parse(localStorage.getItem("gameData"));
                localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data

                const comp = document.getElementById("complete");
                const section = document.getElementById("complete-section");
                shakeElement();
                comp.checked = true;
                section.classList.add("animatedd");
                comp.classList.add("animatedd"); // Add class to trigger animation
            }, 1000);
        }

        closePomodoro(); // Close the modal when time is up
    } else {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Call this function on page visibility change to update the timer
document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'visible' && isRunning) {
        // Update the timer display when the tab is visible again
        updateTimerDisplay();
    }
});

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    document.getElementById('timer-display').textContent = '50:00'; // Reset to initial display
}



function addNewSession() {
    const goalSection = document.getElementById('goal-section');
    const newSessionInput = document.getElementById('new-session-input');
    const newSessionName = newSessionInput.value.trim();

    if (newSessionName) {
        const newGoalItem = document.createElement('div');
        newGoalItem.className = 'goal-item';
        newGoalItem.innerHTML = `
            <span class="task-name">${newSessionName}</span>
            <button class="start-button" onclick="openPomodoro('${newSessionName}', '${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox')"><i class="fa-solid fa-play"></i></button>
            <input type="checkbox" id="${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox" class="task-checkbox" disabled />
        `;
        goalSection.appendChild(newGoalItem);
        newSessionInput.value = ''; // Clear the input field after adding
    } else {
       
    }
}

const savedData =JSON.parse(localStorage.getItem("gameData"));
while (savedData.exp >= 100) {
    savedData.exp = savedData.exp - 100; // Reset XP for new level
    savedData.level = parseInt(savedData.level) + 1; // Increment level
  
    for (let key in savedData.stackedAttributes) {
        if (savedData.Attributes[key] !== undefined) {
            savedData.Attributes[key] += customRound(savedData.stackedAttributes[key]*0.25);
        }
    }
    // Reset stackedAttributes  applying them to Attributes
    for (let key in savedData.stackedAttributes) {
        savedData.stackedAttributes[key] = 0;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if (currentSTS >= 3) {
        setTimeout(function () {
            console.log(x);
            const savedData = JSON.parse(localStorage.getItem("gameData"));
            localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data
    
            const comp = document.getElementById("complete");
            const section = document.getElementById("complete-section");
            shakeElement();
            comp.checked = true;
            section.classList.add("animatedd");
            comp.classList.add("animatedd"); // Add class to trigger animation
        }, 400);
    }
  });

  document.addEventListener("DOMContentLoaded", function() {
    if (currentSTS >= 3) {
        setTimeout(function () {
            console.log(x);
            const savedData = JSON.parse(localStorage.getItem("gameData"));
            localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data

            // Select all checkboxes you want to check
            const checkboxes = document.querySelectorAll('.task-checkbox'); // Adjust the selector based on your HTML structure
            checkboxes.forEach(checkbox => {
                checkbox.checked = true; // Check each checkbox
            });

         
        }, 100);
    }
});
document.addEventListener("DOMContentLoaded", function() {
    if (currentSTS === 1) {
        setTimeout(function () {
            console.log(x);
            const savedData = JSON.parse(localStorage.getItem("gameData"));
            localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data

            // Select all checkboxes you want to check
            const anatomyCheckbox = document.getElementById("anatomy-checkbox"); // Select the specific checkbox
            anatomyCheckbox.checked = true; // Check the anatomy checkbox

         
        }, 100);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    if (currentSTS === 2) {
        setTimeout(function () {
            console.log(x);
            const savedData = JSON.parse(localStorage.getItem("gameData"));
            localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data

            // Select all checkboxes you want to check
            const anatomyCheckbox = document.getElementById("anatomy-checkbox"); // Select the specific checkbox
            const hygieneCheckbox = document.getElementById("hygiene-checkbox"); // Select the specific checkbox
            anatomyCheckbox.checked = true; // Check the anatomy checkbox
            hygieneCheckbox.checked = true; // Check the hygiene checkbox

         
        }, 100);
    }
});


document.addEventListener("DOMContentLoaded", function() {
    checkForNewDay();
});

document.addEventListener("DOMContentLoaded", function() {
  // Wait for user manager to load data
  if (window.userManager) {
    const userData = window.userManager.getData();
    const localStorageData = userData.gameData || {};
    loadData(localStorageData);
  } else {
    console.warn('User manager not available, using fallback');
    loadData({});
  }
});

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

// Load Data Function
function loadData(savedData) {
  if (savedData) {
    // Load saved data into UI
    document.querySelector(".level-number").textContent = savedData.level || 1;
    document.getElementById("hp-fill").style.width = (savedData.hp || 100) + "%";
    document.getElementById("mp-fill").style.width = (savedData.mp || 100) + "%";
    document.getElementById("stm-fill").style.width = (savedData.stm || 100) + "%";
    document.getElementById("exp-fill").style.width = (savedData.exp || 0) + "%";
    document.getElementById("Fatvalue").textContent = savedData.fatigue || 0;
    document.getElementById("job-text").textContent = savedData.name || "Your Name";
    document.getElementById("ping-text").textContent = savedData.ping || "60 ms";
    document.getElementById("guild-text").textContent = savedData.guild || "Reaper";
    document.getElementById("race-text").textContent = savedData.race || "Hunter";
    document.getElementById("title-text").textContent = savedData.title || "None";
    document.getElementById("region-text").textContent = savedData.region || "TN";
    document.getElementById("location-text").textContent = savedData.location || "Hospital";
    
    // Load attributes if they exist
    if (savedData.Attributes) {
      document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
      document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
      document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
      document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
      document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
      document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
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
  
  if (window.userManager) {
    window.userManager.setData('gameData', defaultGameData);
    syncToDatabase();
  }
  
  location.reload();
}

// Save Data Function
function saveData() {
  // Get existing data from user manager
  const userData = window.userManager ? window.userManager.getData() : {};
  const existingData = userData.gameData || {};

  // New data to update
  const updatedData = {
    level: document.querySelector(".level-number").textContent,
    hp: parseFloat(document.getElementById("hp-fill").style.width),
    mp: parseFloat(document.getElementById("mp-fill").style.width),
    stm: parseFloat(document.getElementById("stm-fill").style.width),
    exp: parseFloat(document.getElementById("exp-fill").style.width),
    fatigue: document.getElementById("Fatvalue").textContent,
    name: document.getElementById("job-text").textContent,
    ping: document.getElementById("ping-text").textContent,
    guild: document.getElementById("guild-text").textContent,
    race: document.getElementById("race-text").textContent,
    title: document.getElementById("title-text").textContent,
    region: document.getElementById("region-text").textContent,
    location: document.getElementById("location-text").textContent,
  };

  // Merge existing data with updated data, updating only specified keys
  const newData = { ...existingData, ...updatedData };

  // Save the merged data via user manager
  if (window.userManager) {
    window.userManager.setData('gameData', newData);
    syncToDatabase();
  }
}

// Check for New Day Function
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString(); // Get today's date
  const userData = window.userManager ? window.userManager.getData() : {};
  const lastResetDate = userData.lastResetDate; // Get the last reset date from user manager

  console.log("Current Date:", currentDate);
  console.log("Last Reset Date:", lastResetDate);

  // If no date is saved or the day has changed, reset the stats
  if (!lastResetDate || lastResetDate !== currentDate) {
    console.log("Resetting daily stats...");
    
    if (window.userManager) {
      window.userManager.setData('lastResetDate', currentDate);
    }
    
    resetDailyStats(); // Reset daily stats
    syncToDatabase();
  } else {
    console.log("No reset needed.");
  }
}

// Reset Daily Stats Function
function resetDailyStats() {
  const userData = window.userManager ? window.userManager.getData() : {};
  const savedData = userData.gameData;
  
  if (savedData) {
    console.log("Resetting stats for:", savedData.name);
    // Reset relevant stats
    savedData.hp = 100;
    savedData.stm = 100;
    savedData.mp = 100;
    savedData.fatigue = 0;
    savedData.mentalQuests = "[0/3]";
    savedData.physicalQuests = "[0/4]";
    savedData.spiritualQuests = "[0/2]";

    // Update the UI elements accordingly
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;

    // Save the updated data via user manager
    if (window.userManager) {
      window.userManager.setData('gameData', savedData);
    }
    console.log("Daily stats reset successfully.");
  } else {
    console.error("No saved data found for resetting stats.");
  }
}

