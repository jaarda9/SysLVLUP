// Define the mental tasks that are the same every day
const mentalTasks = [
    { name: "Finish a Book", target: "",  completed: false },
    { name: "Finish a Lecture", target: "",  completed: false },
    { name: "Memorize One Page", target: "",  completed: false },
    { name: "Finish a Workout", target: "",  completed: false },
    { name: "Remain silent for the whole day", target: "",  completed: false }
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
           
                window.location.href = `/Alarm/status.html`;   
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
        }, 7200000); 