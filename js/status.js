// Global variables
let userManager = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Status page loaded, initializing...');
    initializeStatusPage();
});

// Initialize the status page
function initializeStatusPage() {
    // Create user manager instance
    userManager = new UserManager();
    window.userManager = userManager;
    
    // Check if player already has a name set
    const existingPlayerName = localStorage.getItem('playerName');
    
    if (existingPlayerName) {
        console.log('Existing player found:', existingPlayerName);
        // Player has a name, try to load their data
        loadExistingPlayerData(existingPlayerName);
    } else {
        console.log('New player, showing name input');
        // New player, show name input modal
        showNameInputModal();
    }
}

// Show name input modal for new players
function showNameInputModal() {
    const modal = document.getElementById('name-input-modal');
    const nameForm = document.getElementById('name-form');
    const nameInput = document.getElementById('player-name-input');
    
    modal.classList.remove('hidden');
    
    // Focus on name input
    nameInput.focus();
    
    // Handle form submission
    nameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const playerName = nameInput.value.trim();
        if (!playerName) {
            alert('Please enter a valid name');
            return;
        }
        
        console.log('Player name submitted:', playerName);
        
        try {
            // Set the user ID (player name) in user manager
            await userManager.setUserId(playerName);
            
            // Check if this player already exists in MongoDB
            const existingData = userManager.getData();
            
            if (existingData && existingData.gameData) {
                console.log('Loading existing player data:', existingData);
                // Player exists, load their data
                loadPlayerData(existingData.gameData);
            } else {
                console.log('Creating new player data for:', playerName);
                // New player, create initial data
                const initialData = userManager.createInitialData(playerName);
                loadPlayerData(initialData.gameData);
                
                // Save to MongoDB
                await userManager.saveUserData();
                console.log('Initial data saved for new player');
            }
            
            // Store player name locally
            localStorage.setItem('playerName', playerName);
            
            // Hide modal and show status content
            modal.classList.add('hidden');
            document.getElementById('status-content').classList.remove('hidden');
            
            // Set up event listeners for the status page
            setupStatusPageListeners();
            
        } catch (error) {
            console.error('Error setting up player:', error);
            alert('Error setting up player. Please try again.');
        }
    });
}

// Load existing player data
async function loadExistingPlayerData(playerName) {
    try {
        console.log('Loading data for existing player:', playerName);
        
        // Set the user ID in user manager
        await userManager.setUserId(playerName);
        
        // Load data from MongoDB
        const result = await userManager.loadUserData();
        
        if (result.success && result.data && result.data.gameData) {
            console.log('Existing data loaded:', result.data);
            loadPlayerData(result.data.gameData);
            
            // Show status content
            document.getElementById('name-input-modal').classList.add('hidden');
            document.getElementById('status-content').classList.remove('hidden');
            
            // Set up event listeners
            setupStatusPageListeners();
        } else {
            console.log('No existing data found, creating new data');
            // Player name exists but no data, create new data
            const initialData = userManager.createInitialData(playerName);
            loadPlayerData(initialData.gameData);
            
            // Save to MongoDB
            await userManager.saveUserData();
            
            // Show status content
            document.getElementById('name-input-modal').classList.add('hidden');
            document.getElementById('status-content').classList.remove('hidden');
            
            // Set up event listeners
            setupStatusPageListeners();
        }
        
    } catch (error) {
        console.error('Error loading existing player data:', error);
        // Fallback: show name input modal
        showNameInputModal();
    }
}

