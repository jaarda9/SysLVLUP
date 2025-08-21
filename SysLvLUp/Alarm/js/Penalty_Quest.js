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
            setTimeout(function () {
                window.location.href = `status.html`;
              }, 3000);
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
