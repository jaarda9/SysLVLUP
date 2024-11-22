const playerBtn = document.getElementById("playerBtn");
playerBtn.addEventListener("click", function () {
  const savedData =JSON.parse(localStorage.getItem("gameData"));
  console.log("name",savedData.name)
  if (savedData.name==="Your Name") 
    { window.location.href = "Initiation.html";}
  else{
    window.location.href = "status.html";
  }
  
});

document.addEventListener("DOMContentLoaded", function () {
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
