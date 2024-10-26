document.querySelectorAll(".increment-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const stat = button.previousElementSibling;
    let currentValue = parseInt(stat.textContent.split(": ")[1]);
    let abilityPoints = parseInt(
      document
        .querySelector(".attributes div:last-child span")
        .textContent.split(": ")[1]
    );

    if (abilityPoints > 0) {
      // Increment the stat by 1
      stat.textContent =
        stat.textContent.split(": ")[0] + ": " + (currentValue + 1);
      // Decrease ability points by 1
      document.querySelector(
        ".attributes div:last-child span"
      ).textContent = `Ability Points: ${abilityPoints - 1}`;
    }
  });
});



function updateFatigueProgress() {
  const fatigueText = document.querySelector(".fatigue-value").textContent; // Get the text (e.g., "20")
  const value = parseInt(fatigueText, 10); // Convert to a number

  const circle = document.querySelector(".progress-ring__circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

// Example: Update fatigue after a task or event changes it
function updateFatigue(newFatigueValue) {
  // Update fatigue value in the DOM
  document.querySelector(".fatigue-value").textContent = newFatigueValue;

  // Call updateFatigueProgress to update the progress ring immediately
  updateFatigueProgress();
}

function toggleEditMode() {
  const inputs = document.querySelectorAll(".detail-input");
  const texts = document.querySelectorAll(".detail-text");
  const saveButton = document.getElementById("save-changes");

  inputs.forEach(
    (input) =>
      (input.style.display = input.style.display === "none" ? "inline" : "none")
  );
  texts.forEach(
    (text) =>
      (text.style.display = text.style.display === "none" ? "inline" : "none")
  );
  saveButton.style.display =
    saveButton.style.display === "none" ? "inline" : "none";
}

document.querySelectorAll(".detail-text").forEach((textElement) => {
  textElement.addEventListener("click", () => {
    // Get the associated input field
    const input = textElement.nextElementSibling;

    // Show the input field and hide the text
    textElement.style.display = "none";
    input.style.display = "inline";
    input.value = textElement.textContent.trim(); // Set the current value to the input
    input.focus(); // Focus on the input for immediate editing
  });
});

document.querySelectorAll(".detail-input").forEach((input) => {
  // When the user clicks outside the input or presses Enter, save the change
  input.addEventListener("blur", () => {
    saveInputValue(input);
  });

  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent adding a newline
      saveInputValue(input);
    }
  });
});

function saveInputValue(input) {
  const textElement = input.previousElementSibling;
  const newValue = input.value.trim();

  // Update the text with the new input value
  textElement.textContent = newValue;

  // Hide the input field and show the updated text
  input.style.display = "none";
  textElement.style.display = "inline";
}

function saveChanges() {
  const jobInput = document.getElementById("job-input").value;
  const pingInput = document.getElementById("ping-input").value;
  const guildInput = document.getElementById("guild-input").value;
  const raceInput = document.getElementById("race-input").value;
  const titleInput = document.getElementById("title-input").value;
  const regionInput = document.getElementById("region-input").value;
  const locationInput = document.getElementById("location-input").value;

  if (jobInput) document.getElementById("job-text").textContent = jobInput;
  if (pingInput) document.getElementById("ping-text").textContent = pingInput;
  if (guildInput)
    document.getElementById("guild-text").textContent = guildInput;
  if (raceInput) document.getElementById("race-text").textContent = raceInput;
  if (titleInput)
    document.getElementById("title-text").textContent = titleInput;
  if (regionInput)
    document.getElementById("region-text").textContent = regionInput;
  if (locationInput)
    document.getElementById("location-text").textContent = locationInput;
  toggleEditMode(); // Hide the inputs and show the updated details
}

document.querySelector(".status-container").addEventListener("dblclick", () => {
  const editButton = document.getElementById("edit-toggle");
  editButton.style.display = "inline"; // Show the button when the container is double-clicked
});

function toggleEditMode() {
  const inputs = document.querySelectorAll(".detail-input");
  const texts = document.querySelectorAll(".detail-text");
  const saveButton = document.getElementById("save-changes");
  const editButton = document.getElementById("edit-toggle");

  inputs.forEach(
    (input) =>
      (input.style.display = input.style.display === "none" ? "inline" : "none")
  );
  texts.forEach(
    (text) =>
      (text.style.display = text.style.display === "none" ? "inline" : "none")
  );
  saveButton.style.display =
    saveButton.style.display === "none" ? "inline" : "none";

  // Hide the Edit button again after editing
  editButton.style.display = "none";
}

