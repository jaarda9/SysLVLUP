let timer;
let isRunning = false;
let timeLeft = 1 ; // 45 minutes in seconds

function openPomodoro(taskName, checkboxId) {
    document.getElementById('task-title').innerText = taskName;
    document.getElementById('pomodoro-modal').style.display = 'block';
    document.getElementById(checkboxId).disabled = false;
}

function closePomodoro() {
    document.getElementById('pomodoro-modal').style.display = 'none';
    resetTimer();
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

let x = 0;

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                isRunning = false;
                document.getElementById(currentCheckboxId).checked = true; // Check the checkbox
                x=x+1;
                showNotification(); // Show the notification when time is up
                console.log('heyyuu');
                if  (x === 3)
                    {
                        setTimeout(function () {
                            console.log(x)
                            const comp = document.getElementById("complete");
                            const section = document.getElementById("complete-section");
                            shakeElement();
                            comp.checked = true;
                            section.classList.add("animatedd");
                            comp.classList.add("animatedd"); // Add class to trigger animation;
                          }, 1000);
                 
                     
                 
                   } ;
                closePomodoro(); // Close the modal when time is up
                
            }
        }, 1000);
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                alert('Time is up!');
                document.getElementById('complete').disabled = false;
            } else {
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft =  1 ; // Reset to 45 minutes
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
