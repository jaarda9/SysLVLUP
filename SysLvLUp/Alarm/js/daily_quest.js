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
document.addEventListener("DOMContentLoaded", function () {
  // Retrieve game data from localStorage
  let savedData = JSON.parse(localStorage.getItem("gameData"));

  if (!savedData) {
    console.error("No saved game data found!");
    return;
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
  // Handle Physical Quests Button
  const physicalQuestsBtn = document.getElementById("physicalQuests");
  if (physicalQuestsBtn) {
    if (savedData.physicalQuests === "[4/4]") {
      physicalQuestsBtn.disabled = true; // Disable the button if physical quests are completed
      physicalQuestsBtn.classList.add("completed"); // Add 'completed' class to change hover effect
    } else {
      physicalQuestsBtn.addEventListener("click", function () {
        window.location.href = "/Quest_Info_Physical.html";
      });
    }
  } else {
    console.error("Element with ID 'physicalQuests' not found.");
  }

  // Handle Mental Quests Button
  const mentalQuestsBtn = document.getElementById("mentalQuests");
  if (mentalQuestsBtn) {
    if (savedData.mentalQuests === "[3/3]") {
      mentalQuestsBtn.disabled = true; // Disable the button if mental quests are completed
      mentalQuestsBtn.classList.add("completed"); // Add 'completed' class to change hover effect
    } else {
      mentalQuestsBtn.addEventListener("click", function () {
        window.location.href = "../Quest_Info_Mental.html";
      });
    }
  } else {
    console.error("Element with ID 'mentalQuests' not found.");
  }

  // Handle Spiritual Quests Button
  const spiritualQuestsBtn = document.getElementById("spiritualQuests");
  if (spiritualQuestsBtn) {
    if (savedData.spiritualQuests === "[2/2]") {
      spiritualQuestsBtn.disabled = true; // Disable the button if spiritual quests are completed
      spiritualQuestsBtn.classList.add("completed"); // Add 'completed' class to change hover effect
    } else {
      spiritualQuestsBtn.addEventListener("click", function () {
        window.location.href = "../Quest_Info_Spiritual.html";
      });
    }
  } else {
    console.error("Element with ID 'spiritualQuests' not found.");
  }

  // Optionally, update the task counts visually
  updateDailyQuestCounts();

  console.log(mentalQuestsBtn.disabled);

  if (
    mentalQuestsBtn.disabled &&
    physicalQuestsBtn.disabled &&
    spiritualQuestsBtn.disabled
  ) {
    const comp = document.getElementById("complete");
    const section = document.getElementById("complete-section");
    shakeElement();
    comp.checked = true;
    section.classList.add("animatedd");
    comp.classList.add("animatedd"); // Add class to trigger animation

    setTimeout(function () {
      window.location.href = `status.html`;
    }, 3000);
  }
});

// Function to update the task counts and display in [x/x] format
function updateDailyQuestCounts() {
  let savedData = JSON.parse(localStorage.getItem("gameData"));

  if (!savedData) {
    console.error("No saved game data found!");
    return;
  }

  document.querySelector("#physicalQuests").innerHTML =
    savedData.physicalQuests;
  document.querySelector("#mentalQuests").innerHTML = savedData.mentalQuests;
  document.querySelector("#spiritualQuests").innerHTML =
    savedData.spiritualQuests;

  document.querySelector("#physical-checkbox").checked =
    savedData.physicalQuests === "[4/4]";
  document.querySelector("#mental-checkbox").checked =
    savedData.mentalQuests === "[3/3]";
  document.querySelector("#spiritual-checkbox").checked =
    savedData.spiritualQuests === "[2/2]";
}

// Call this function after rendering tasks
function renderTasks() {
  // Logic to render tasks goes here (similar to the original code)
  updateDailyQuestCounts(); // Make sure to call this after rendering the tasks
}

function resetDailyStats() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));

  if (savedData) {
    savedData.mentalQuests = "[0/3]";
    savedData.physicalQuests = "[0/4]";
    savedData.spiritualQuests = "[0/2]";
    document.getElementById("mentalQuests").textContent =
      savedData.mentalQuests;
    document.getElementById("physicalQuests").textContent =
      savedData.physicalQuests;
    document.getElementById("spiritualQuests").textContent =
      savedData.spiritualQuests;

    // Save the updated data
    localStorage.setItem("gameData", JSON.stringify(savedData));
    syncToDatabase();
  }
}

// Function to check if a new day has started
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString(); // Get today's date
  const lastResetDate = localStorage.getItem("lastResetDate"); // Get the last reset date from localStorage

  if (!lastResetDate || lastResetDate !== currentDate) {
    // If no date is saved or the day has changed, reset the stats
    resetDailyStats();

    // Update the last reset date in localStorage
    localStorage.setItem("lastResetDate", currentDate);
    syncToDatabase()
  }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", (event) => {
  checkForNewDay();
});
