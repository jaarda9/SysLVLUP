/**
 * Multi-Device Setup Script
 * Adds authentication options to allow users to access their data from multiple devices
 */

// Add authentication UI to login page
function addAuthUI() {
  const loginContainer = document.querySelector('.login-container');
  if (!loginContainer) return;
  
  // Create auth section
  const authSection = document.createElement('div');
  authSection.className = 'auth-section';
  authSection.innerHTML = `
    <div class="auth-tabs">
      <button class="auth-tab active" data-tab="login">Login</button>
      <button class="auth-tab" data-tab="register">Register</button>
    </div>
    
    <div class="auth-content">
      <div id="login-form" class="auth-form active">
        <input type="email" id="login-email" placeholder="Email" class="auth-input">
        <input type="password" id="login-password" placeholder="Password" class="auth-input">
        <button id="login-btn" class="auth-btn">Login</button>
      </div>
      
      <div id="register-form" class="auth-form">
        <input type="email" id="register-email" placeholder="Email" class="auth-input">
        <input type="password" id="register-password" placeholder="Password" class="auth-input">
        <input type="password" id="register-confirm" placeholder="Confirm Password" class="auth-input">
        <button id="register-btn" class="auth-btn">Register</button>
      </div>
    </div>
    
    <p class="auth-note">Login/register to access your data from any device</p>
  `;
  
  // Insert after password input
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.parentNode.insertBefore(authSection, passwordInput.nextSibling);
  }
  
  // Add tab functionality
  setupAuthTabs();
  setupAuthHandlers();
}

// Setup auth tab switching
function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding form
      forms.forEach(form => form.classList.remove('active'));
      document.getElementById(`${tabName}-form`).classList.add('active');
    });
  });
}

// Setup auth form handlers
function setupAuthHandlers() {
  // Login handler
  document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      showAuthMessage('Please fill in all fields', 'error');
      return;
    }
    
    const result = await window.authManager.login(email, password);
    if (result.success) {
      showAuthMessage('Login successful! Loading your data...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showAuthMessage(result.message, 'error');
    }
  });
  
  // Register handler
  document.getElementById('register-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (!email || !password || !confirm) {
      showAuthMessage('Please fill in all fields', 'error');
      return;
    }
    
    if (password !== confirm) {
      showAuthMessage('Passwords do not match', 'error');
      return;
    }
    
    const result = await window.authManager.register(email, password);
    if (result.success) {
      showAuthMessage('Registration successful! You can now login from any device.', 'success');
      // Switch to login tab
      document.querySelector('[data-tab="login"]').click();
    } else {
      showAuthMessage(result.message, 'error');
    }
  });
}

// Show auth messages
function showAuthMessage(message, type) {
  // Remove existing messages
  const existingMsg = document.querySelector('.auth-message');
  if (existingMsg) existingMsg.remove();
  
  const msgElement = document.createElement('p');
  msgElement.className = `auth-message ${type}`;
  msgElement.textContent = message;
  
  const authContent = document.querySelector('.auth-content');
  if (authContent) {
    authContent.appendChild(msgElement);
  }
}

// Add CSS for auth UI
function addAuthStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .auth-section {
      margin: 20px 0;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .auth-tabs {
      display: flex;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .auth-tab {
      flex: 1;
      padding: 10px;
      background: none;
      border: none;
      color: #ccc;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    
    .auth-tab.active {
      color: #4a90e2;
      border-bottom-color: #4a90e2;
    }
    
    .auth-form {
      display: none;
    }
    
    .auth-form.active {
      display: block;
    }
    
    .auth-input {
      width: 100%;
      padding: 10px;
      margin: 5px 0;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .auth-btn {
      width: 100%;
      padding: 12px;
      margin: 10px 0;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .auth-btn:hover {
      background: #357abD;
    }
    
    .auth-note {
      font-size: 12px;
      color: #888;
      margin-top: 10px;
      text-align: center;
    }
    
    .auth-message {
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      text-align: center;
    }
    
    .auth-message.success {
      background: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
      border: 1px solid #4CAF50;
    }
    
    .auth-message.error {
      background: rgba(244, 67, 54, 0.2);
      color: #F44336;
      border: 1px solid #F44336;
    }
  `;
  document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only add auth UI to login page
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname.endsWith('/')) {
    addAuthStyles();
    addAuthUI();
  }
});
