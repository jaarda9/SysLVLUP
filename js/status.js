// Global variables
let userManager = null;
let isPhone = false;
let performanceMode = false;

// Function to animate text values from start to end
function animateTextValue(element, startValue, endValue, maxValue, isFatigue = false) {
    if (!element) return;
    
    const duration = 1000; // 1 second animation
    const startTime = performance.now();
    
    function updateText(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
        
        if (isFatigue) {
            // Fatigue mode: just show the number with % (no /100)
            element.textContent = currentValue + '%';
        } else {
            // Regular mode: show "value/max" format
            element.innerHTML = `<span class="value-major">${currentValue}</span>/<span class="value-max">${maxValue}</span>`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateText);
        }
    }
    
    requestAnimationFrame(updateText);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Status page loaded, initializing...');
    
    // Detect phone and set performance mode
    detectDeviceAndSetPerformance();
    
    initializeStatusPage();
});

// Detect device and set performance optimizations
function detectDeviceAndSetPerformance() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    isPhone = isMobile || isTouch;
    performanceMode = isPhone;
    
    if (performanceMode) {
        console.log('Phone detected - enabling performance mode');
        document.body.classList.add('phone-mode');
        
        // Reduce motion for better performance
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }
}

// Hide loading ring when content is ready
function hideLoadingRing() {
    const loadingRing = document.getElementById('loading-ring');
    if (loadingRing) {
        loadingRing.classList.add('hidden');
    }
}

// Show loading ring
function showLoadingRing() {
    const loadingRing = document.getElementById('loading-ring');
    if (loadingRing) {
        loadingRing.classList.remove('hidden');
    }
}

