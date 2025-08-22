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
    
    



