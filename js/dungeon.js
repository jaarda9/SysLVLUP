// Dungeon Labyrinth - Fresh JavaScript

// Dungeon state
let dungeonState = {
    currentWeek: 1,
    completedNodes: new Set(),
    unlockedPaths: new Set(),
    resetTime: null
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dungeon page loaded, initializing...');
    initializeDungeon();
    setupEventListeners();
    startCountdown();
});

// Initialize dungeon
function initializeDungeon() {
    // Load saved state
    const savedState = localStorage.getItem('dungeonState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            dungeonState = { ...dungeonState, ...parsed };
        } catch (e) {
            console.error('Error loading dungeon state:', e);
        }
    }
    
    // Check weekly reset
    checkWeeklyReset();
    
    // Update UI
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    // Add click handlers to all nodes
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.addEventListener('click', handleNodeClick);
    });
}

// Handle node clicks
function handleNodeClick(event) {
    const node = event.currentTarget;
    const nodeId = node.dataset.node;
    
    console.log('Node clicked:', nodeId);
    
    if (isNodeAccessible(nodeId)) {
        showNodeModal(nodeId);
    } else {
        showMessage('This node is locked. Complete previous challenges to unlock it.');
    }
}

// Check if node is accessible
function isNodeAccessible(nodeId) {
    // Start nodes are always accessible
    if (nodeId.startsWith('start-')) {
        return true;
    }
    
    // Check if any path to this node is unlocked
    const paths = document.querySelectorAll(`[data-to="${nodeId}"]`);
    return Array.from(paths).some(path => {
        const fromNode = path.dataset.from;
        return dungeonState.unlockedPaths.has(`${fromNode}-${nodeId}`);
    });
}

// Show node modal
function showNodeModal(nodeId) {
    const modal = document.getElementById('node-modal');
    const modalBody = document.getElementById('modal-body');
    
    let content = '';
    
    if (nodeId.startsWith('start-')) {
        content = generateStartContent(nodeId);
    } else if (nodeId.startsWith('challenge-')) {
        content = generateChallengeContent(nodeId);
    } else if (nodeId.startsWith('boss-')) {
        content = generateBossContent(nodeId);
    } else if (nodeId === 'final-boss') {
        content = generateFinalBossContent();
    }
    
    modalBody.innerHTML = content;
    modal.classList.add('show');
    
    // Setup modal buttons
    setupModalButtons(nodeId);
}

// Generate start node content
function generateStartContent(nodeId) {
    return `
        <h2>🚀 DUNGEON ENTRY</h2>
        <p>Choose your path through the labyrinth. Each route offers different challenges and rewards.</p>
        <div class="path-options">
            <div class="option">
                <h4>Path A: Challenge Route</h4>
                <p>Face multiple challenges for better rewards</p>
                <button class="modal-btn challenge-btn" onclick="startPath('${nodeId}', 'challenge')">
                    Start Challenge Path
                </button>
            </div>
            <div class="option">
                <h4>Path B: Boss Rush</h4>
                <p>Go straight to boss encounters</p>
                <button class="modal-btn boss-btn" onclick="startPath('${nodeId}', 'boss')">
                    Start Boss Path
                </button>
            </div>
        </div>
    `;
}

// Generate challenge node content
function generateChallengeContent(nodeId) {
    const powerLevel = nodeId.split('-')[1];
    return `
        <h2>💎 CHALLENGE NODE</h2>
        <p>Power Level: <span class="power-level">${powerLevel}</span></p>
        <p>Complete this challenge to unlock new paths and earn rewards.</p>
        <div class="requirements">
            <div class="req">
                <i class="fas fa-heart"></i>
                <span>HP Required: 50+</span>
            </div>
            <div class="req">
                <i class="fas fa-bolt"></i>
                <span>STM Required: 30+</span>
            </div>
        </div>
        <button class="modal-btn challenge-btn" onclick="startChallenge('${nodeId}')">
            Begin Challenge
        </button>
    `;
}

// Generate boss node content
function generateBossContent(nodeId) {
    const bossElement = document.querySelector(`[data-node="${nodeId}"] .node-label`);
    const powerLevel = bossElement ? bossElement.textContent : 'Unknown';
    
    return `
        <h2>👹 BOSS ENCOUNTER</h2>
        <p>Power Level: <span class="power-level">${powerLevel}</span></p>
        <p>Face this powerful enemy in combat. Victory unlocks the path to the final boss.</p>
        <div class="requirements">
            <div class="req">
                <i class="fas fa-heart"></i>
                <span>HP Required: 80+</span>
            </div>
            <div class="req">
                <i class="fas fa-flask"></i>
                <span>MP Required: 60+</span>
            </div>
            <div class="req">
                <i class="fas fa-bolt"></i>
                <span>STM Required: 70+</span>
            </div>
        </div>
        <button class="modal-btn boss-btn" onclick="startBossFight('${nodeId}')">
            Engage Boss
        </button>
    `;
}

