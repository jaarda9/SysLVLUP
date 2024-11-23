document.addEventListener("DOMContentLoaded", function() {
    const ascendTextElement = document.getElementById('ascend-text');
    const ascendText = "Enter The Dungeon "; // The text to type out
    const typingSpeed = 100; // Speed in milliseconds

    // Function to type out the text
    function typeText(text, element, speed) {
        let i = 0;
        function typeChar() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            }
            
        }
        typeChar();
    }

    // Start typing the "Ascend" text
    typeText(ascendText, ascendTextElement, typingSpeed);
    
    // Existing password event listener
    document.getElementById("password").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const passwordInput = document.getElementById("password").value;
            const messageElement = document.getElementById("message");
            
            // Define your password
            const correctPassword = "Arise"; // Updated password

            if (passwordInput === correctPassword) {
                messageElement.textContent = "Login successful!";
                messageElement.style.color = "green";
                messageElement.classList.remove("hidden");
                // Redirect to another page or perform another action
                setTimeout(function () {
                    window.location.href = `index.html`;
                  }, 2000); // Uncomment to redirect
            } else {
                messageElement.textContent = "Incorrect Key. Please try again.";
                messageElement.style.color = "red";
                messageElement.classList.remove("hidden");
            }
        }
    });
});