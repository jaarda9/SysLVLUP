/**
 * Multi-Device Setup UI
 * Provides authentication interface and device linking functionality
 */
class MultiDeviceSetup {
  constructor() {
    this.authManager = window.authManager;
    this.setupUI();
  }

  /**
   * Setup the authentication UI
   */
  setupUI() {
    // Add authentication UI to the login page
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
      this.addAuthUI(loginContainer);
    }

    // Add device linking UI to other pages
    this.addDeviceLinkingUI();
  }

  /**
   * Add authentication UI to login page
   */
  addAuthUI(container) {
    // Create auth container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    authContainer.innerHTML = `
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Login</button>
        <button class="auth-tab" data-tab="register">Register</button>
        <button class="auth-tab" data-tab="link">Link Device</button>
      </div>
      
      <div class="auth-content">
        <!-- Login Form -->
        <div class="auth-form active" id="login-form">
          <h3>Login to Sync Across Devices</h3>
          <input type="email" id="login-email" placeholder="Email" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button id="login-btn" class="auth-btn">Login</button>
          <p class="auth-message" id="login-message"></p>
        </div>
        
        <!-- Register Form -->
        <div class="auth-form" id="register-form">
          <h3>Create Account for Multi-Device Sync</h3>
          <input type="email" id="register-email" placeholder="Email" required>
          <input type="password" id="register-password" placeholder="Password" required>
          <input type="password" id="register-confirm" placeholder="Confirm Password" required>
          <button id="register-btn" class="auth-btn">Register</button>
          <p class="auth-message" id="register-message"></p>
        </div>
        
        <!-- Device Linking Form -->
        <div class="auth-form" id="link-form">
          <h3>Link This Device</h3>
          <div class="qr-section">
            <div id="qr-code"></div>
            <p>Scan this QR code with another device to link them</p>
          </div>
          <div class="manual-link">
            <input type="text" id="link-code" placeholder="Or enter link code manually">
            <button id="link-btn" class="auth-btn">Link Device</button>
          </div>
          <p class="auth-message" id="link-message"></p>
        </div>
      </div>
    `;

    // Insert before the existing password input
    const passwordInput = container.querySelector('#password');
    if (passwordInput) {
      passwordInput.parentNode.insertBefore(authContainer, passwordInput);
    }

    // Add event listeners
    this.addAuthEventListeners();
  }

  /**
   * Add device linking UI to other pages
   */
  addDeviceLinkingUI() {
    // Add a small device linking button to other pages
    const body = document.body;
    if (!body.querySelector('.device-link-btn')) {
      const linkBtn = document.createElement('button');
      linkBtn.className = 'device-link-btn';
      linkBtn.innerHTML = '🔗 Link Device';
      linkBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
        padding: 8px 12px;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      
      linkBtn.addEventListener('click', () => {
        this.showDeviceLinkingModal();
      });
      
      body.appendChild(linkBtn);
    }
  }

  /**
   * Add event listeners for authentication
   */
  addAuthEventListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // Login form
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLogin());
    }

    // Register form
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', () => this.handleRegister());
    }

    // Device linking
    const linkBtn = document.getElementById('link-btn');
    if (linkBtn) {
      linkBtn.addEventListener('click', () => this.handleDeviceLink());
    }

    // Generate QR code for device linking
    this.generateQRCode();
  }

  /**
   * Switch between auth tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update form visibility
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });
    document.getElementById(`${tabName}-form`).classList.add('active');

    // Generate QR code if switching to link tab
    if (tabName === 'link') {
      this.generateQRCode();
    }
  }

  /**
   * Handle user login
   */
  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    if (!email || !password) {
      this.showMessage(messageEl, 'Please fill in all fields', 'error');
      return;
    }

    try {
      await this.authManager.login(email, password);
      this.showMessage(messageEl, 'Login successful! Loading your data...', 'success');
      
      // Reload page to apply authenticated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      this.showMessage(messageEl, error.message, 'error');
    }
  }

  /**
   * Handle user registration
   */
  async handleRegister() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const messageEl = document.getElementById('register-message');

    if (!email || !password || !confirm) {
      this.showMessage(messageEl, 'Please fill in all fields', 'error');
      return;
    }

    if (password !== confirm) {
      this.showMessage(messageEl, 'Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage(messageEl, 'Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await this.authManager.register(email, password);
      this.showMessage(messageEl, 'Registration successful! Loading your data...', 'success');
      
      // Reload page to apply authenticated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      this.showMessage(messageEl, error.message, 'error');
    }
  }

  /**
   * Handle device linking
   */
  async handleDeviceLink() {
    const linkCode = document.getElementById('link-code').value;
    const messageEl = document.getElementById('link-message');

    if (!linkCode) {
      this.showMessage(messageEl, 'Please enter a link code', 'error');
      return;
    }

    try {
      await this.authManager.linkDevice(linkCode);
      this.showMessage(messageEl, 'Device linked successfully! Loading your data...', 'success');
      
      // Reload page to apply authenticated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      this.showMessage(messageEl, error.message, 'error');
    }
  }

  /**
   * Generate QR code for device linking
   */
  generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer) return;

    try {
      const linkCode = this.authManager.generateDeviceLinkCode();
      
      // Create QR code using a simple library or generate a visual representation
      qrContainer.innerHTML = `
        <div class="qr-code-display">
          <div class="qr-code-text">${linkCode}</div>
          <p>Share this code with another device</p>
        </div>
      `;
    } catch (error) {
      qrContainer.innerHTML = '<p>Please login first to generate link code</p>';
    }
  }

  /**
   * Show device linking modal
   */
  showDeviceLinkingModal() {
    const modal = document.createElement('div');
    modal.className = 'device-link-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Link This Device</h3>
        <div class="qr-section">
          <div id="modal-qr-code"></div>
          <p>Scan this QR code with another device</p>
        </div>
        <div class="manual-link">
          <input type="text" id="modal-link-code" placeholder="Or enter link code manually">
          <button id="modal-link-btn">Link Device</button>
        </div>
        <button class="modal-close">✕</button>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelector('#modal-link-btn').addEventListener('click', () => {
      const linkCode = modal.querySelector('#modal-link-code').value;
      this.handleModalDeviceLink(linkCode, modal);
    });

    // Generate QR code
    this.generateModalQRCode();
  }

  /**
   * Handle device linking from modal
   */
  async handleModalDeviceLink(linkCode, modal) {
    try {
      await this.authManager.linkDevice(linkCode);
      alert('Device linked successfully!');
      document.body.removeChild(modal);
      window.location.reload();
    } catch (error) {
      alert('Device linking failed: ' + error.message);
    }
  }

  /**
   * Generate QR code for modal
   */
  generateModalQRCode() {
    const qrContainer = document.getElementById('modal-qr-code');
    if (!qrContainer) return;

    try {
      const linkCode = this.authManager.generateDeviceLinkCode();
      qrContainer.innerHTML = `
        <div class="qr-code-display">
          <div class="qr-code-text">${linkCode}</div>
        </div>
      `;
    } catch (error) {
      qrContainer.innerHTML = '<p>Please login first to generate link code</p>';
    }
  }

  /**
   * Show message in auth forms
   */
  showMessage(element, message, type) {
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
  }
}

// Initialize multi-device setup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.authManager) {
    window.multiDeviceSetup = new MultiDeviceSetup();
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiDeviceSetup;
}
