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
// Define the mental tasks that are the same every day
const mentalTasks = [
    { name: "Meditation", target: "10 min", xp: 1.5, stats: { INT: 0.5, PER: 0.25 }, completed: false },
    { name: "Reading Books", target: "30 min", xp: 2, stats: { INT: 0.75 }, completed: false },
    { name: "Journaling", target: "10 min", xp: 1.5, stats: { INT: 0.4, PER: 0.2 }, completed: false }
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
            const data = "mental";
                window.location.href = `/Quest_Rewards.html?data=${data}`;   
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

// Function to check if the user should level up
function checkLevelUp() {
    if (userXP >= xpToLevelUp) {
        userXP -= xpToLevelUp;
        levelUp();
    }
}

// Function to handle leveling up
function levelUp() {
    console.log("You've leveled up!");
    // Display level-up message or additional logic here
}

// Function to update the Mental Status Card (display user XP and stats)
function updateMentalStatusCard() {
    console.log(`Current XP: ${userXP}`);
    console.log(`Stats: INT - ${userStats.INT}, PER - ${userStats.PER}`);
}

setTimeout(function() {
    window.location.href = `/Penalty_Quest.html`;
        }, 7200000); 
