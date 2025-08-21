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
document.addEventListener('DOMContentLoaded', function() {
    const introTextElement = document.getElementById('intro-text');
    const ritualContainer = document.querySelector('.ritual-container');
    const messageElement = document.getElementById('message');

    const introText = "Welcome, Traveler. You stand on the precipice of transformation.\n This system awaits your awakening. It is a realm where the past dissolves and the future unfolds.";
    const messages = 
    "Finish a Book.<br><br>Finish A Lecture.<br><br>Memorize One Page.<br><br>Finish a Workout.<br><br>Remain Silent for the whole Day.";

    const typingSpeed = 65; // Speed in milliseconds

    // Function to type out the text
   // Function to type out the text
function typeText(text, element, speed) {
    element.classList.add('typing'); // Add typing class for cursor effect

    // Split the text by <br> to handle line breaks
    const segments = text.split('<br>');
    let currentSegment = 0;

    function typeSegment(segment) {
        let i = 0;
        function typeChar() {
            if (i < segment.length) {
                element.innerHTML += segment.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                currentSegment++;
                if (currentSegment < segments.length) {
                    element.innerHTML += '<br>'; // Add a line break before the next segment
                    typeSegment(segments[currentSegment]); // Type the next segment
                } else {
                    element.classList.remove('typing'); // Remove typing class after finishing
                    ritualContainer.classList.remove('hidden'); // Show the ritual container
                }
            }
        }
        typeChar();
    }

    // Start typing the first segment
    typeSegment(segments[currentSegment]);
}
    // Start typing the intro text
   
    setTimeout(function() {
        typeText(introText, introTextElement, typingSpeed); // Start typing messages after delay
    }, 3000);
    setTimeout(function() {
        typeText(messages, messageElement, typingSpeed); // Start typing messages after delay
    }, 19000);
});


document.getElementById("accept-quest").addEventListener("click", function() {
     // Replace with your logic for accepting the quest
    // You can redirect to another page or load quest details here
    window.location.href = "Rituaal.html"; // Example redirection
});

document.getElementById("deny-quest").addEventListener("click", function() {
     
    const initiationContainer = document.querySelector(".initiation-container");
    initiationContainer.style.display = "none"; // Hide the initiation container
});

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle file import
  function importData(event) {
  const file = event.target.files[0]; // Get the selected file
  if (!file) {
      alert("No file selected.");
      return;
  }

  const reader = new FileReader(); // Create a FileReader instance
  reader.onload = function(e) {
      try {
          const importedData = JSON.parse(e.target.result); // Parse the file content
          
          // Clear existing local storage (optional)
          localStorage.clear();
          
          // Store each key-value pair back into local storage
          for (const key in importedData) {
              if (importedData.hasOwnProperty(key)) {
                  localStorage.setItem(key, importedData[key]);
              }
          }
          
          // Show success notification
          const notification = document.getElementById("notification");
          notification.classList.remove("hidden"); // Remove hidden class
          notification.classList.add("show"); // Add show class
          
          setTimeout(() => {
              notification.classList.remove("show"); // Hide after 2 seconds
              notification.classList.add("hidden"); // Add hidden class back
          }, 2500); // 2 seconds delay before hiding
          
          // Redirect after a short delay
          setTimeout(() => {
              window.location.href = "status.html"; // Redirect to status.html
          }, 2500); // Same delay for redirecting
      } catch (error) {
          alert("Failed to import data. Please make sure the file is valid."); // Error handling
      }
  };
  reader.readAsText(file); // Read the file as text
}
    // Event listener for the import input
    document.getElementById("import-input").addEventListener("change", importData);

    // Event listener for the import button
    document.getElementById("import-button").addEventListener("click", function() {
        document.getElementById("import-input").click(); // Trigger the file input click
    });
});
