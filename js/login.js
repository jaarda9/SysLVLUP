// Simple Dynamic Key System
console.log('Login.js loaded - Dynamic Key System');

// Generate a random 8-character key
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('Generated key:', key);
    return key;
}

// Show the key on the page
function showKey(key) {
    console.log('Showing key:', key);
    
    // Create the key display element
    const keyDiv = document.createElement('div');
    keyDiv.id = 'key-display';
    keyDiv.style.cssText = `
        margin: 20px 0;
        padding: 15px;
        background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(138, 43, 226, 0.2));
        border: 2px solid rgba(74, 144, 226, 0.5);
        border-radius: 10px;
        text-align: center;
        color: white;
        font-family: 'Courier New', monospace;
        font-size: 1.5rem;
        font-weight: bold;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
        animation: fadeIn 1s ease-in-out;
    `;
    
    keyDiv.innerHTML = `
        <div style="font-size: 0.9rem; margin-bottom: 8px; opacity: 0.8;">Your Session Key:</div>
        <div style="color: #4A90E2; cursor: pointer;" onclick="generateNewKey()">${key}</div>
        <div style="font-size: 0.8rem; margin-top: 8px; opacity: 0.6; font-style: italic;">Click to generate new key</div>
    `;
    
    // Find where to insert it
    const container = document.querySelector('.login-container');
    const passwordInput = document.getElementById('password');
    
    if (container && passwordInput) {
        // Insert before the password input
        container.insertBefore(keyDiv, passwordInput);
        console.log('Key display added successfully');
    } else {
        console.error('Could not find container or password input');
    }
}

// Generate new key when clicked
function generateNewKey() {
    console.log('Generating new key...');
    const newKey = generateKey();
    localStorage.setItem('sessionKey', newKey);
    
    // Update the display
    const keyDisplay = document.getElementById('key-display');
    if (keyDisplay) {
        const keyElement = keyDisplay.querySelector('div:nth-child(2)');
        if (keyElement) {
            keyElement.textContent = newKey;
        }
    }
    
    // Update the current key variable
    window.currentSessionKey = newKey;
}

// Main initialization
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM loaded - initializing dynamic key system');
    
    // Generate or get existing key
    let sessionKey = localStorage.getItem('sessionKey');
    if (!sessionKey) {
        sessionKey = generateKey();
        localStorage.setItem('sessionKey', sessionKey);
        console.log('Created new session key:', sessionKey);
    } else {
        console.log('Using existing session key:', sessionKey);
    }
    
    // Store key globally for access
    window.currentSessionKey = sessionKey;
    
    // Type out the title
    const ascendTextElement = document.getElementById('ascend-text');
    if (ascendTextElement) {
        const text = "Enter The Dungeon";
        let i = 0;
        
        function typeChar() {
            if (i < text.length) {
                ascendTextElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeChar, 100);
            } else {
                // Show key after typing is done
                setTimeout(() => showKey(sessionKey), 500);
            }
        }
        typeChar();
    } else {
        console.error('Could not find ascend-text element');
        // Show key immediately if typing element not found
        setTimeout(() => showKey(sessionKey), 1000);
    }
    
    // Handle password input
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const inputValue = this.value.trim();
                const messageElement = document.getElementById('message');
                
                console.log('Checking password:', inputValue, 'against:', sessionKey);
                
                if (inputValue === sessionKey) {
                    console.log('Authentication successful');
                    messageElement.textContent = "Access Granted!";
                    messageElement.style.color = "#00ff88";
                    messageElement.classList.remove("hidden");
                    
                    // Store authentication
                    localStorage.setItem('authenticated', 'true');
                    localStorage.setItem('authTimestamp', Date.now().toString());
                    
                    // Redirect
                    setTimeout(() => {
                        window.location.href = 'alarm.html';
                    }, 1500);
                } else {
                    console.log('Authentication failed');
                    messageElement.textContent = "Incorrect Key. Please try again.";
                    messageElement.style.color = "#ff4444";
                    messageElement.classList.remove("hidden");
                    this.value = "";
                }
            }
        });
    } else {
        console.error('Could not find password input');
    }
});

// Add fadeIn animation if not already present
if (!document.querySelector('style[data-dynamic-key]')) {
    const style = document.createElement('style');
    style.setAttribute('data-dynamic-key', 'true');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}




