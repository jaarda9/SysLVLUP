  async function syncToDatabase() {
    try {
      const localStorageData = JSON.parse(localStorage.getItem("gameData"));
      
      if (Object.keys(localStorageData).length === 0) {
        console.log('No localStorage data to sync');
        return { success: true, message: 'No data to sync' };
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'your-user-id',
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
