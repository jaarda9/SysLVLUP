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