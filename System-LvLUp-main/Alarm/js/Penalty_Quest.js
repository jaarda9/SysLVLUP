// Set the initial timer duration (4 hours in milliseconds)
let totalTime = 2 * 60 * 60 * 1000; // 4 hours in milliseconds
let countdownElement = document.getElementById("timer");
let checkbox = document.getElementById("penalty-checkbox"); // Correct identification of the checkbox

function startCountdown(duration) {
    let startTime = Date.now();

    let interval = setInterval(() => {
        // Calculate the time difference
        let elapsedTime = Date.now() - startTime;
        let remainingTime = duration - elapsedTime;

        // If the time runs out, clear the interval and check the checkbox
        if (remainingTime <= 0) {
            clearInterval(interval);
            remainingTime = 0;
            countdownElement.textContent = "00:00:00";

            // Automatically tick the checkbox and turn it green
            checkbox.checked = true; // Automatically check the checkbox
        }

        // Format remaining time to HH:MM:SS
        let hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        let seconds = Math.floor((remainingTime / 1000) % 60);

        // Update the countdown element
        countdownElement.textContent = 
            String(hours).padStart(2, '0') + ":" + 
            String(minutes).padStart(2, '0') + ":" + 
            String(seconds).padStart(2, '0');
    }, 1000); // Update every second
}

// Start the countdown
startCountdown(totalTime);
