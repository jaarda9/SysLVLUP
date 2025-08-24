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
/// Define workout routine for each day with exercises, XP, and stat increments
const dailyTasks = {
    Monday: [
        { name: "Archer Push-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Pseudo Planche Push-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Pike Push-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Elevated Diamond Push-ups", target: "30 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false }
    ],
    Tuesday: [
        { name: "Explosive Pull-ups", target: "12 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Towel Pull-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Chin-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Arched Back Pull-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false }
    ],
    Wednesday: [
        { name: "Jumping Lunges", target: "40 reps", xp: 1.25, stats: { VIT: 0.5, AGI: 0.25 }, completed: false },
        { name: "Cossack Squats", target: "32 reps", xp: 1.25, stats: { VIT: 0.5, AGI: 0.25 }, completed: false },
        { name: "Single Leg Glute Bridge", target: "80 reps", xp: 1.25, stats: { VIT: 0.5, AGI: 0.25 }, completed: false },
        { name: "Sissy Squats", target: "40 reps", xp: 1.25, stats: { VIT: 0.5, AGI: 0.25 }, completed: false }
    ],
    Thursday: [
        { name: "Archer Push-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Pseudo Planche Push-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Pike Push-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false },
        { name: "Elevated Diamond Push-ups", target: "30 reps", xp: 1.25, stats: { STR: 0.5, AGI: 0.25 }, completed: false }
    ],
    Friday: [
        { name: "Explosive Pull-ups", target: "12 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Towel Pull-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Chin-ups", target: "18 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false },
        { name: "Arched Back Pull-ups", target: "24 reps", xp: 1.25, stats: { STR: 0.4, AGI: 0.3 }, completed: false }
    ],
    Saturday: [
        { name: "Dragon Flag", target: "60 sec", xp: 1.25, stats: { VIT: 0.4, STR: 0.3 }, completed: false },
        { name: "Hollow Body Hold", target: "100 sec", xp: 1.25, stats: { VIT: 0.4, STR: 0.3 }, completed: false },
        { name: "Hanging Leg Raises", target: "40 reps", xp: 1.25, stats: { VIT: 0.4, STR: 0.3 }, completed: false },
        { name: "V Ups", target: "80 reps", xp: 1.25, stats: { VIT: 0.4, STR: 0.3 }, completed: false }
    ],
    Sunday: [
        { name: "Rest Day", target: "1/1", xp: 0, stats: {}, completed: true }
    ]
};




// Function to get the current day's tasks
function getCurrentDayTasks() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().getDay();
    return dailyTasks[days[today]] || [];
}

// Function to render tasks for the day
function renderTasks() {
    const goalItemsDiv = document.getElementById("goal-items");
    const tasks = getCurrentDayTasks();

    goalItemsDiv.innerHTML = ''; // Clear existing tasks

    tasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("goal-item");

        taskDiv.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-reps">[${task.target}]</span>
            <input type="checkbox" ${task.completed ? "checked" : ""} onchange="completeTask('${task.name}')">
        `;
        goalItemsDiv.appendChild(taskDiv);
    });

    updateCompleteCheckbox();
}

// Function to toggle the completion state of a task
function completeTask(taskName) {
    const tasks = getCurrentDayTasks();
    const task = tasks.find(t => t.name === taskName);
    if (task) {
        task.completed = !task.completed;
    }
    renderTasks(); // Re-render the tasks to reflect changes
    updateCompleteCheckbox(); // Update the overall completion status
}

// Modified updateCompleteCheckbox function
function updateCompleteCheckbox() {
    const tasks = getCurrentDayTasks();
    const allCompleted = tasks.every(task => task.completed);
    const completeCheckbox = document.getElementById("complete");

    completeCheckbox.checked = allCompleted;

    // To trigger the animation reset
    if (allCompleted) {
        const label = completeCheckbox.nextElementSibling;
        label.classList.remove('animate'); // Remove class if it exists
        void label.offsetWidth; // Trigger reflow to reset the animation
        label.classList.add('animate'); // Add class to trigger animation
        setTimeout(function() {
            const data = "physical";
            window.location.href = `/Quest_Rewards.html?data=${data}`;
                }, 1000); 
        
    }
}

// Function to complete a quest and gain XP
function completeQuest(questName) {
    const tasks = getCurrentDayTasks();
    const task = tasks.find(t => t.name === questName);

    if (task && !task.completed) {
        task.completed = true;
        userXP += task.xp;

        for (let stat in task.stats) {
            userStats[stat] += task.stats[stat];
        }

        checkLevelUp();
        updateStatusCard();
        renderTasks(); // Re-render to reflect task completion
    }
}

// Run the renderTasks function when the page loads
window.onload = renderTasks;



// Function to update the Status Card (display user XP and stats)
function updateStatusCard() {
    // Add logic to update your status display, e.g., user XP, stats, etc.
    console.log(`Current XP: ${userXP}`);
    console.log(`Stats: STR - ${userStats.STR}, AGI - ${userStats.AGI}, VIT - ${userStats.VIT}`);
}

// Run the renderTasks function when the page loads
window.onload = renderTasks;

setTimeout(function() {
    window.location.href = `/Penalty_Quest.html`;
        }, 7200000); 
