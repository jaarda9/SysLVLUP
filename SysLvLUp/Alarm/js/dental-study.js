

let x = 0;
let timer; // Timer variable
let isRunning = false;
let totalDuration = 3000; // Total duration in seconds (50 minutes)
let startTime; // Variable to store the start time
let currentCheckboxId = '';

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
        x = x + 1;
        showNotification(); // Show the notification when time is up

        // Update game data
        const savedData = JSON.parse(localStorage.getItem("gameData"));
        savedData.exp += 1; // Award 1 XP
        savedData.stackedAttributes["INT"] += 0.5;
        localStorage.setItem("gameData", JSON.stringify(savedData)); // Save the updated data
        console.log('heyyuu');

        // Check if x equals 3
        if (x === 3) {
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
