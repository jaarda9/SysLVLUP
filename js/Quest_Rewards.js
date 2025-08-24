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

function acceptRewards() {
    
    window.location.href="/status.html";
}
const dailyTasks = {
    Monday: { stackedAttributes: { "STR": 2, "VIT": 0, "AGI": 1, "INT": 0, "PER": 0 } },
    Tuesday: { stackedAttributes: { "STR": 2, "VIT": 0, "AGI": 1, "INT": 0, "PER": 0 } },
    Wednesday: { stackedAttributes: { "STR": 0, "VIT": 2, "AGI": 1, "INT": 0, "PER": 0 } },
    Thursday: { stackedAttributes: { "STR": 2, "VIT": 0, "AGI": 1, "INT": 0, "PER": 0 } },
    Friday: { stackedAttributes: { "STR": 2, "VIT": 0, "AGI": 1, "INT": 0, "PER": 0 } },
    Saturday: { stackedAttributes: { "STR": 2, "VIT": 2, "AGI": 0, "INT": 0, "PER": 0 } },
    Sunday: [
        { name: "Rest Day", target: "Enjoy your rest!", xp: 0, stats: {}, completed: true }
    ]
};
function getCurrentDayTasks() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().getDay();
    return dailyTasks[days[today]] || [];
}

// Get current day name
let savedData = JSON.parse(localStorage.getItem('gameData'));

function customRound(num) {
    return (num - Math.floor(num)) > 0.4 ? Math.ceil(num) : Math.floor(num);
  }
  
  let num1 = 2.4;
  console.log(customRound(num1));  // Output: 3
  
  let num2 = 2.3;
  console.log(customRound(num2));  // Output: 2
  


  function xpgainphysical(){
    // Add the xpReward to the current XP
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    console.log(savedData.exp ,savedData.level)
    savedData.exp+=5;
    const tasks = getCurrentDayTasks();
    const dayStackedAttributes = tasks.stackedAttributes;
    for (let key in dayStackedAttributes) {
       
            savedData.stackedAttributes[key] += customRound(dayStackedAttributes[key] * 0.25) ;
       
    }
    while (savedData.exp >= 100) {
        savedData.exp = savedData.exp - 100; // Reset XP for new level
        savedData.level = parseInt(savedData.level) + 1; // Increment level

        for (let key in savedData.stackedAttributes) {
            if (savedData.Attributes[key] !== undefined) {
                savedData.Attributes[key] += savedData.stackedAttributes[key];
            }
        }
        // Reset stackedAttributes  applying them to Attributes
        for (let key in savedData.stackedAttributes) {
            savedData.stackedAttributes[key] = 0;
        }
    }

       
        let currentHP = Math.max(0, parseInt(savedData.hp) - 20);
        savedData.hp = currentHP;
        console.log(currentHP);

       
       
        let currentSTM = parseInt(savedData.stm) - 20;
        savedData.stm = currentSTM;
        console.log(currentSTM);

        let currentFAT = parseInt(savedData.fatigue) + 20;
        savedData.fatigue = currentFAT;
        console.log(currentFAT);

       
       
        savedData.physicalQuests = "[4/4]";
        console.log(currentFAT);
    console.log(savedData.exp ,savedData.level)
    localStorage.setItem('gameData', JSON.stringify(savedData));
      syncToDatabase()
   
}
function xpgainmental(){
    // Add the xpReward to the current XP
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    console.log(savedData.exp ,savedData.level)
    savedData.exp+=5;
        
            savedData.stackedAttributes["INT"] += 2;
            savedData.stackedAttributes["PER"] += 0.45;
           
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

       
       
    let currentMP = parseInt(savedData.mp) - 20;
    savedData.mp = currentMP;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    
    console.log(currentMP);

    let currentSTM = parseInt(savedData.stm) - 10;
    savedData.stm = currentSTM;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentSTM);

    let currentFAT = parseInt(savedData.fatigue) + 20;
    savedData.fatigue = currentFAT;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentFAT);
    savedData.mentalQuests = "[3/3]";
    console.log(savedData.exp ,savedData.level)
    localStorage.setItem('gameData', JSON.stringify(savedData));
    syncToDatabase()
   
}

function xpgainspiritual(){
    // Add the xpReward to the current XP
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    console.log(savedData.exp ,savedData.level)
    savedData.exp+=5;
        
            savedData.stackedAttributes["WIS"] += 2;
          
           
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

       
       
    let currentHP = Math.min(100, parseInt(savedData.hp) + 10);
    savedData.hp = currentHP;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentHP);

    let currentMP = parseInt(savedData.mp) - 10;
    savedData.mp = currentMP;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentMP);

    let currentSTM = parseInt(savedData.stm) - 10;
    savedData.stm = currentSTM;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentSTM);

    let currentFAT = parseInt(savedData.fatigue) + 10;
    savedData.fatigue = currentFAT;
    localStorage.setItem('gameData', JSON.stringify(savedData));
    console.log(currentFAT);

    savedData.spiritualQuests = "[2/2]";
    console.log(savedData.exp ,savedData.level)
    localStorage.setItem('gameData', JSON.stringify(savedData));
   syncToDatabase()
}



    
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');
    console.log(data); // This will log your data to the console
  





    

  
    // Retrieve the XP reward from localStorage
  

   
        
        

        // Clear the XP reward after applying it
        
window.onload=()=>{
    if (data === 'physical') {
       
        xpgainphysical();
       

        
    }

    if (data === 'mental') {
        
        xpgainmental()
        console.log(currentFAT);
        
        
   
    }

    if (data === 'spiritual') {
        
        
       
        xpgainspiritual()
        console.log(currentFAT);
    }

}
    
    



