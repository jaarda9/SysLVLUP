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

// Define the mental tasks that are the same every day
const mentalTasks = [
    { name: "Finish a Book", target: "",  completed: false },
    { name: "Finish 3 Lectures", target: "",  completed: false },
    { name: "Memorize One Page", target: "",  completed: false },
    { name: "Finish a Workout", target: "",  completed: false },
    { name: "Go Digital-Free for 24h", target: "",  completed: false }
];


// Function to render mental tasks
function renderMentalTasks() {
    const goalItemsDiv = document.getElementById("goal-items");

    goalItemsDiv.innerHTML = ''; // Clear existing tasks

    mentalTasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("goal-item");

        taskDiv.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-reps">${task.target}</span>
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
    }
    renderMentalTasks(); // Re-render the tasks to reflect changes
    updateCompleteCheckbox(); // Update the overall completion status
}

// Modified updateCompleteCheckbox function
function updateCompleteCheckbox() {
    const allCompleted = mentalTasks.every(task => task.completed);
    const completeCheckbox = document.getElementById("complete");

    completeCheckbox.checked = allCompleted;

    // To trigger the animation reset
    if (allCompleted) {
        const label = completeCheckbox.nextElementSibling;
        label.classList.remove('animate'); // Remove class if it exists
        void label.offsetWidth; // Trigger reflow to reset the animation
        label.classList.add('animate'); // Add class to trigger animation

        setTimeout(function() {
           
                window.location.href = `/status.html`;   
                }, 1000);
                    }
}

// Function to complete a quest and gain XP
function completeMentalQuest(taskName) {
    const task = mentalTasks.find(t => t.name === taskName);

    if (task && !task.completed) {
        task.completed = true;
        userXP += task.xp;

        for (let stat in task.stats) {
            userStats[stat] += task.stats[stat];
        }

        checkLevelUp();
        updateMentalStatusCard();
        renderMentalTasks(); // Re-render to reflect task completion
    }
}

// Run the renderMentalTasks function when the page loads
window.onload = renderMentalTasks;






setTimeout(function() {
    window.location.href = `/Penalty_Quest.html`;
        }, 86400000); 

