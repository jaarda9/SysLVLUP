// Dynamic Key Generation System
function generateDynamicKey() {
    // Generate a random 8-character key with letters and numbers
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate and store the dynamic key
function initializeDynamicKey() {
    const dynamicKey = generateDynamicKey();
    localStorage.setItem('sessionKey', dynamicKey);
    return dynamicKey;
}

// Display the dynamic key in a stylish way
function displayDynamicKey(key) {
    const keyDisplay = document.createElement('div');
    keyDisplay.id = 'dynamic-key-display';
    keyDisplay.innerHTML = `
        <div class="key-container">
            <div class="key-label">Your Session Key:</div>
            <div class="key-value">${key}</div>
            <div class="key-instruction">Enter this key to continue</div>
        </div>
    `;
    
    // Insert after the ascend-text element
    const ascendText = document.getElementById('ascend-text');
    ascendText.parentNode.insertBefore(keyDisplay, ascendText.nextSibling);
}

// Sync function (keeping existing functionality)
async function syncToDatabase() {
    try {
        // Use centralized user manager if available
        if (window.userManager) {
            await window.userManager.syncToDatabase();
            console.log('Sync successful using centralized user manager');
            return { success: true, message: 'Data synced successfully' };
        }
        
        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('No userId found in localStorage');
            return { success: false, message: 'No userId available' };
        }
        
        // Get all localStorage data
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                localStorageData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                localStorageData[key] = localStorage.getItem(key);
            }
        }
        
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
                userId: userId,
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

document.addEventListener("DOMContentLoaded", function() {
    const ascendTextElement = document.getElementById('ascend-text');
    const ascendText = "Enter The Dungeon"; // The text to type out
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

    // Start typing the "Enter The Dungeon" text
    typeText(ascendText, ascendTextElement, typingSpeed);
    
    // Initialize dynamic key system
    let currentKey = localStorage.getItem('sessionKey');
    if (!currentKey) {
        currentKey = initializeDynamicKey();
    }
    
    // Display the dynamic key after typing animation completes
    setTimeout(() => {
        displayDynamicKey(currentKey);
    }, ascendText.length * typingSpeed + 500);
    
    // Dynamic key authentication
    document.getElementById("password").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const passwordInput = document.getElementById("password").value.trim();
            const messageElement = document.getElementById("message");
            
            // Check against the current session key
            if (passwordInput === currentKey) {
                messageElement.textContent = "Access Granted!";
                messageElement.style.color = "#00ff88";
                messageElement.classList.remove("hidden");
                
                // Store authentication status
                localStorage.setItem('authenticated', 'true');
                localStorage.setItem('authTimestamp', Date.now().toString());
                
                // Redirect to alarm page
                setTimeout(function () {
                    window.location.href = 'alarm.html';
                }, 1500);
            } else {
                messageElement.textContent = "Incorrect Key. Please try again.";
                messageElement.style.color = "#ff4444";
                messageElement.classList.remove("hidden");
                
                // Clear the input
                document.getElementById("password").value = "";
            }
        }
    });
    
    // Add click handler for key refresh (optional)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('key-value')) {
            // Generate new key on click
            const newKey = generateDynamicKey();
            localStorage.setItem('sessionKey', newKey);
            currentKey = newKey;
            
            // Update display
            const keyDisplay = document.getElementById('dynamic-key-display');
            if (keyDisplay) {
                keyDisplay.querySelector('.key-value').textContent = newKey;
            }
        }
    });
});