// Load player data into the UI
function loadPlayerData(gameData) {
    console.log('Loading player data into UI:', gameData);
    
    // Update character info
    if (gameData.name) {
        document.getElementById('job-text').textContent = gameData.name;
    }
    
    if (gameData.level) {
        document.querySelector('.level-number').textContent = gameData.level;
    }
    
    if (gameData.guild) {
        document.getElementById('guild-text').textContent = gameData.guild;
    }
    
    if (gameData.race) {
        document.getElementById('race-text').textContent = gameData.race;
    }
    
    if (gameData.title) {
        document.getElementById('title-text').textContent = gameData.title;
    }
    
    if (gameData.region) {
        document.getElementById('region-text').textContent = gameData.region;
    }
    
    if (gameData.location) {
        document.getElementById('location-text').textContent = gameData.location;
    }
    
    if (gameData.ping) {
        document.getElementById('ping-text').textContent = gameData.ping;
    }
    
    // Update stats
    if (gameData.hp !== undefined) {
        const hpFill = document.getElementById('hp-fill');
        const hpValue = hpFill.nextElementSibling;
        hpFill.style.width = `${gameData.hp}%`;
        hpValue.textContent = gameData.hp;
    }
    
    if (gameData.mp !== undefined) {
        const mpFill = document.getElementById('mp-fill');
        const mpValue = mpFill.nextElementSibling;
        mpFill.style.width = `${gameData.mp}%`;
        mpValue.textContent = gameData.mp;
    }
    
    if (gameData.stm !== undefined) {
        const stmFill = document.getElementById('stm-fill');
        const stmValue = stmFill.nextElementSibling;
        stmFill.style.width = `${gameData.stm}%`;
        stmValue.textContent = gameData.stm;
    }
    
    if (gameData.exp !== undefined) {
        const expFill = document.getElementById('exp-fill');
        const expValue = expFill.nextElementSibling;
        expFill.style.width = `${gameData.exp}%`;
        expValue.textContent = gameData.exp;
    }
    
    if (gameData.fatigue !== undefined) {
        document.querySelector('.fatigue-value').textContent = gameData.fatigue;
    }
    
    // Update attributes
    if (gameData.Attributes) {
        const attrs = gameData.Attributes;
        if (attrs.STR) document.getElementById('str-value').textContent = attrs.STR;
        if (attrs.VIT) document.getElementById('vit-value').textContent = attrs.VIT;
        if (attrs.AGI) document.getElementById('agi-value').textContent = attrs.AGI;
        if (attrs.INT) document.getElementById('int-value').textContent = attrs.INT;
        if (attrs.PER) document.getElementById('per-value').textContent = attrs.PER;
        if (attrs.WIS) document.getElementById('wis-value').textContent = attrs.WIS;
    }
    
    if (gameData.stackedAttributes) {
        const stacked = gameData.stackedAttributes;
        if (stacked.STR) document.getElementById('str-stacked').textContent = `+${stacked.STR}`;
        if (stacked.VIT) document.getElementById('vit-stacked').textContent = `+${stacked.VIT}`;
        if (stacked.AGI) document.getElementById('agi-stacked').textContent = `+${stacked.AGI}`;
        if (stacked.INT) document.getElementById('int-stacked').textContent = `+${stacked.INT}`;
        if (stacked.PER) document.getElementById('per-stacked').textContent = `+${stacked.PER}`;
        if (stacked.WIS) document.getElementById('wis-stacked').textContent = `+${stacked.WIS}`;
    }
    
    console.log('Player data loaded into UI successfully');
}

// Set up event listeners for the status page
function setupStatusPageListeners() {
    console.log('Setting up status page event listeners');
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', showImportModal);
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetData);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Import modal buttons
    const confirmImport = document.getElementById('confirm-import');
    if (confirmImport) {
        confirmImport.addEventListener('click', confirmImportData);
    }
    
    const cancelImport = document.getElementById('cancel-import');
    if (cancelImport) {
        cancelImport.addEventListener('click', hideImportModal);
    }
    
    // Set up auto-save
    setupAutoSave();
}

// Export data
function exportData() {
    if (!userManager || !userManager.getData()) {
        alert('No data to export');
        return;
    }
    
    const data = userManager.getData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syslvlup_${userManager.getUserId()}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('Data exported successfully');
}

// Show import modal
function showImportModal() {
    const modal = document.getElementById('import-modal');
    modal.classList.remove('hidden');
}

// Hide import modal
function hideImportModal() {
    const modal = document.getElementById('import-modal');
    modal.classList.add('hidden');
    
    // Clear textarea
    const textarea = document.getElementById('import-textarea');
    if (textarea) {
        textarea.value = '';
    }
}

// Confirm import data
async function confirmImportData() {
    const textarea = document.getElementById('import-textarea');
    const dataStr = textarea.value.trim();
    
    if (!dataStr) {
        alert('Please paste data to import');
        return;
    }
    
    try {
        const importedData = JSON.parse(dataStr);
        
        if (!importedData || !importedData.gameData) {
            alert('Invalid data format');
            return;
        }
        
        // Update user manager data
        userManager.setData('gameData', importedData.gameData);
        
        // Reload UI with imported data
        loadPlayerData(importedData.gameData);
        
        // Save to MongoDB
        await userManager.saveUserData();
        
        // Hide modal
        hideImportModal();
        
        alert('Data imported successfully!');
        console.log('Data imported and saved:', importedData);
        
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the format.');
    }
}

// Reset data
async function resetData() {
    if (!confirm('Are you sure you want to reset all your data? This cannot be undone!')) {
        return;
    }
    
    try {
        const playerName = userManager.getUserId();
        
        // Create fresh initial data
        const initialData = userManager.createInitialData(playerName);
        
        // Reload UI
        loadPlayerData(initialData.gameData);
        
        // Save to MongoDB
        await userManager.saveUserData();
        
        alert('Data reset successfully!');
        console.log('Data reset for player:', playerName);
        
    } catch (error) {
        console.error('Error resetting data:', error);
        alert('Error resetting data. Please try again.');
    }
}

// Logout
function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Clear local storage
    localStorage.removeItem('playerName');
    
    // Clear user manager
    userManager = null;
    window.userManager = null;
    
    // Redirect to alarm page
    window.location.href = 'alarm.html';
}

// Set up auto-save functionality
function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(async () => {
        if (userManager && userManager.hasUserId()) {
            try {
                await userManager.saveUserData();
                console.log('Auto-save completed');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }, 30000);
    
    // Auto-save before page unload
    window.addEventListener('beforeunload', async () => {
        if (userManager && userManager.hasUserId()) {
            try {
                await userManager.saveUserData();
                console.log('Final save before unload completed');
            } catch (error) {
                console.error('Final save failed:', error);
            }
        }
    });
}
