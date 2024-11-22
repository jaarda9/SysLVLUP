 const savedData =JSON.parse(localStorage.getItem("gameData"));

const playerBtn = document.getElementById("playerBtn");
playerBtn.addEventListener("click", function () {
  const savedData =JSON.parse(localStorage.getItem("gameData"));
  
  if (savedData.name==="Your Name") 
    { window.location.href = "Initiation.html";}
  else{
    window.location.href = "status.html";
  }
  
});