function updateProgressBar(stat) {
  // Get the fill element for the given stat
  const fillElement = document.getElementById(`${stat}-fill`);

  // Get the current value and max value from the text (e.g., "10/100")
  const valueText = fillElement.parentElement.nextElementSibling.textContent; // Reads "10/100"
  const [currentValue, maxValue] = valueText.split("/").map(Number);

  // Calculate the percentage and update the width of the fill element
  const percentage = (currentValue / maxValue) * 100;
  fillElement.style.width = `${percentage}%`;
}

// Update all progress bars on page load
updateProgressBar("hp");
updateProgressBar("mp");
updateProgressBar("stm");
updateProgressBar("exp");

document.addEventListener("DOMContentLoaded", (event) => {
  // Fetching the elements
  const levelNumber = document.querySelector(".level-number");
  const questLevel = document.querySelector(".quests .status:not(.done)");

  // Function to level up
  function levelUp() {
    // Increment the level
    const newLevel = parseInt(levelNumber.textContent) + 1;
    levelNumber.textContent = newLevel;
    questLevel.textContent = `Lv.${newLevel}`;
  }
  function checkForLevelUp1() {
    let savedData = JSON.parse(localStorage.getItem("gameData"));

    if (savedData.exp >= 100) {
      // If the XP is 100 or more, level up
      while (savedData.exp >= 100) {
        savedData.exp -= 100; // Subtract 100 XP for the level-up
        savedData.level += 1; // Increment the level
      }

      // Update the DOM after leveling up
      document.querySelector(".level-number").textContent = savedData.level;
      document.getElementById("exp-fill").style.width = `${
        (savedData.exp / 100) * 100
      }%`; // Update XP bar
      document.getElementById("XPvalue").textContent = `${savedData.exp}/100`; // Update XP value
      document.getElementById("rank-text").textContent = getRank(
        savedData.level
      ); // Update rank

      // Save the updated data back to localStorage
      localStorage.setItem("gameData", JSON.stringify(savedData));
    }
  }

  // Example function to trigger level up (could be based on any condition)
  function checkForLevelUp() {
    const expFill = document.getElementById("exp-fill");
    console.log(expFill);
    if (expFill.style.width === "100%") {
      // Assuming 100% EXP triggers level up
      levelUp();
    }
  }

  // Check for level up when the page loads
  checkForLevelUp1();
});

function getRank(level) {
  if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
  if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
  if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
  if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
  if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
  if (level >= 101) return ranks[5]; // S-Rank
}