// Reload fresh data when page becomes visible (user returns from other pages)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && userManager && userManager.hasUserId()) {
        console.log('Page became visible, reloading fresh data...');
        try {
            // Wait a bit to avoid conflicts with daily reset check
            setTimeout(async () => {
                // Force reload fresh data from database
                await userManager.loadUserData();
                const freshData = userManager.getData();
                if (freshData && freshData.gameData) {
                    console.log('Fresh data loaded:', freshData.gameData);
                    loadPlayerData(freshData.gameData);
                }
            }, 2000); // Wait 2 seconds to avoid conflicts
        } catch (error) {
            console.error('Error reloading fresh data:', error);
        }
    }
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
    
    console.log('showNameInputModal called');
    console.log('Modal element:', modal);
    console.log('Modal classes before:', modal ? modal.className : 'null');
    
    // Hide loading ring when showing modal for new players
    hideLoadingRing();
    
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal classes after removing hidden:', modal.className);
        console.log('Modal display style:', window.getComputedStyle(modal).display);
    }
    
    // Focus on name input
    if (nameInput) {
        nameInput.focus();
    }
    
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
            // Set the user ID (player name) in user manager and check if data exists
            const result = await userManager.setUserId(playerName);
            
            console.log('Result from setUserId:', result);
            
            if (result.dataFound) {
                console.log('Loading existing player data for:', playerName);
                // Player exists, load their data
                const existingData = userManager.getData();
                console.log('Existing data retrieved:', existingData);
                loadPlayerData(existingData.gameData);
            } else {
                console.log('Creating new player data for:', playerName);
                
                // Triple-check: if we have data in userManager, don't create new data
                const currentData = userManager.getData();
                if (currentData && currentData.gameData) {
                    console.log('WARNING: Data exists in userManager but dataFound was false! Using existing data.');
                    loadPlayerData(currentData.gameData);
                } else {
                    // Final check: try to load data one more time before creating new
                    console.log('Final attempt to load existing data before creating new...');
                    const finalLoadResult = await userManager.loadUserData();
                    if (finalLoadResult.success && userManager.getData() && userManager.getData().gameData) {
                        console.log('SUCCESS: Found existing data on final attempt!');
                        loadPlayerData(userManager.getData().gameData);
                    } else {
                        // New player, create initial data
                        console.log('Confirmed: No existing data found, creating new player data');
                        const initialData = userManager.createInitialData(playerName);
                        loadPlayerData(initialData.gameData);
                        
                        // Save to MongoDB
                        await userManager.saveUserData();
                        console.log('Initial data saved for new player');
                    }
                }
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
        
        // Set the user ID in user manager and check if data exists
        const result = await userManager.setUserId(playerName);
        
        console.log('Result from setUserId in loadExistingPlayerData:', result);
        
        if (result.dataFound) {
            console.log('Existing data loaded for:', playerName);
            const existingData = userManager.getData();
            console.log('Existing data retrieved in loadExistingPlayerData:', existingData);
            loadPlayerData(existingData.gameData);
            
            // Show status content
            document.getElementById('name-input-modal').classList.add('hidden');
            document.getElementById('status-content').classList.remove('hidden');
            
            // Set up event listeners
            setupStatusPageListeners();
        } else {
            console.log('No existing data found, creating new data for:', playerName);
            
            // Triple-check: if we have data in userManager, don't create new data
            const currentData = userManager.getData();
            if (currentData && currentData.gameData) {
                console.log('WARNING: Data exists in userManager but dataFound was false! Using existing data.');
                loadPlayerData(currentData.gameData);
            } else {
                // Final check: try to load data one more time before creating new
                console.log('Final attempt to load existing data before creating new...');
                const finalLoadResult = await userManager.loadUserData();
                if (finalLoadResult.success && userManager.getData() && userManager.getData().gameData) {
                    console.log('SUCCESS: Found existing data on final attempt!');
                    loadPlayerData(userManager.getData().gameData);
                } else {
                    // Player name exists but no data, create new data
                    console.log('Confirmed: No existing data found, creating new player data');
                    const initialData = userManager.createInitialData(playerName);
                    loadPlayerData(initialData.gameData);
                    
                    // Save to MongoDB
                    await userManager.saveUserData();
                }
            }
            
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
    
    // Debug: Check what elements exist
    console.log('Checking DOM elements...');
    console.log('job-text exists:', !!document.getElementById('job-text'));
    console.log('level-number exists:', !!document.querySelector('.level-number'));
    console.log('guild-text exists:', !!document.getElementById('guild-text'));
    console.log('race-text exists:', !!document.getElementById('race-text'));
    console.log('title-text exists:', !!document.getElementById('title-text'));
    console.log('region-text exists:', !!document.getElementById('region-text'));
    console.log('location-text exists:', !!document.getElementById('location-text'));
    console.log('ping-text exists:', !!document.getElementById('ping-text'));
    
    // Update character info
    // job-text should display the player's NAME from the database
    if (gameData.name) {
        const jobText = document.getElementById('job-text');
        if (jobText) {
            jobText.textContent = gameData.name;
        } else {
            console.warn('job-text element not found');
        }
    }

    // name-text should display the player's JOB from the database
    if (gameData.job !== undefined) {
        const nameText = document.getElementById('name-text');
        if (nameText) {
            nameText.textContent = gameData.job || 'None';
        } else {
            console.warn('name-text element not found');
        }
    }
    
    if (gameData.level !== undefined) {
        const levelNumber = document.querySelector('.level-number');
        if (levelNumber) {
            levelNumber.textContent = gameData.level;
        } else {
            console.warn('level-number element not found');
        }
        // Sync any level pills if present
        const levelPill1 = document.getElementById('player-level-pill');
        if (levelPill1) levelPill1.textContent = String(gameData.level);
        const levelPill2 = document.getElementById('player-level-pill-2');
        if (levelPill2) levelPill2.textContent = String(gameData.level);
    }
    
    if (gameData.guild) {
        const guildText = document.getElementById('guild-text');
        if (guildText) {
            guildText.textContent = gameData.guild;
        } else {
            console.warn('guild-text element not found');
        }
    }
    
    if (gameData.race) {
        const raceText = document.getElementById('race-text');
        if (raceText) {
            raceText.textContent = gameData.race;
        } else {
            console.warn('race-text element not found');
        }
    }
    
    if (gameData.title) {
        const titleText = document.getElementById('title-text');
        if (titleText) {
            titleText.textContent = gameData.title;
        } else {
            console.warn('title-text element not found');
        }
    }
    
    if (gameData.region) {
        const regionText = document.getElementById('region-text');
        if (regionText) {
            regionText.textContent = gameData.region;
        } else {
            console.warn('region-text element not found');
        }
    }
    
    if (gameData.location) {
        const locationText = document.getElementById('location-text');
        if (locationText) {
            locationText.textContent = gameData.location;
        } else {
            console.warn('location-text element not found');
        }
    }
    
    if (gameData.ping) {
        const pingText = document.getElementById('ping-text');
        if (pingText) {
            pingText.textContent = gameData.ping;
        } else {
            console.warn('ping-text element not found');
        }
    }
    
    // Update stats
    if (gameData.hp !== undefined) {
        const hpFill = document.getElementById('hp-fill');
        const hpValue = document.getElementById('hp-value');
        if (hpFill) {
            hpFill.style.width = `${gameData.hp}%`;
        }
        if (hpValue) {
            // Animate text from 0 to real value
            animateTextValue(hpValue, 0, gameData.hp, 100);
        }
    }
    
    if (gameData.mp !== undefined) {
        const mpFill = document.getElementById('mp-fill');
        const mpValue = document.getElementById('mp-value');
        if (mpFill) {
            mpFill.style.width = `${gameData.mp}%`;
        }
        if (mpValue) {
            // Animate text from 0 to real value
            animateTextValue(mpValue, 0, gameData.mp, 100);
        }
    }
    
    if (gameData.stm !== undefined) {
        const stmFill = document.getElementById('stm-fill');
        const stmValue = document.getElementById('stm-value');
        if (stmFill) {
            stmFill.style.width = `${gameData.stm}%`;
        }
        if (stmValue) {
            // Animate text from 0 to real value
            animateTextValue(stmValue, 0, gameData.stm, 100);
        }
    }
    
    if (gameData.exp !== undefined) {
        const expFill = document.getElementById('exp-fill');
        const expValue = document.getElementById('exp-value');
        if (expFill) {
            expFill.style.width = `${gameData.exp}%`;
        }
        if (expValue) {
            // Animate text from 0 to real value
            animateTextValue(expValue, 0, gameData.exp, 100);
        }
    }
    
    if (gameData.fatigue !== undefined) {
        const fatigueFill = document.getElementById('fatigue-fill');
        const fatigueValue = document.getElementById('fatigue-value');
        if (fatigueFill) {
            fatigueFill.style.width = `${gameData.fatigue}%`;
        }
        if (fatigueValue) {
            fatigueValue.textContent = `${gameData.fatigue}/100`;
        }

        // Also update the new SVG fatigue ring used in the redesigned status page
        // These elements exist in the visible UI and should reflect the same value
        const svgRingCircle = document.getElementById('fatringprogg');
        const svgRingText = document.getElementById('Fatvalue');
        if (svgRingCircle) {
            // 2 * Math.PI * r for r=34 → 213.628 (kept inline to avoid floating drift)
            const circumference = 213.628;
            const dashOffset = circumference - (Number(gameData.fatigue) / 100) * circumference;
            svgRingCircle.style.strokeDashoffset = String(dashOffset);
        }
        if (svgRingText) {
            // Animate fatigue text from 0 to real value
            animateTextValue(svgRingText, 0, gameData.fatigue, 100, true); // true = fatigue mode (no /100)
        }
    }
    
    // Update attributes
    if (gameData.Attributes) {
        const attrs = gameData.Attributes;
        if (attrs.STR !== undefined) {
            const strValue = document.getElementById('str-value');
            if (strValue) strValue.textContent = attrs.STR;
        }
        if (attrs.VIT !== undefined) {
            const vitValue = document.getElementById('vit-value');
            if (vitValue) vitValue.textContent = attrs.VIT;
        }
        if (attrs.AGI !== undefined) {
            const agiValue = document.getElementById('agi-value');
            if (agiValue) agiValue.textContent = attrs.AGI;
        }
        if (attrs.INT !== undefined) {
            const intValue = document.getElementById('int-value');
            if (intValue) intValue.textContent = attrs.INT;
        }
        if (attrs.PER !== undefined) {
            const perValue = document.getElementById('per-value');
            if (perValue) perValue.textContent = attrs.PER;
        }
        if (attrs.WIS !== undefined) {
            const wisValue = document.getElementById('wis-value');
            if (wisValue) wisValue.textContent = attrs.WIS;
        }
    }
    
    // Update available points
    if (gameData.availablePoints !== undefined) {
        const availablePoints = document.getElementById('available-points');
        if (availablePoints) {
            availablePoints.textContent = gameData.availablePoints;
        }
    }
    
    console.log('Player data loaded into UI successfully');
    
    // Hide loading ring after data is loaded
    hideLoadingRing();
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
    
    // Daily reset button
    const dailyResetBtn = document.getElementById('daily-reset-btn');
    if (dailyResetBtn) {
        dailyResetBtn.addEventListener('click', manualDailyReset);
    }
    
    // Force daily reset check button (for debugging)
    const forceResetCheckBtn = document.getElementById('force-reset-check-btn');
    if (forceResetCheckBtn) {
        forceResetCheckBtn.addEventListener('click', forceDailyResetCheck);
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

// Manual daily reset
async function manualDailyReset() {
    if (!confirm('Are you sure you want to perform a daily reset? This will reset HP, MP, stamina, fatigue, and daily quests to their starting values.')) {
        return;
    }
    
    try {
        console.log('Manual daily reset requested');
        await performDailyReset();
        alert('Daily reset completed successfully!');
    } catch (error) {
        console.error('Error during manual daily reset:', error);
        alert('Error performing daily reset. Please try again.');
    }
}

// Force daily reset check (for debugging)
async function forceDailyResetCheck() {
    try {
        console.log('Force daily reset check requested');
        await checkAndPerformDailyReset();
        alert('Daily reset check completed! Check console for details.');
    } catch (error) {
        console.error('Error during forced daily reset check:', error);
        alert('Error during daily reset check. Please try again.');
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
    
    // Set up daily reset check
    setupDailyReset();
}

// Set up daily reset functionality
function setupDailyReset() {
    // Check for daily reset every hour
    setInterval(async () => {
        if (userManager && userManager.hasUserId()) {
            await checkAndPerformDailyReset();
        }
    }, 3600000); // Check every hour (3600000 ms)
    
    // Also check on page load
    setTimeout(async () => {
        if (userManager && userManager.hasUserId()) {
            await checkAndPerformDailyReset();
        }
    }, 1000); // Check 1 second after page load
}

// Check if daily reset is needed and perform it
async function checkAndPerformDailyReset() {
    try {
        const currentData = userManager.getData();
        if (!currentData || !currentData.gameData) {
            console.log('No game data available for daily reset check');
            return;
        }
        
        // Use a more reliable date comparison method
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Parse the last reset date more reliably
        let lastResetDate = currentData.lastResetDate;
        let lastResetDateObj = null;
        
        // Try to parse the last reset date
        if (lastResetDate) {
            // If it's already in YYYY-MM-DD format
            if (lastResetDate.includes('-')) {
                lastResetDateObj = new Date(lastResetDate);
            } else {
                // If it's in DD/MM/YYYY format, convert it
                const parts = lastResetDate.split('/');
                if (parts.length === 3) {
                    // Assuming DD/MM/YYYY format
                    lastResetDateObj = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            }
        }
        
        const lastResetString = lastResetDateObj ? lastResetDateObj.toISOString().split('T')[0] : null;

        // Debounce within this browser session
        const sessionKey = `dailyResetChecked:${currentData.userId || localStorage.getItem('playerName') || 'anonymous'}`;
        const sessionChecked = sessionStorage.getItem(sessionKey);
        if (sessionChecked === todayString) {
            console.log('Daily reset already checked this session for today. Skipping.');
            return;
        }
        
        console.log('Daily reset check details:');
        console.log('  Today (Date object):', today);
        console.log('  Today (YYYY-MM-DD):', todayString);
        console.log('  Last reset (original):', lastResetDate);
        console.log('  Last reset (parsed):', lastResetString);
        console.log('  Date comparison:', lastResetString !== todayString);
        
        // If we do not have a stored last reset date, initialize it to today (no reset)
        if (!lastResetString) {
            console.log('No lastResetDate found. Initializing to today without resetting stats.');
            currentData.lastResetDate = todayString;
            userManager.setData('lastResetDate', todayString);
            userManager.lastLoadTime = 0;
            await userManager.saveUserData();
            sessionStorage.setItem(sessionKey, todayString);
            return;
        }

        // If it's a new day, perform the reset
        if (lastResetString !== todayString) {
            console.log('New day detected, performing daily reset...');
            await performDailyReset();
        } else {
            console.log('Same day, no reset needed');
        }

        // Mark as checked for today in this session
        sessionStorage.setItem(sessionKey, todayString);
        
    } catch (error) {
        console.error('Error during daily reset check:', error);
    }
}

// Perform the daily reset
async function performDailyReset() {
    try {
        console.log('Performing daily reset...');
        
        const currentData = userManager.getData();
        const gameData = currentData.gameData;
        
        // Reset HP, MP, stamina, and fatigue to full
        gameData.hp = 100;
        gameData.mp = 100;
        gameData.stm = 100;
        gameData.fatigue = 0;

        // Reset daily quests
        gameData.physicalQuests = "[0/4]";
        gameData.mentalQuests = "[0/3]";
        gameData.spiritualQuests = "[0/2]";

        // Reset quest cost application flags so costs can apply again today
        gameData.questCostsApplied = { physical: false, mental: false, spiritual: false };
        
        // Update the last reset date using reliable YYYY-MM-DD format
        currentData.lastResetDate = new Date().toISOString().split('T')[0];
        
        // Update the UI to reflect the reset
        loadPlayerData(gameData);
        
        // Save the reset data to the database
        await userManager.saveUserData();
        
        console.log('Daily reset completed successfully');
        
        // Show notification to user
        showDailyResetNotification();
        
    } catch (error) {
        console.error('Error performing daily reset:', error);
    }
}

// Show notification for daily reset
function showDailyResetNotification() {
    const notification = document.createElement('div');
    notification.className = 'daily-reset-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            text-align: center;
            animation: slideDown 0.5s ease-out;
        ">
            <div style="font-size: 24px; margin-bottom: 10px;">🌅 Daily Reset Complete!</div>
            <div style="font-size: 16px; opacity: 0.9;">
                HP, MP, Stamina, Fatigue, and Daily Quests have been reset.
            </div>
        </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}
 // Sync the level pills with the main level number
document.addEventListener('DOMContentLoaded', function () {
    var levelEl = document.getElementById('level-number');
    var pillEl1 = document.getElementById('player-level-pill');
    var pillEl2 = document.getElementById('player-level-pill-2');
    
    if (!levelEl) return;

    function syncPills() {
        var levelText = (levelEl.textContent || '').trim();
        if (pillEl1) pillEl1.textContent = levelText;
        if (pillEl2) pillEl2.textContent = levelText;
    }

    // Initial sync
    syncPills();

    // Observe changes to the level element's text
    var observer = new MutationObserver(syncPills);
    observer.observe(levelEl, { characterData: true, childList: true, subtree: true });

    // Also resync on visibility/focus just in case
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') syncPills();
    });
    window.addEventListener('focus', syncPills);
});