// Generate final boss content
function generateFinalBossContent() {
    return `
        <h2>👑 FINAL BOSS</h2>
        <p>Power Level: <span class="power-level">50000</span></p>
        <p>The ultimate challenge awaits. Defeat this boss to complete the dungeon and claim your rewards.</p>
        <div class="requirements">
            <div class="req">
                <i class="fas fa-heart"></i>
                <span>HP Required: 100</span>
            </div>
            <div class="req">
                <i class="fas fa-flask"></i>
                <span>MP Required: 100</span>
            </div>
            <div class="req">
                <i class="fas fa-bolt"></i>
                <span>STM Required: 100</span>
            </div>
        </div>
        <button class="modal-btn final-boss-btn" onclick="startFinalBossFight()">
            Face Final Boss
        </button>
    `;
}

// Setup modal buttons
function setupModalButtons(nodeId) {
    // This will be expanded when we implement actual challenge mechanics
    console.log('Modal buttons setup for:', nodeId);
}

// Start path
function startPath(entryNodeId, pathType) {
    console.log(`Starting ${pathType} path from ${entryNodeId}`);
    closeModal();
    showMessage(`Starting ${pathType} path... This feature will be implemented next!`);
}

// Start challenge
function startChallenge(challengeNodeId) {
    console.log('Starting challenge:', challengeNodeId);
    closeModal();
    showMessage('Challenge started! This feature will be implemented next!');
}

// Start boss fight
function startBossFight(bossNodeId) {
    console.log('Starting boss fight:', bossNodeId);
    closeModal();
    showMessage('Boss fight started! This feature will be implemented next!');
}

// Start final boss fight
function startFinalBossFight() {
    console.log('Starting final boss fight');
    closeModal();
    showMessage('Final boss fight started! This feature will be implemented next!');
}

// Show message
function showMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'temp-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 212, 255, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 2000;
        font-weight: bold;
        animation: fadeInOut 3s ease-in-out;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('node-modal');
    modal.classList.remove('show');
}

// Update UI
function updateUI() {
    // Update progress counters
    document.getElementById('nodes-completed').textContent = `${dungeonState.completedNodes.size}/12`;
    document.getElementById('bosses-defeated').textContent = `${Array.from(dungeonState.completedNodes).filter(id => id.startsWith('boss-')).length}/6`;
    
    // Update final boss status
    const finalBossStatus = document.getElementById('final-boss-status');
    if (dungeonState.completedNodes.has('final-boss')) {
        finalBossStatus.textContent = 'Defeated';
        finalBossStatus.style.color = 'var(--primary)';
    } else {
        finalBossStatus.textContent = 'Locked';
        finalBossStatus.style.color = 'var(--text)';
    }
}

// Check weekly reset
function checkWeeklyReset() {
    const now = new Date();
    const lastReset = dungeonState.resetTime ? new Date(dungeonState.resetTime) : null;
    
    if (!lastReset || (now - lastReset) >= 7 * 24 * 60 * 60 * 1000) {
        // Reset dungeon state
        dungeonState.completedNodes.clear();
        dungeonState.unlockedPaths.clear();
        dungeonState.currentWeek++;
        dungeonState.resetTime = now.toISOString();
        
        saveDungeonState();
        console.log('Weekly reset completed. New week:', dungeonState.currentWeek);
    }
}

// Start countdown timer
function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
}

// Update countdown
function updateCountdown() {
    if (!dungeonState.resetTime) return;
    
    const now = new Date();
    const resetTime = new Date(dungeonState.resetTime);
    const nextReset = new Date(resetTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timeLeft = nextReset - now;
    
    if (timeLeft <= 0) {
        document.getElementById('countdown').textContent = 'Resetting...';
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('countdown').textContent = `${days}d ${hours}h ${minutes}m`;
}

// Save dungeon state
function saveDungeonState() {
    try {
        localStorage.setItem('dungeonState', JSON.stringify(dungeonState));
    } catch (e) {
        console.error('Error saving dungeon state:', e);
    }
}

// Add CSS for temporary messages and modal styling
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    .path-options {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 20px 0;
    }
    
    .option {
        padding: 15px;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 8px;
    }
    
    .option h4 {
        color: var(--primary);
        margin-bottom: 8px;
    }
    
    .option p {
        color: var(--text-secondary);
        margin-bottom: 15px;
        font-size: 14px;
    }
    
    .modal-btn {
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .modal-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
    }
    
    .challenge-btn {
        background: linear-gradient(45deg, var(--primary), var(--accent));
    }
    
    .boss-btn {
        background: linear-gradient(45deg, var(--danger), var(--warning));
    }
    
    .final-boss-btn {
        background: linear-gradient(45deg, var(--secondary), var(--danger));
    }
    
    .power-level {
        color: var(--warning);
        font-weight: bold;
        font-size: 1.2em;
    }
    
    .requirements {
        margin: 20px 0;
    }
    
    .req {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
    }
    
    .req i {
        color: var(--warning);
        width: 20px;
    }
`;
document.head.appendChild(style);