function loadData() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  if (savedData) {
    document.querySelector(".level-number").textContent = savedData.level;
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("exp-fill").style.width = savedData.exp + "%";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;
    document.getElementById("job-text").textContent = savedData.name;
    document.getElementById("ping-text").textContent = savedData.ping;
    document.getElementById("guild-text").textContent = savedData.guild;
    document.getElementById("race-text").textContent = savedData.race;
    document.getElementById("title-text").textContent = savedData.title;
    document.getElementById("region-text").textContent = savedData.region;
    document.getElementById("location-text").textContent = savedData.location;
    document.getElementById("rank-text").textContent = getRank(
      savedData.level
    );
    document.querySelector(".quests .status:not(.done)").textContent = `Lv.${savedData.level}`; // Load quest level

    document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
    document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
    document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
    document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
    document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
    document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
  }
}
const ranks = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
function getRank(level) {
  if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
  if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
  if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
  if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
  if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
  if (level >= 101) return ranks[5]; // S-Rank
}
function saveData() {
  const gameData = {
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
  localStorage.setItem("gameData", JSON.stringify(gameData));
}


document.addEventListener("DOMContentLoaded", (event) => {
  const ranks = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];

  // Function to get rank based on level
  function getRank(level) {
    if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
    if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
    if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
    if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
    if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
    if (level >= 101) return ranks[5]; // S-Rank
  }

  // Function to load data from local storage
  function loadData() {
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    if (savedData) {
      document.querySelector(".level-number").textContent = savedData.level;
      document.getElementById("hp-fill").style.width = savedData.hp + "%";
      document.getElementById("mp-fill").style.width = savedData.mp + "%";
      document.getElementById("stm-fill").style.width = savedData.stm + "%";
      document.getElementById("exp-fill").style.width = savedData.exp + "%";
      document.querySelector(".fatigue-value").textContent = savedData.fatigue;
      document.getElementById("job-text").textContent = savedData.name;
      document.getElementById("ping-text").textContent = savedData.ping;
      document.getElementById("guild-text").textContent = savedData.guild;
      document.getElementById("race-text").textContent = savedData.race;
      document.getElementById("title-text").textContent = savedData.title;
      document.getElementById("region-text").textContent = savedData.region;
      document.getElementById("location-text").textContent = savedData.location;
      document.getElementById("rank-text").textContent = getRank(
        savedData.level
      );
      document.querySelector(".quests .status:not(.done)").textContent = `Lv.${savedData.level}`; // Load quest level

      document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
      document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
      document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
      document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
      document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
      document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
    }
  }

  // Function to save data to local storage
  function saveData() {
    const gameData = {
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
    localStorage.setItem("gameData", JSON.stringify(gameData));
  }

  // Load data when the page loads
  loadData();

  // Save data when an input field changes
  const inputs = document.querySelectorAll(".detail-input");
  inputs.forEach((input) => {
    function saveData() {
      const gameData = {
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
      localStorage.setItem("gameData", JSON.stringify(gameData));
    }
  
    input.addEventListener("blur", (event) => {
      const span = event.target.previousElementSibling;
      span.textContent = event.target.value;
      console.log(event.target.value);
      saveData();
    });
  });

  // Example function to trigger save (call this function whenever data changes)
  function updateGameData() {
    saveData();
  }

  // Example level up function
  function levelUp() {
    // Get the current level
    const levelNumber = document.querySelector(".level-number");
    const newLevel = parseInt(levelNumber.textContent) + 1;

    // Update the level in the DOM
    levelNumber.textContent = newLevel;

    // Update the quest level if applicable
    const questLevelElement = document.querySelector(
      ".quests .status:not(.done)"
    );
    if (questLevelElement) {
      questLevelElement.textContent = `Lv.${newLevel}`;
    }

    // Update the rank text based on the new level
    document.getElementById("rank-text").textContent = getRank(newLevel);

    // Save the updated data to localStorage
    saveData();
  }

  // Function to check XP and level up if necessary
  function checkForLevelUp() {
    let savedData = JSON.parse(localStorage.getItem("gameData"));

    if (savedData.exp >= 100) {
      // If the XP is 100 or more, level up
      while (savedData.exp >= 100) {
        savedData.exp -= 100; // Subtract 100 XP for the level-up
        savedData.level += 1; // Increment the level
      }

      // Update the DOM after leveling up
      document.querySelector(".level-number").textContent = savedData.level;
      document.getElementById("exp-fill").style.width = `${
        (savedData.exp / 100) * 100
      }%`; // Update XP bar
      document.getElementById("XPvalue").textContent = `${savedData.exp}/100`; // Update XP value
      document.getElementById("rank-text").textContent = getRank(
        savedData.level
      ); // Update rank

      // Save the updated data back to localStorage
      localStorage.setItem("gameData", JSON.stringify(savedData));
    }
  }

  // Function to save the game data to localStorage
 

  // Example: Function to get rank based on the level
  function getRank(level) {
    const ranks = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
    if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
    if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
    if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
    if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
    if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
    if (level >= 101) return ranks[5]; // S-Rank
  }

  // Function to load the game data from localStorage and update the UI
  function loadData() {
    const savedData = JSON.parse(localStorage.getItem("gameData"));

    if (savedData) {
      // Update level, XP, and other stats in the DOM
      document.querySelector(".level-number").textContent = savedData.level;
      document.getElementById("exp-fill").style.width = `${
        (savedData.exp / 100) * 100
      }%`;
      document.getElementById("XPvalue").textContent = `${savedData.exp}/100`;
      document.getElementById("HPvalue").textContent = savedData.hp + "/100";
      document.getElementById("hp-fill").style.width = `${
        (savedData.hp / 100) * 100
      }%`;
      document.getElementById("MPvalue").textContent = savedData.mp + "/100";
      document.getElementById("mp-fill").style.width = `${
        (savedData.mp / 100) * 100
      }%`;
      document.getElementById("STMvalue").textContent = savedData.stm + "/100";
      document.getElementById("stm-fill").style.width = `${
        (savedData.stm / 100) * 100
      }%`;
      document.getElementById("Fatvalue").textContent = savedData.fatigue;
      document.getElementById("rank-text").textContent = getRank(savedData.level);

      document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
      document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
      document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
      document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
      document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
      document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
      saveData = {...saveData,mentalQuests: "[0/3]",physicalQuests: "[0/4]",spiritualQuests: "[0/2]",};
      document.getElementById("ping-text").textContent = savedData.ping ;
      // Optionally, update the fatigue progress
      updateFatigueProgress();
    } else {
      console.log("reset")
      const defaultGameData = {
        level: 1,
        hp: 100,
        mp: 100,
        stm: 100,
        exp: 0,
        fatigue: 0,
        name: "Fedy",
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
      localStorage.setItem("gameData", JSON.stringify(defaultGameData));
    
      // Reload the page to reflect the changes
      location.reload();
      console.error("No saved data found in localStorage.");
    }
  }

  // Initialize the page by loading data and checking for level up
  
});
window.onload = function () {
  loadData(); // Load data from localStorage into the UI
  checkForLevelUp(); // Check if leveling up is necessary based on XP
};

/*window.onload = function () {
  function getRank(level) {
    if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
    if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
    if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
    if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
    if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
    if (level >= 101) return ranks[5]; // S-Rank
  }
  const urlParams = new URLSearchParams(window.location.search);
  const data = urlParams.get("data");
  console.log(data); // Log incoming data, if any.

  // Retrieve the saved game data from localStorage
  let savedData = JSON.parse(localStorage.getItem("gameData"));

  // Ensure `savedData` exists before proceeding
  if (savedData) {
    // Update the DOM with the current level, XP, and other stats
    document.querySelector(".level-number").textContent = savedData.level;

    // Update the XP progress bar and value
    document.getElementById("exp-fill").style.width = `${
      (savedData.exp / 100) * 100
    }%`; // Update XP bar width based on percentage
    document.getElementById("XPvalue").textContent = `${savedData.exp}/100`; // Show XP value (e.g., 50/100)

    // Update the rank based on level
    document.getElementById("rank-text").textContent = getRank(savedData.level);

    // Update other stats (HP, MP, Stamina, Fatigue)
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = `${
      (savedData.hp / 100) * 100
    }%`;

    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = `${
      (savedData.mp / 100) * 100
    }%`;

    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.getElementById("stm-fill").style.width = `${
      (savedData.stm / 100) * 100
    }%`;

    document.getElementById("Fatvalue").textContent = savedData.fatigue;

    // Optionally update fatigue progress if you have a progress ring
    updateFatigueProgress();
  } else {
    console.error("No saved data found in localStorage.");
  }
};*/

// Example: Function to update fatigue progress on a progress ring
function updateFatigueProgress() {
  const fatigueText = document.querySelector(".fatigue-value").textContent;
  const value = parseInt(fatigueText, 10);

  const circle = document.querySelector(".progress-ring__circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

// Example: Fatigue Progress Updating Function
function updateFatigueProgress() {
  const fatigueText = document.querySelector(".fatigue-value").textContent; // Get the fatigue text
  const value = parseInt(fatigueText, 10); // Convert to a number

  const circle = document.querySelector(".progress-ring__circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

document.getElementById("reset-button").addEventListener("click", function () {
  // Reset the game data in local storage
  const defaultGameData = {
    level: 1,
    hp: 100,
    mp: 100,
    stm: 100,
    exp: 0,
    fatigue: 0,
    name: "Fedy",
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
  localStorage.setItem("gameData", JSON.stringify(defaultGameData));

  // Reload the page to reflect the changes
  location.reload();
});

// Function to reset stats
function resetDailyStats() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));

  if (savedData) {
    // Reset HP, STM, MP, and Fatigue to default values
    savedData.hp = 100; // Full HP
    savedData.stm = 100; // Full Stamina
    savedData.mp = 100; // Full MP
    savedData.fatigue = 0; // No fatigue
    savedData.mentalQuests = "[0/3]";
    savedData.physicalQuests = "[0/4]";
    savedData.spiritualQuests = "[0/2]";
    console.log(savedData.mentalQuests);

    // Update the DOM
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;

    // Save the updated data
    localStorage.setItem("gameData", JSON.stringify(savedData));
    console.log(savedData.mentalQuests);
  }
}

// Function to check if a new day has started
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString();
  console.log("date:", currentDate); // Get today's date
  const lastResetDate = localStorage.getItem("lastResetDate"); // Get the last reset date from localStorage

  if (!lastResetDate || lastResetDate !== currentDate) {
    // If no date is saved or the day has changed, reset the stats
    resetDailyStats();

    // Update the last reset date in localStorage
    localStorage.setItem("lastResetDate", currentDate);
  }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", (event) => {
  checkForNewDay();
});
