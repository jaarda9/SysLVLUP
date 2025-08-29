// Dental Study Manager - Simplified Core Features
class DentalStudyManager {
    constructor() {
        this.userManager = window.userManager;
        this.currentSession = null;
        this.studyTimer = null;
        this.completedSessions = 0;
        this.timerInterval = null;
        this.customSessions = [];
        this.sessionCompletionStatus = {}; // Track completion status for each session
        
        this.initialize();
    }
    
    async initialize() {
        await this.loadUserData();
        this.setupEventListeners();
        this.updateCheckboxes();
        this.updateCustomSessions();
        this.checkForNewDay();
    }
    
    async loadUserData() {
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                const userData = this.userManager.getData();
                this.completedSessions = userData?.dentalStudyCompleted || 0;
                this.customSessions = userData?.dentalStudyCustomSessions || [];
                this.sessionCompletionStatus = userData?.dentalStudySessionStatus || {};
                return userData;
            } else {
                console.warn('User manager not available, using localStorage fallback');
                return this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            return this.loadFromLocalStorage();
        }
    }
    
    loadFromLocalStorage() {
        const savedData = JSON.parse(localStorage.getItem("gameData")) || {};
        this.completedSessions = parseInt(localStorage.getItem("dentalStudyCompleted")) || 0;
        this.customSessions = JSON.parse(localStorage.getItem("dentalStudyCustomSessions")) || [];
        this.sessionCompletionStatus = JSON.parse(localStorage.getItem("dentalStudySessionStatus")) || {};
        return savedData;
    }
    
    async saveProgress() {
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                await this.userManager.updateUserData({
                    dentalStudyCompleted: this.completedSessions,
                    dentalStudyCustomSessions: this.customSessions,
                    dentalStudySessionStatus: this.sessionCompletionStatus,
                    lastStudySession: new Date().toISOString()
                });
            } else {
                localStorage.setItem("dentalStudyCompleted", this.completedSessions.toString());
                localStorage.setItem("dentalStudyCustomSessions", JSON.stringify(this.customSessions));
                localStorage.setItem("dentalStudySessionStatus", JSON.stringify(this.sessionCompletionStatus));
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            localStorage.setItem("dentalStudyCompleted", this.completedSessions.toString());
            localStorage.setItem("dentalStudyCustomSessions", JSON.stringify(this.customSessions));
            localStorage.setItem("dentalStudySessionStatus", JSON.stringify(this.sessionCompletionStatus));
        }
    }
    
    setupEventListeners() {
        // Session controls
        document.getElementById('start-button')?.addEventListener('click', () => this.startTimer());
        document.getElementById('pause-button')?.addEventListener('click', () => this.pauseTimer());
        document.getElementById('reset-button')?.addEventListener('click', () => this.resetTimer());
        
        // Add session button
        document.getElementById('add-session-button')?.addEventListener('click', () => this.addNewSession());
        
        // Modal close
        document.querySelector('.close')?.addEventListener('click', () => this.closePomodoro());
        
        // Click outside modal to close
        document.getElementById('pomodoro-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'pomodoro-modal') {
                this.closePomodoro();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when modal is open
            const modal = document.getElementById('pomodoro-modal');
            if (modal && modal.style.display === 'block') {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closePomodoro();
                }
                if (e.key === ' ' && this.studyTimer?.isRunning) {
                    e.preventDefault();
                    this.pauseTimer();
                }
                if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.resetTimer();
                }
                if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (this.studyTimer?.isRunning) {
                        this.pauseTimer();
                    } else {
                        this.startTimer();
                    }
                }
            }
        });
    }
    
    updateCheckboxes() {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        
        checkboxes.forEach((checkbox, index) => {
            const sessionName = this.getSessionNameByIndex(index);
            checkbox.checked = this.sessionCompletionStatus[sessionName] || false;
        });
        
        // Update main completion checkbox
        const completeCheckbox = document.getElementById('complete');
        if (completeCheckbox) {
            const totalSessions = this.getTotalSessionCount();
            const completedCount = Object.values(this.sessionCompletionStatus).filter(status => status).length;
            completeCheckbox.checked = completedCount >= 3;
        }
    }
    
    updateCustomSessions() {
        const goalSection = document.getElementById('goal-section');
        if (!goalSection) return;
        
        // Remove existing custom sessions (keep only the 3 default ones)
        const existingCustomSessions = goalSection.querySelectorAll('.goal-item[data-custom="true"]');
        existingCustomSessions.forEach(session => session.remove());
        
        // Add custom sessions back
        this.customSessions.forEach(sessionName => {
            const newGoalItem = document.createElement('div');
            newGoalItem.className = 'goal-item';
            newGoalItem.setAttribute('data-custom', 'true');
            newGoalItem.innerHTML = `
                <span class="task-name">${sessionName}</span>
                <button class="start-button" onclick="dentalStudyManager.openPomodoro('${sessionName}', '${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox')">
                    <i class="fa-solid fa-play"></i>
                </button>
                <input type="checkbox" id="${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox" class="task-checkbox" disabled />
            `;
            goalSection.appendChild(newGoalItem);
        });
        
        // Update checkboxes after adding custom sessions
        this.updateCheckboxes();
    }
    
    getSessionNameByIndex(index) {
        const defaultSessions = [
            'Comprehensive Study Session',
            'Study and Review', 
            'Prepare for Exam'
        ];
        
        if (index < defaultSessions.length) {
            return defaultSessions[index];
        } else {
            const customIndex = index - defaultSessions.length;
            return this.customSessions[customIndex] || '';
        }
    }
    
    getTotalSessionCount() {
        return 3 + this.customSessions.length; // 3 default + custom sessions
    }
    
    checkForNewDay() {
        const currentDate = new Date().toLocaleDateString();
        const lastResetDate = this.userManager?.getData()?.lastDentalStudyReset || 
                            localStorage.getItem("lastDentalStudyReset");
        
        if (!lastResetDate || lastResetDate !== currentDate) {
            this.resetDailyStats();
            if (this.userManager && this.userManager.hasUserId()) {
                this.userManager.setData('lastDentalStudyReset', currentDate);
            } else {
                localStorage.setItem("lastDentalStudyReset", currentDate);
            }
        }
    }
    
    resetDailyStats() {
        this.completedSessions = 0;
        this.sessionCompletionStatus = {};
        this.customSessions = [];
        this.updateCheckboxes();
        this.updateCustomSessions();
    }
    
    openPomodoro(task, checkboxId) {
        document.getElementById('task-title').textContent = task;
        document.getElementById('pomodoro-modal').style.display = 'block';
        
        this.currentSession = {
            topic: task,
            checkboxId: checkboxId,
            startTime: new Date().toISOString()
        };
        
        this.studyTimer = new StudyTimer(10); // Changed to 10 seconds for testing
        this.resetTimer();
        this.updateTimerButtons();
    }
    
    startTimer() {
        if (this.studyTimer && !this.studyTimer.isRunning) {
            this.studyTimer.start();
            this.updateTimerDisplay();
            this.startTimerInterval();
            this.updateTimerButtons();
        }
    }
    
    pauseTimer() {
        if (this.studyTimer && this.studyTimer.isRunning) {
            if (this.studyTimer.isPaused) {
                this.studyTimer.resume();
            } else {
                this.studyTimer.pause();
            }
            this.updateTimerDisplay();
            this.updateTimerButtons();
        }
    }
    
    updateTimerButtons() {
        const startBtn = document.getElementById('start-button');
        const pauseBtn = document.getElementById('pause-button');
        
        if (!startBtn || !pauseBtn) return;
        
        if (this.studyTimer && this.studyTimer.isRunning) {
            if (this.studyTimer.isPaused) {
                startBtn.style.display = 'inline-flex';
                pauseBtn.style.display = 'none';
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
            } else {
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'inline-flex';
            }
        } else {
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        }
    }
    
    resetTimer() {
        if (this.studyTimer) {
            this.studyTimer.reset();
            this.updateTimerDisplay();
            this.updateTimerButtons();
        }
    }
    
    startTimerInterval() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.studyTimer && this.studyTimer.isRunning) {
                this.updateTimerDisplay();
                
                if (this.studyTimer.isComplete()) {
                    this.completeSession();
                }
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay && this.studyTimer) {
            const timeLeft = this.studyTimer.getTimeLeft();
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60);
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }
    
    async completeSession() {
        if (!this.currentSession || !this.studyTimer) return;
        
        clearInterval(this.timerInterval);
        
        // Mark this specific session as completed
        const sessionName = this.currentSession.topic;
        this.sessionCompletionStatus[sessionName] = true;
        
        // Calculate and apply rewards
        const sessionDuration = this.studyTimer.getDuration() - this.studyTimer.getTimeLeft();
        const rewards = this.calculateRewards(sessionDuration);
        await this.applyRewards(rewards);
        
        // Update UI
        this.updateCheckboxes();
        
        // Show completion notification
        const minutes = Math.floor(sessionDuration / 60);
        const seconds = sessionDuration % 60;
        const xpGained = rewards.xp;
        
        this.showNotification(`Session completed! ${minutes}m ${seconds}s | +${xpGained} XP`);
        
        // Check completion (need 3 sessions completed)
        const completedCount = Object.values(this.sessionCompletionStatus).filter(status => status).length;
        if (completedCount >= 3) {
            this.completeDailyQuest();
            this.showNotification('Daily quest completed! 🎉');
        }
        
        // Save progress
        await this.saveProgress();
        
        // Reset timer buttons
        this.updateTimerButtons();
        
        this.closePomodoro();
    }
    
    calculateRewards(sessionDuration) {
        const baseReward = 2 * (sessionDuration / (10 * 60)); // 10 min = base (changed from 50)
        const totalXP = Math.round(baseReward);
        
        return {
            xp: totalXP,
            intelligence: 0.5,
            fatigue: 3,
            mp: -2, // MP cost
            stm: -3  // Stamina cost
        };
    }
    
    async applyRewards(rewards) {
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                const userData = this.userManager.getData();
                const gameData = userData.gameData || {};
                
                // Apply rewards
                gameData.exp = (gameData.exp || 0) + rewards.xp;
                gameData.stackedAttributes = gameData.stackedAttributes || {};
                gameData.stackedAttributes.INT = (gameData.stackedAttributes.INT || 0) + rewards.intelligence;
                gameData.mp = Math.max(0, (gameData.mp || 100) + rewards.mp);
                gameData.stm = Math.max(0, (gameData.stm || 100) + rewards.stm);
                gameData.fatigue = Math.min(100, (gameData.fatigue || 0) + rewards.fatigue);
                
                // Level up check
                let levelUps = 0;
                while (gameData.exp >= 100) {
                    gameData.exp -= 100;
                    gameData.level = (gameData.level || 1) + 1;
                    levelUps++;
                    
                    // Apply stacked attributes
                    if (gameData.Attributes) {
                        for (let key in gameData.stackedAttributes) {
                            if (gameData.Attributes[key] !== undefined) {
                                gameData.Attributes[key] += Math.round(gameData.stackedAttributes[key] * 0.25);
                            }
                        }
                    }
                    
                    // Reset stacked attributes
                    for (let key in gameData.stackedAttributes) {
                        gameData.stackedAttributes[key] = 0;
                    }
                }
                
                this.userManager.setData('gameData', gameData);
                await this.userManager.saveUserData();
                
                // Show level up notification
                if (levelUps > 0) {
                    this.showNotification(`🎉 Level Up! You are now level ${gameData.level}!`, 'info');
                }
                
            } else {
                // Fallback to localStorage
                const savedData = JSON.parse(localStorage.getItem("gameData")) || {};
                savedData.exp = (savedData.exp || 0) + rewards.xp;
                savedData.stackedAttributes = savedData.stackedAttributes || {};
                savedData.stackedAttributes.INT = (savedData.stackedAttributes.INT || 0) + rewards.intelligence;
                savedData.mp = Math.max(0, (savedData.mp || 100) + rewards.mp);
                savedData.stm = Math.max(0, (savedData.stm || 100) + rewards.stm);
                savedData.fatigue = Math.min(100, (savedData.fatigue || 0) + rewards.fatigue);
                
                localStorage.setItem("gameData", JSON.stringify(savedData));
            }
            
        } catch (error) {
            console.error('Error applying rewards:', error);
            this.showNotification('Error saving progress. Please try again.', 'error');
        }
    }
    
    completeDailyQuest() {
        const completeCheckbox = document.getElementById('complete');
        const section = document.getElementById('complete-section');
        
        if (completeCheckbox && section) {
            completeCheckbox.checked = true;
            section.classList.add("animatedd");
            completeCheckbox.classList.add("animatedd");
            this.shakeElement(completeCheckbox);
        }
    }
    
    shakeElement(element) {
        let position = 0;
        const interval = setInterval(() => {
            position = (position + 1) % 4;
            const offset = position % 2 === 0 ? -10 : 10;
            element.style.transform = `translateX(${offset}px)`;
            
            if (position === 0) {
                clearInterval(interval);
                element.style.transform = "translateX(0px)";
            }
        }, 100);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById("notification");
        if (notification) {
            notification.querySelector('p').textContent = message;
            
            // Update notification style based on type
            notification.className = `notification ${type}`;
            notification.classList.remove("hidden");
            notification.classList.add("show");
            
            // Auto-hide after appropriate time
            const duration = type === 'error' ? 5000 : 4000;
            setTimeout(() => {
                notification.classList.remove("show");
                notification.classList.add("hidden");
            }, duration);
        }
    }
    
    closePomodoro() {
        const modal = document.getElementById('pomodoro-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (this.studyTimer) {
            this.studyTimer.reset();
        }
        this.currentSession = null;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    addNewSession() {
        const newSessionInput = document.getElementById('new-session-input');
        const newSessionName = newSessionInput.value.trim();
        
        if (newSessionName) {
            // Check if session already exists
            if (this.customSessions.includes(newSessionName)) {
                this.showNotification('Session already exists!', 'warning');
                return;
            }
            
            // Add to custom sessions array
            this.customSessions.push(newSessionName);
            
            // Create the new goal item
            const goalSection = document.getElementById('goal-section');
            const newGoalItem = document.createElement('div');
            newGoalItem.className = 'goal-item';
            newGoalItem.setAttribute('data-custom', 'true');
            newGoalItem.innerHTML = `
                <span class="task-name">${newSessionName}</span>
                <button class="start-button" onclick="dentalStudyManager.openPomodoro('${newSessionName}', '${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox')">
                    <i class="fa-solid fa-play"></i>
                </button>
                <input type="checkbox" id="${newSessionName.replace(/\s+/g, '-').toLowerCase()}-checkbox" class="task-checkbox" disabled />
            `;
            goalSection.appendChild(newGoalItem);
            newSessionInput.value = '';
            
            // Save to database
            this.saveProgress();
            
            // No notification for session added
        }
    }
}

