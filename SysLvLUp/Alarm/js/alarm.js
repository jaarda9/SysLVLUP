function loadData() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  if (savedData) {
    document.querySelector(".level-number").textContent = savedData.level;
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.getElementById("exp-fill").style.width = savedData.exp + "%";
    document.getElementById("XPvalue").textContent = savedData.exp + "/100";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;
    document.getElementById("job-text").textContent = savedData.name;
    document.getElementById("ping-text").textContent = savedData.ping;
    document.getElementById("guild-text").textContent = savedData.guild;
    document.getElementById("race-text").textContent = savedData.race;
    document.getElementById("title-text").textContent = savedData.title;
    document.getElementById("region-text").textContent = savedData.region;
    document.getElementById("location-text").textContent = savedData.location;
    document.getElementById("rank-text").textContent = getRank(savedData.level);
    document.querySelector(".quests .status:not(.done)").textContent = `Lv.${savedData.level}`;
    document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
    document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
    document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
    document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
    document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
    document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
  }
  else{
    resetData();
  }
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

