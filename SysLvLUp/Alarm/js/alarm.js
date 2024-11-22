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
  localStorage.setItem("gameData", JSON.stringify(defaultGameData));
  location.reload();
}

const playerBtn = document.getElementById("playerBtn");
playerBtn.addEventListener("click", function () {
  const savedData =JSON.parse(localStorage.getItem("gameData"));
  
  if (savedData.name==="Your Name") 
    { window.location.href = "Initiation.html";}
  else{
    window.location.href = "status.html";
  }
  
});

document.addEventListener("DOMContentLoaded", function () {
 resetData();
   const savedData =JSON.parse(localStorage.getItem("gameData"));
  // Check if fullscreen mode is supported
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  } else {
    console.log("Fullscreen mode is not supported in this browser.");
  }
});
