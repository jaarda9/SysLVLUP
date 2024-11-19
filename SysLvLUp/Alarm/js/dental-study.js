let timer;
let isRunning = false;
let timeLeft = 3000; // 45 minutes in seconds

function openPomodoro(taskName, checkboxId) {
    document.getElementById('task-title').innerText = taskName;
    document.getElementById('pomodoro-modal').style.display = 'block';
    document.getElementById(checkboxId).disabled = false;
}

function closePomodoro() {
    document.getElementById('pomodoro-modal').style.display = 'none';
    resetTimer();
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
    timeLeft =  3000; // Reset to 45 minutes
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
