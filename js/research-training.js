// Global variables
let userManager = null;

// Research Training Manager - AI-Powered Learning System
class ResearchTrainingManager {
    constructor() {
        this.userManager = window.userManager;
        this.currentTopic = null;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizTimer = null;
        this.timeLeft = 180; // 3 minutes
        this.isQuizActive = false;
        this.quizResults = null;
    }
    
    async initialize() {
        await this.loadUserData();
        this.setupEventListeners();
        this.updateProgressDisplay();
        this.checkForNewDay();
        await this.loadDailyTopic();
    }
    
    async loadUserData() {
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                const userData = this.userManager.getData();
                this.researchData = userData?.researchTrainingData || this.getDefaultResearchData();
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
        this.researchData = JSON.parse(localStorage.getItem("researchTrainingData")) || this.getDefaultResearchData();
        return savedData;
    }
    
    getDefaultResearchData() {
        return {
            currentTopic: null,
            quizData: null,
            userProgress: {
                score: 0,
                streak: 0,
                totalQuizzes: 0,
                lastQuizDate: null
            },
            lastTopicDate: null
        };
    }
    
    async saveProgress() {
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                await this.userManager.updateUserData({
                    researchTrainingData: this.researchData
                });
            } else {
                localStorage.setItem("researchTrainingData", JSON.stringify(this.researchData));
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            localStorage.setItem("researchTrainingData", JSON.stringify(this.researchData));
        }
    }
    
    setupEventListeners() {
        // Quiz controls
        document.getElementById('start-quiz-btn')?.addEventListener('click', () => this.startQuiz());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousQuestion());
        document.getElementById('submit-btn')?.addEventListener('click', () => this.submitQuiz());
        document.getElementById('retry-btn')?.addEventListener('click', () => this.retryQuiz());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isQuizActive) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    this.nextQuestion();
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousQuestion();
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
                        this.submitQuiz();
                    } else {
                        this.nextQuestion();
                    }
                }
            }
        });
    }
    
    updateProgressDisplay() {
        const progress = this.researchData.userProgress;
        document.getElementById('streak-value').textContent = progress.streak || 0;
        document.getElementById('total-score').textContent = progress.score || 0;
        document.getElementById('quizzes-taken').textContent = progress.totalQuizzes || 0;
    }
    
    checkForNewDay() {
        const currentDate = new Date().toLocaleDateString();
        const lastTopicDate = this.researchData.lastTopicDate;
        
        if (!lastTopicDate || lastTopicDate !== currentDate) {
            // New day - reset topic and quiz
            this.researchData.currentTopic = null;
            this.researchData.quizData = null;
            this.saveProgress();
        }
    }
    
    async loadDailyTopic() {
        const topicContent = document.getElementById('topic-content');
        
        if (this.researchData.currentTopic) {
            // Topic already exists for today
            this.displayTopic(this.researchData.currentTopic);
            return;
        }
        
        // Show loading spinner
        topicContent.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Generating today's topic...</p>
            </div>
        `;
        
        try {
            // Try to use local server for Gemini API
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocalhost ? '/api/gemini?action=generate-topic' : 'http://localhost:3000/api/gemini?action=generate-topic';
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.topic) {
                this.researchData.currentTopic = data.topic;
                this.researchData.lastTopicDate = new Date().toLocaleDateString();
                this.displayTopic(data.topic);
                await this.saveProgress();
            } else {
                throw new Error(data.error || 'Failed to generate topic');
            }
        } catch (error) {
            console.error('Error generating topic:', error);
            console.log('Using fallback topic system');
            
            // Enhanced fallback system with multiple topics
            const fallbackTopics = [
                {
                    category: "Humanities",
                    title: "Ancient Egyptian Architecture",
                    description: "Explore the magnificent pyramids, temples, and monuments of ancient Egypt. Learn about the construction techniques, religious significance, and cultural impact of these architectural marvels.",
                    difficulty: "Intermediate"
                },
                {
                    category: "Science and Technology",
                    title: "Quantum Computing Fundamentals",
                    description: "Discover the principles behind quantum computing, including qubits, superposition, and quantum entanglement. Learn how this revolutionary technology could transform computing.",
                    difficulty: "Advanced"
                },
                {
                    category: "Social Sciences",
                    title: "The Psychology of Decision Making",
                    description: "Explore how humans make decisions, from cognitive biases to rational choice theory. Understand the psychological factors that influence our choices.",
                    difficulty: "Intermediate"
                },
                {
                    category: "Current Events",
                    title: "Global Climate Change Solutions",
                    description: "Examine innovative approaches to addressing climate change, from renewable energy technologies to sustainable urban planning and international cooperation.",
                    difficulty: "Intermediate"
                }
            ];
            
            // Select a random fallback topic
            const randomIndex = Math.floor(Math.random() * fallbackTopics.length);
            const fallbackTopic = fallbackTopics[randomIndex];
            
            this.researchData.currentTopic = fallbackTopic;
            this.researchData.lastTopicDate = new Date().toLocaleDateString();
            this.displayTopic(fallbackTopic);
            await this.saveProgress();
        }
    }
    
    displayTopic(topic) {
        const topicContent = document.getElementById('topic-content');
        const startQuizBtn = document.getElementById('start-quiz-btn');
        
        topicContent.innerHTML = `
            <div class="topic-title">${topic.title}</div>
            <div class="topic-description">${topic.description}</div>
            <div class="topic-category">${topic.category} • ${topic.difficulty}</div>
        `;
        
        startQuizBtn.style.display = 'inline-flex';
    }
    
    async startQuiz() {
        if (this.researchData.quizData) {
            // Quiz already exists
            this.currentQuiz = this.researchData.quizData;
        } else {
            // Generate new quiz
            await this.generateQuiz();
        }
        
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.length).fill(null);
        this.timeLeft = 180;
        this.isQuizActive = true;
        
        this.showQuizInterface();
        this.displayQuestion();
        this.startTimer();
    }
    
    async generateQuiz() {
        const startQuizBtn = document.getElementById('start-quiz-btn');
        startQuizBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Quiz...';
        startQuizBtn.disabled = true;
        
        try {
            // Try to use local server for Gemini API
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isLocalhost ? '/api/gemini' : 'http://localhost:3000/api/gemini';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'generate-quiz',
                    topic: this.researchData.currentTopic
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.quiz && data.quiz.length > 0) {
                this.currentQuiz = data.quiz;
                this.researchData.quizData = data.quiz;
                await this.saveProgress();
            } else {
                throw new Error(data.error || 'Failed to generate quiz');
            }
        } catch (error) {
            console.error('Error generating quiz:', error);
            console.log('Using fallback quiz system');
            
            // Enhanced fallback quiz system
            const fallbackQuizzes = {
                "Ancient Egyptian Architecture": [
                    {
                        question: "What is the most famous architectural structure of ancient Egypt?",
                        type: "multiple_choice",
                        options: ["The Great Pyramid of Giza", "The Sphinx", "The Temple of Karnak", "The Valley of the Kings"],
                        correctAnswer: "The Great Pyramid of Giza",
                        explanation: "The Great Pyramid of Giza is the most iconic and famous structure of ancient Egypt."
                    },
                    {
                        question: "What material was primarily used to build the pyramids?",
                        type: "multiple_choice",
                        options: ["Limestone", "Granite", "Sandstone", "Marble"],
                        correctAnswer: "Limestone",
                        explanation: "Limestone was the primary building material used for the pyramids."
                    },
                    {
                        question: "The pyramids were built as tombs for pharaohs.",
                        type: "true_false",
                        options: ["True", "False"],
                        correctAnswer: "True",
                        explanation: "The pyramids were indeed built as elaborate tombs for Egyptian pharaohs."
                    }
                ],
                "Quantum Computing Fundamentals": [
                    {
                        question: "What is a qubit in quantum computing?",
                        type: "multiple_choice",
                        options: ["A quantum bit", "A classical bit", "A computer processor", "A memory unit"],
                        correctAnswer: "A quantum bit",
                        explanation: "A qubit is the quantum equivalent of a classical bit in computing."
                    },
                    {
                        question: "Quantum computers can exist in multiple states simultaneously.",
                        type: "true_false",
                        options: ["True", "False"],
                        correctAnswer: "True",
                        explanation: "This is called superposition, a fundamental principle of quantum computing."
                    }
                ],
                "The Psychology of Decision Making": [
                    {
                        question: "What is cognitive bias?",
                        type: "multiple_choice",
                        options: ["A systematic error in thinking", "A type of memory", "A learning technique", "A personality trait"],
                        correctAnswer: "A systematic error in thinking",
                        explanation: "Cognitive bias refers to systematic errors in thinking that affect decision making."
                    },
                    {
                        question: "Humans always make rational decisions.",
                        type: "true_false",
                        options: ["True", "False"],
                        correctAnswer: "False",
                        explanation: "Humans often make decisions based on emotions and biases, not pure rationality."
                    }
                ],
                "Global Climate Change Solutions": [
                    {
                        question: "Which renewable energy source is most widely used globally?",
                        type: "multiple_choice",
                        options: ["Solar power", "Wind power", "Hydropower", "Geothermal energy"],
                        correctAnswer: "Hydropower",
                        explanation: "Hydropower is currently the most widely used renewable energy source globally."
                    },
                    {
                        question: "Individual actions cannot help combat climate change.",
                        type: "true_false",
                        options: ["True", "False"],
                        correctAnswer: "False",
                        explanation: "Individual actions, when combined, can have a significant impact on climate change."
                    }
                ]
            };
            
            // Get fallback quiz based on topic title
            const topicTitle = this.researchData.currentTopic.title;
            const fallbackQuiz = fallbackQuizzes[topicTitle] || fallbackQuizzes["Ancient Egyptian Architecture"];
            
            this.currentQuiz = fallbackQuiz;
        }
        
        startQuizBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Quiz';
        startQuizBtn.disabled = false;
    }
    
    showQuizInterface() {
        document.getElementById('topic-section').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'none';
    }
    
    displayQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const questionContainer = document.getElementById('question-container');
        const questionCounter = document.getElementById('question-counter');
        const progressFill = document.getElementById('progress-fill');
        
        questionCounter.textContent = `Question ${this.currentQuestionIndex + 1}/${this.currentQuiz.length}`;
        progressFill.style.width = `${((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100}%`;
        
        let optionsHTML = '';
        if (question.type === 'multiple_choice') {
            question.options.forEach((option, index) => {
                const isSelected = this.userAnswers[this.currentQuestionIndex] === option;
                optionsHTML += `
                    <div class="answer-option ${isSelected ? 'selected' : ''}" onclick="researchTrainingManager.selectAnswer('${option}')">
                        <input type="radio" name="q${this.currentQuestionIndex}" value="${option}" ${isSelected ? 'checked' : ''}>
                        <label>${option}</label>
                    </div>
                `;
            });
        } else if (question.type === 'true_false') {
            question.options.forEach((option, index) => {
                const isSelected = this.userAnswers[this.currentQuestionIndex] === option;
                optionsHTML += `
                    <div class="answer-option ${isSelected ? 'selected' : ''}" onclick="researchTrainingManager.selectAnswer('${option}')">
                        <input type="radio" name="q${this.currentQuestionIndex}" value="${option}" ${isSelected ? 'checked' : ''}>
                        <label>${option}</label>
                    </div>
                `;
            });
        }
        
        questionContainer.innerHTML = `
            <div class="question-type">${question.type.replace('_', ' ').toUpperCase()}</div>
            <div class="question-text">${question.question}</div>
            <div class="answer-options">
                ${optionsHTML}
            </div>
        `;
        
        this.updateQuizControls();
    }
    
    selectAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        
        // Update visual selection
        const options = document.querySelectorAll('.answer-option');
        options.forEach(option => {
            option.classList.remove('selected');
            const radio = option.querySelector('input[type="radio"]');
            if (radio && radio.value === answer) {
                option.classList.add('selected');
                radio.checked = true;
            }
        });
        
        this.updateQuizControls();
    }
    
    updateQuizControls() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.style.display = this.currentQuestionIndex > 0 ? 'inline-flex' : 'none';
        nextBtn.style.display = this.currentQuestionIndex < this.currentQuiz.length - 1 ? 'inline-flex' : 'none';
        submitBtn.style.display = this.currentQuestionIndex === this.currentQuiz.length - 1 ? 'inline-flex' : 'none';
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }
    
    startTimer() {
        this.updateTimerDisplay();
        this.quizTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timeDisplay = document.getElementById('time-left');
        const timerElement = document.getElementById('timer');
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Update timer color based on time remaining
        timerElement.className = 'timer';
        if (this.timeLeft <= 30) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 60) {
            timerElement.classList.add('warning');
        }
    }
    
    async submitQuiz() {
        clearInterval(this.quizTimer);
        this.isQuizActive = false;
        
        // Calculate results
        let correctAnswers = 0;
        const results = [];
        
        this.currentQuiz.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            
            results.push({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });
        
        const score = Math.round((correctAnswers / this.currentQuiz.length) * 100);
        this.quizResults = { score, correctAnswers, totalQuestions: this.currentQuiz.length, results };
        
        // Update progress
        this.updateProgress(score);
        
        // Show results
        this.showResults();
        
        // Save progress
        await this.saveProgress();
    }
    
    updateProgress(score) {
        const progress = this.researchData.userProgress;
        const currentDate = new Date().toLocaleDateString();
        
        progress.score += score;
        progress.totalQuizzes++;
        
        // Update streak
        if (progress.lastQuizDate === currentDate) {
            // Already completed today
        } else if (progress.lastQuizDate === this.getYesterdayDate()) {
            // Consecutive day
            progress.streak++;
        } else {
            // Break in streak
            progress.streak = 1;
        }
        
        progress.lastQuizDate = currentDate;
        this.updateProgressDisplay();
    }
    
    getYesterdayDate() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toLocaleDateString();
    }
    
    showResults() {
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';
        
        const scoreDisplay = document.getElementById('score-display');
        const answersReview = document.getElementById('answers-review');
        
        // Display score
        scoreDisplay.innerHTML = `
            <div class="score-value">${this.quizResults.score}%</div>
            <div class="score-text">You got ${this.quizResults.correctAnswers} out of ${this.quizResults.totalQuestions} questions correct!</div>
            <div class="score-breakdown">
                <div class="score-item">
                    <div class="value">${this.quizResults.correctAnswers}</div>
                    <div class="label">Correct</div>
                </div>
                <div class="score-item">
                    <div class="value">${this.quizResults.totalQuestions - this.quizResults.correctAnswers}</div>
                    <div class="label">Incorrect</div>
                </div>
                <div class="score-item">
                    <div class="value">${this.researchData.userProgress.streak}</div>
                    <div class="label">Day Streak</div>
                </div>
            </div>
        `;
        
        // Display answer review
        let reviewHTML = '';
        this.quizResults.results.forEach((result, index) => {
            reviewHTML += `
                <div class="review-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-question">${index + 1}. ${result.question}</div>
                    <div class="review-answer">Your answer: ${result.userAnswer || 'No answer'}</div>
                    ${!result.isCorrect ? `<div class="review-correct">Correct: ${result.correctAnswer}</div>` : ''}
                    <div class="review-correct">${result.explanation}</div>
                </div>
            `;
        });
        answersReview.innerHTML = reviewHTML;
        
        // Apply rewards
        this.applyRewards();
        
        // Check completion
        if (this.quizResults.score >= 60) {
            this.completeDailyQuest();
        }
    }
    
    applyRewards() {
        const rewards = {
            xp: this.quizResults.score * 2, // 2 XP per percentage point
            intelligence: this.quizResults.score / 20, // 0.05 INT per percentage point
            fatigue: 5, // Small fatigue cost
            mp: -3, // MP cost
            stm: -2  // Stamina cost
        };
        
        this.showNotification(`Quiz completed! +${rewards.xp} XP, +${rewards.intelligence.toFixed(1)} INT`);
        
        // Apply to game data (same pattern as dental study)
        try {
            if (this.userManager && this.userManager.hasUserId()) {
                const userData = this.userManager.getData();
                const gameData = userData.gameData || {};
                
                gameData.exp = (gameData.exp || 0) + rewards.xp;
                gameData.stackedAttributes = gameData.stackedAttributes || {};
                gameData.stackedAttributes.INT = (gameData.stackedAttributes.INT || 0) + rewards.intelligence;
                gameData.mp = Math.max(0, (gameData.mp || 100) + rewards.mp);
                gameData.stm = Math.max(0, (gameData.stm || 100) + rewards.stm);
                gameData.fatigue = Math.min(100, (gameData.fatigue || 0) + rewards.fatigue);
                
                this.userManager.setData('gameData', gameData);
                this.userManager.saveUserData();
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
        }
    }
    
    completeDailyQuest() {
        const completeCheckbox = document.getElementById('complete');
        const section = document.getElementById('complete-section');
        
        if (completeCheckbox && section) {
            completeCheckbox.checked = true;
            section.classList.add("animatedd");
            completeCheckbox.classList.add("animatedd");
        }
    }
    
    retryQuiz() {
        // Reset quiz data for tomorrow
        this.researchData.quizData = null;
        this.saveProgress();
        
        // Show topic section again
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('topic-section').style.display = 'block';
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById("notification");
        if (notification) {
            notification.querySelector('p').textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.remove("hidden");
            notification.classList.add("show");
            
            setTimeout(() => {
                notification.classList.remove("show");
                notification.classList.add("hidden");
            }, 4000);
        }
    }
}

// Initialize the research training manager when the page loads
let researchTrainingManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Research Training page loaded, initializing...');
    
    // Create user manager instance (same pattern as status.js)
    userManager = new UserManager();
    window.userManager = userManager;
    
    // Check if player already has a name set
    const existingPlayerName = localStorage.getItem('playerName');
    
    if (existingPlayerName) {
        console.log('Existing player found:', existingPlayerName);
        // Player has a name, try to load their data
        await loadExistingPlayerData(existingPlayerName);
    } else {
        console.log('No existing player name found');
        // For now, just initialize with fallback data
        researchTrainingManager = new ResearchTrainingManager();
        await researchTrainingManager.initialize();
    }
    
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

// Load existing player data (same pattern as status.js)
async function loadExistingPlayerData(playerName) {
    try {
        // Set the user ID (player name) in user manager and check if data exists
        const result = await userManager.setUserId(playerName);
        
        console.log('Result from setUserId:', result);
        
        if (result.dataFound) {
            console.log('Loading existing player data for:', playerName);
            // Player exists, load their data
            const existingData = userManager.getData();
            console.log('Existing data retrieved:', existingData);
        } else {
            console.log('Creating new player data for:', playerName);
            // New player, create initial data
            const initialData = userManager.createInitialData(playerName);
            
            // Save to MongoDB
            await userManager.saveUserData();
            console.log('Initial data saved for new player');
        }
        
        // Initialize research training manager
        researchTrainingManager = new ResearchTrainingManager();
        await researchTrainingManager.initialize();
        
    } catch (error) {
        console.error('Error loading existing player data:', error);
        // Fallback: initialize with basic data
        researchTrainingManager = new ResearchTrainingManager();
        await researchTrainingManager.initialize();
    }
}

// Global functions for backward compatibility
function selectAnswer(answer) {
    if (researchTrainingManager) {
        researchTrainingManager.selectAnswer(answer);
    }
}

// Sync to database function (same pattern as other pages)
async function syncToDatabase() {
    if (window.userManager) {
        try {
            await window.userManager.saveUserData();
            console.log('Sync successful via user manager');
            return { success: true, message: 'Data synced successfully' };
        } catch (error) {
            console.error('Error syncing to database:', error);
            throw error;
        }
    } else {
        console.warn('User manager not available for syncing');
        return { success: false, message: 'User manager not available' };
    }
}
