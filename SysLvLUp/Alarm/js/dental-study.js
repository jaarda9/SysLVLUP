

let timer;
let isRunning = false;
let timeLeft = 3000; // 50 minutes in seconds
let currentCheckboxId = '';

function openPomodoro(task, checkboxId) {
    document.getElementById('task-title').textContent = task;
    document.getElementById('pomodoro-modal').style.display = 'block';
    resetTimer(); // Reset timer when opening
    currentCheckboxId = checkboxId; // Store the checkbox ID
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

function closePomodoro() {
    document.getElementById('pomodoro-modal').style.display = 'none';
    resetTimer(); // Reset timer when closing
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
                alert("Time's up!");
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

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 3000; // Reset to 50 minutes
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}



