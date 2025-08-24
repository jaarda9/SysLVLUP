// Dynamic Key Authentication System
let currentKey = null;
let typingIndex = 0;
const text = "Enter The Dungeon";
const typingSpeed = 100;

// Initialize dynamic key when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing login system...');
    
    // Start typing animation immediately
    startTypingAnimation();
    
    // Try to initialize key with user manager
    initializeKeyWithUserManager();
    
    // Fallback: if no key after 2 seconds, generate one
    setTimeout(() => {
        if (!currentKey) {
            console.log('Fallback: Generating key without user manager');
            currentKey = generateKey();
        }
    }, 2000);
});

function initializeKeyWithUserManager() {
    if (window.userManager) {
        console.log('User manager found, initializing key...');
        let sessionKey = window.userManager.getData('sessionKey');
        
        if (!sessionKey) {
            sessionKey = generateKey();
            window.userManager.setData('sessionKey', sessionKey);
            console.log('Generated new session key:', sessionKey);
        } else {
            console.log('Using existing session key:', sessionKey);
        }
        
        currentKey = sessionKey;
    } else {
        console.log('User manager not found, will use fallback');
    }
}

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showKey() {
    // Make sure we have a key
    if (!currentKey) {
        currentKey = generateKey();
        console.log('Generated key for display:', currentKey);
    }
    
    console.log('Showing dynamic key:', currentKey);
    
    const keyDisplay = document.createElement('div');
    keyDisplay.id = 'dynamic-key-display';
    keyDisplay.innerHTML = `
        <div class="key-container">
            <div class="key-label">Your Session Key:</div>
            <div class="key-value">${currentKey}</div>
            <div class="key-instruction">Click to generate new key</div>
        </div>
    `;
    
    // Add click handler to generate new key
    keyDisplay.addEventListener('click', function() {
        generateNewKey();
        keyDisplay.remove();
    });
    
    // Add the key display to the login container instead of body
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        // Insert before the password input
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            loginContainer.insertBefore(keyDisplay, passwordInput);
        } else {
            loginContainer.appendChild(keyDisplay);
        }
    } else {
        // Fallback to body if login container not found
        document.body.appendChild(keyDisplay);
    }
    
    // Remove key display after 10 seconds (longer for testing)
    setTimeout(() => {
        if (keyDisplay.parentNode) {
            keyDisplay.remove();
        }
    }, 10000);
}

function generateNewKey() {
    const newKey = generateKey();
    currentKey = newKey;
    
    if (window.userManager) {
        window.userManager.setData('sessionKey', newKey);
        console.log('Generated new session key:', newKey);
    }
    
    showKey();
}

function startTypingAnimation() {
    const ascendText = document.getElementById('ascend-text');
    if (!ascendText) {
        console.error('ascend-text element not found');
        return;
    }
    
    function typeNextChar() {
        if (typingIndex < text.length) {
            ascendText.textContent += text.charAt(typingIndex);
            typingIndex++;
            setTimeout(typeNextChar, typingSpeed);
        } else {
            // Show the dynamic key after typing animation completes
            setTimeout(showKey, 500);
        }
    }
    
    typeNextChar();
}

// Password input handling
document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('message');
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const enteredPassword = passwordInput.value.trim();
                
                if (!currentKey) {
                    console.error('No session key available');
                    showMessage('Error: No session key available', 'error');
                    return;
                }
                
                if (enteredPassword === currentKey) {
                    // Authentication successful
                    if (window.userManager) {
                        window.userManager.setData('authenticated', true);
                        window.userManager.setData('authTimestamp', Date.now().toString());
                        console.log('Authentication successful with key:', currentKey);
                    }
                    
                    showMessage('Access Granted! Redirecting...', 'success');
                    
                    // Redirect to main page after a short delay
                    setTimeout(() => {
                        window.location.href = 'alarm.html';
                    }, 1000);
                    
                } else {
                    showMessage('Invalid Session Key', 'error');
                    passwordInput.value = '';
                }
            }
        });
    }
});

function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = type === 'success' ? 'success' : 'error';
        messageElement.classList.remove('hidden');
        
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 3000);
    }
}




