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
// Define the spiritual tasks that are the same every day
const spiritualTasks = [
    { name: "Holy Scripture Memorization", target: "½ Page", xp: 2.5, stats: { WIS: 1 }, completed: false },
    { name: "Holy Scripture Revision", target: "??", xp: 2.5, stats: { WIS: 1 }, completed: false }
];



// Function to render spiritual tasks
function renderSpiritualTasks() {
    const goalItemsDiv = document.getElementById("goal-items");

    goalItemsDiv.innerHTML = ''; // Clear existing tasks

    spiritualTasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("goal-item");

        taskDiv.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-reps">[${task.target}]</span>
            <input type="checkbox" ${task.completed ? "checked" : ""} onchange="completeSpiritualTask('${task.name}')">
        `;
        goalItemsDiv.appendChild(taskDiv);
    });

    updateCompleteCheckbox();
}

// Function to toggle the completion state of a spiritual task
function completeSpiritualTask(taskName) {
    const task = spiritualTasks.find(t => t.name === taskName);
    if (task) {
        task.completed = !task.completed;
    }
    renderSpiritualTasks(); // Re-render the tasks to reflect changes
    updateCompleteCheckbox(); // Update the overall completion status
}

// Modified updateCompleteCheckbox function
function updateCompleteCheckbox() {
    const allCompleted = spiritualTasks.every(task => task.completed);
    const completeCheckbox = document.getElementById("complete");

    completeCheckbox.checked = allCompleted;

    // To trigger the animation reset
    if (allCompleted) {
        const label = completeCheckbox.nextElementSibling;
        label.classList.remove('animate'); // Remove class if it exists
        void label.offsetWidth; // Trigger reflow to reset the animation
        label.classList.add('animate'); // Add class to trigger animation
        setTimeout(function() {
            const data = "spiritual";
            window.location.href = `/Quest_Rewards.html?data=${data}`;
                }, 1000); 
        
    }
}

// Function to complete a quest and gain XP
function completeSpiritualQuest(taskName) {
    const task = spiritualTasks.find(t => t.name === taskName);

    if (task && !task.completed) {
        task.completed = true;
        userXP += task.xp;

        for (let stat in task.stats) {
            userStats[stat] += task.stats[stat];
        }

        checkLevelUp();
        updateSpiritualStatusCard();
        renderSpiritualTasks(); // Re-render to reflect task completion
    }
}

// Run the renderSpiritualTasks function when the page loads
window.onload = renderSpiritualTasks;


// Function to update the Spiritual Status Card (display user XP and stats)
function updateSpiritualStatusCard() {
    console.log(`Current XP: ${userXP}`);
    console.log(`Stats: WIS - ${userStats.WIS}`);
}

setTimeout(function() {
    window.location.href = `/Penalty_Quest.html`;
        }, 7200000); 
