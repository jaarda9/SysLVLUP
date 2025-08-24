// Dynamic Key Authentication System
let currentKey = null;
let typingIndex = 0;
const text = "Enter The Dungeon";
const typingSpeed = 100;

// Initialize dynamic key when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDynamicKey();
    startTypingAnimation();
});

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function initializeDynamicKey() {
    // Check if we have a user manager
    if (window.userManager) {
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
        console.warn('User manager not available, using fallback');
        currentKey = generateKey();
    }
}

function showKey() {
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
    
    // Add inline styles to avoid CSS loading issues
    keyDisplay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #00ff00;
        text-align: center;
        z-index: 1000;
        font-family: 'Courier New', monospace;
        animation: fadeIn 0.5s ease-in;
    `;
    
    // Add fadeIn animation if not already present
    if (!document.querySelector('#fadeIn-style')) {
        const style = document.createElement('style');
        style.id = 'fadeIn-style';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add click handler to generate new key
    keyDisplay.addEventListener('click', function() {
        generateNewKey();
        keyDisplay.remove();
    });
    
    document.body.appendChild(keyDisplay);
    
    // Remove key display after 5 seconds
    setTimeout(() => {
        if (keyDisplay.parentNode) {
            keyDisplay.remove();
        }
    }, 5000);
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
    if (!ascendText) return;
    
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
document.addEventListener('DOMContentLoaded', function() {
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