// Enhanced Timer System
class StudyTimer {
    constructor(duration = 10) {
        this.duration = duration * 60; // Convert to seconds
        this.remaining = this.duration;
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPausedTime = 0;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now();
        }
    }
    
    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.pauseTime = Date.now();
        }
    }
    
    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.totalPausedTime += Date.now() - this.pauseTime;
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.remaining = this.duration;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPausedTime = 0;
    }
    
    getTimeLeft() {
        if (!this.isRunning) return this.remaining;
        
        const currentTime = Date.now();
        const pausedTime = this.isPaused ? currentTime - this.pauseTime : 0;
        const elapsed = (currentTime - this.startTime - this.totalPausedTime - pausedTime) / 1000;
        
        return Math.max(0, this.duration - elapsed);
    }
    
    getDuration() {
        return this.duration;
    }
    
    isComplete() {
        return this.getTimeLeft() <= 0;
    }
}

// Initialize the dental study manager when the page loads
let dentalStudyManager;

document.addEventListener("DOMContentLoaded", function() {
    dentalStudyManager = new DentalStudyManager();
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
});

// Global functions for backward compatibility
function openPomodoro(task, checkboxId) {
    if (dentalStudyManager) {
        dentalStudyManager.openPomodoro(task, checkboxId);
    }
}

function closePomodoro() {
    if (dentalStudyManager) {
        dentalStudyManager.closePomodoro();
    }
}

function startTimer() {
    if (dentalStudyManager) {
        dentalStudyManager.startTimer();
    }
}

function resetTimer() {
    if (dentalStudyManager) {
        dentalStudyManager.resetTimer();
    }
}

function addNewSession() {
    if (dentalStudyManager) {
        dentalStudyManager.addNewSession();
    }
}

