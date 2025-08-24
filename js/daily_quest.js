  async function syncToDatabase() {
    try {
      // Use centralized user manager if available
      if (window.userManager) {
        await window.userManager.syncToDatabase();
        console.log('Sync successful using centralized user manager');
        return { success: true, message: 'Data synced successfully' };
      }
      
      // Fallback to original logic if user manager not available
      const localStorageData = JSON.parse(localStorage.getItem("gameData"));
      
      if (!localStorageData || Object.keys(localStorageData).length === 0) {
        console.log('No localStorage data to sync');
        return { success: true, message: 'No data to sync' };
      }

      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return { success: false, message: 'No userId available' };
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
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
document.addEventListener("DOMContentLoaded", function() {
  // Wait for user manager to load data
  if (window.userManager) {
    const userData = window.userManager.getData();
    const localStorageData = userData.gameData || {};
    loadData(localStorageData);
  } else {
    console.warn('User manager not available, using fallback');
    loadData({});
  }
});

// Use user manager for syncing
async function syncToDatabase() {
    if (window.userManager) {
        try {
            await window.userManager.saveUserData();
            console.log('Sync successful via user manager');
            return { success: true, message: 'Data synced successfully' };
        } catch (error) {
            console.error('Error syncing to database:', error);
            throw error;
        }
    } else {
        console.warn('User manager not available for syncing');
        return { success: false, message: 'User manager not available' };
    }
}

// Load Data Function
function loadData(savedData) {
  if (savedData) {
    // Load saved data into UI
    document.querySelector(".level-number").textContent = savedData.level || 1;
    document.getElementById("hp-fill").style.width = (savedData.hp || 100) + "%";
    document.getElementById("mp-fill").style.width = (savedData.mp || 100) + "%";
    document.getElementById("stm-fill").style.width = (savedData.stm || 100) + "%";
    document.getElementById("exp-fill").style.width = (savedData.exp || 0) + "%";
    document.getElementById("Fatvalue").textContent = savedData.fatigue || 0;
    document.getElementById("job-text").textContent = savedData.name || "Your Name";
    document.getElementById("ping-text").textContent = savedData.ping || "60 ms";
    document.getElementById("guild-text").textContent = savedData.guild || "Reaper";
    document.getElementById("race-text").textContent = savedData.race || "Hunter";
    document.getElementById("title-text").textContent = savedData.title || "None";
    document.getElementById("region-text").textContent = savedData.region || "TN";
    document.getElementById("location-text").textContent = savedData.location || "Hospital";
    
    // Load attributes if they exist
    if (savedData.Attributes) {
      document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
      document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
      document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
      document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
      document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
      document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
    }
  } else {
    resetData();
  }
}

// Reset Data Function
function resetData() {
  const defaultGameData = {
    level: 1,
    hp: 100,
    mp: 100,
    stm: 100,
    exp: 0,
    fatigue: 0,
    name: "Your Name",
    ping: "60",
    guild: "Reaper",
    race: "Hunter",
    title: "None",
    region: "TN",
    location: "Hospital",
    physicalQuests: "[0/4]",
    mentalQuests: "[0/3]",
    spiritualQuests: "[0/2]",
    Attributes: {
      STR: 10,
      VIT: 10,
      AGI: 10,
      INT: 10,
      PER: 10,
      WIS: 10,
    },
    stackedAttributes: {
      STR: 0,
      VIT: 0,
      AGI: 0,
      INT: 0,
      PER: 0,
      WIS: 0,
    },
  };
  
  if (window.userManager) {
    window.userManager.setData('gameData', defaultGameData);
    syncToDatabase();
  }
  
  location.reload();
}

// Save Data Function
function saveData() {
  // Get existing data from user manager
  const userData = window.userManager ? window.userManager.getData() : {};
  const existingData = userData.gameData || {};

  // New data to update
  const updatedData = {
    level: document.querySelector(".level-number").textContent,
    hp: parseFloat(document.getElementById("hp-fill").style.width),
    mp: parseFloat(document.getElementById("mp-fill").style.width),
    stm: parseFloat(document.getElementById("stm-fill").style.width),
    exp: parseFloat(document.getElementById("exp-fill").style.width),
    fatigue: document.getElementById("Fatvalue").textContent,
    name: document.getElementById("job-text").textContent,
    ping: document.getElementById("ping-text").textContent,
    guild: document.getElementById("guild-text").textContent,
    race: document.getElementById("race-text").textContent,
    title: document.getElementById("title-text").textContent,
    region: document.getElementById("region-text").textContent,
    location: document.getElementById("location-text").textContent,
  };

  // Merge existing data with updated data, updating only specified keys
  const newData = { ...existingData, ...updatedData };

  // Save the merged data via user manager
  if (window.userManager) {
    window.userManager.setData('gameData', newData);
    syncToDatabase();
  }
}

// Check for New Day Function
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString(); // Get today's date
  const userData = window.userManager ? window.userManager.getData() : {};
  const lastResetDate = userData.lastResetDate; // Get the last reset date from user manager

  console.log("Current Date:", currentDate);
  console.log("Last Reset Date:", lastResetDate);

  // If no date is saved or the day has changed, reset the stats
  if (!lastResetDate || lastResetDate !== currentDate) {
    console.log("Resetting daily stats...");
    
    if (window.userManager) {
      window.userManager.setData('lastResetDate', currentDate);
    }
    
    resetDailyStats(); // Reset daily stats
    syncToDatabase();
  } else {
    console.log("No reset needed.");
  }
}

// Reset Daily Stats Function
function resetDailyStats() {
  const userData = window.userManager ? window.userManager.getData() : {};
  const savedData = userData.gameData;
  
  if (savedData) {
    console.log("Resetting stats for:", savedData.name);
    // Reset relevant stats
    savedData.hp = 100;
    savedData.stm = 100;
    savedData.mp = 100;
    savedData.fatigue = 0;
    savedData.mentalQuests = "[0/3]";
    savedData.physicalQuests = "[0/4]";
    savedData.spiritualQuests = "[0/2]";

    // Update the UI elements accordingly
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;

    // Save the updated data via user manager
    if (window.userManager) {
      window.userManager.setData('gameData', savedData);
    }
    console.log("Daily stats reset successfully.");
  } else {
    console.error("No saved data found for resetting stats.");
  }
}
