/**
 * Aura Focus - Pomodoro Timer Application
 * A minimalist, theme-adaptive productivity timer
 */

// ===== Configuration =====
const DEFAULT_SETTINGS = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    soundVolume: 50,
    theme: 'dark'
};

// Motivational Quotes
const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "It's not about having time, it's about making time.", author: "Unknown" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" }
];

// ===== Application State =====
class AuraFocus {
    constructor() {
        this.settings = this.loadSettings();
        this.currentSession = 'focus';
        this.sessionCount = 1;
        this.timeRemaining = this.settings.focusDuration * 60;
        this.totalTime = this.timeRemaining;
        this.isRunning = false;
        this.timerInterval = null;
        this.isZenMode = false;
        
        // Stats
        this.stats = this.loadStats();
        this.tasks = this.loadTasks();
        
        // Audio context for sound alerts
        this.audioContext = null;
        
        this.init();
    }

    // ===== Initialization =====
    init() {
        this.cacheElements();
        this.bindEvents();
        this.applyTheme(this.settings.theme);
        this.updateDisplay();
        this.renderTasks();
        this.updateStats();
        this.showRandomQuote();
        this.updateThemeOptions();
    }

    cacheElements() {
        // Timer elements
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerProgress = document.getElementById('timerProgress');
        this.timerLabel = document.getElementById('timerLabel');
        this.sessionCounter = document.getElementById('sessionCount');
        this.zenTimer = document.getElementById('zenTimer');
        
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.zenBtn = document.getElementById('zenBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettings = document.getElementById('closeSettings');
        this.zenExitBtn = document.getElementById('zenExitBtn');
        this.resetDataBtn = document.getElementById('resetDataBtn');
        
        // Session tabs
        this.sessionTabs = document.querySelectorAll('.session-tab');
        
        // Overlays
        this.settingsModal = document.getElementById('settingsModal');
        this.zenOverlay = document.getElementById('zenOverlay');
        
        // Settings inputs
        this.focusDurationInput = document.getElementById('focusDuration');
        this.shortBreakDurationInput = document.getElementById('shortBreakDuration');
        this.longBreakDurationInput = document.getElementById('longBreakDuration');
        this.sessionsUntilLongBreakInput = document.getElementById('sessionsUntilLongBreak');
        this.soundEnabledInput = document.getElementById('soundEnabled');
        this.soundVolumeInput = document.getElementById('soundVolume');
        
        // Theme options
        this.themeOptions = document.querySelectorAll('.theme-option');
        
        // Tasks
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.tasksCount = document.getElementById('tasksCount');
        
        // Stats
        this.focusTimeDisplay = document.getElementById('focusTime');
        this.completedSessionsDisplay = document.getElementById('completedSessions');
        this.completedTasksDisplay = document.getElementById('completedTasks');
        
        // Quote
        this.quoteElement = document.getElementById('quote');
    }

    bindEvents() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.zenBtn.addEventListener('click', () => this.toggleZenMode());
        this.zenExitBtn.addEventListener('click', () => this.toggleZenMode());
        
        // Session tabs
        this.sessionTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchSession(tab.dataset.session));
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });
        
        // Settings inputs
        this.focusDurationInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakDurationInput.addEventListener('change', () => this.updateSettings());
        this.longBreakDurationInput.addEventListener('change', () => this.updateSettings());
        this.sessionsUntilLongBreakInput.addEventListener('change', () => this.updateSettings());
        this.soundEnabledInput.addEventListener('change', () => this.updateSettings());
        this.soundVolumeInput.addEventListener('input', () => this.updateSettings());
        
        // Theme options
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.setTheme(option.dataset.theme));
        });
        
        // Reset data
        this.resetDataBtn.addEventListener('click', () => this.resetAllData());
        
        // Tasks
        this.taskForm.addEventListener('submit', (e) => this.addTask(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Visibility change (pause when tab is hidden for accuracy)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    // ===== Timer Functions =====
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.startBtn.classList.add('running');
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.startBtn.classList.remove('running');
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.pauseTimer();
        this.timeRemaining = this.getSessionDuration() * 60;
        this.totalTime = this.timeRemaining;
        this.updateDisplay();
    }

    completeSession() {
        this.pauseTimer();
        this.playSound();
        
        // Update stats for focus sessions
        if (this.currentSession === 'focus') {
            this.stats.focusMinutes += this.settings.focusDuration;
            this.stats.completedSessions++;
            
            // Determine next session
            if (this.sessionCount >= this.settings.sessionsUntilLongBreak) {
                this.sessionCount = 1;
                this.switchSession('long-break');
            } else {
                this.sessionCount++;
                this.switchSession('short-break');
            }
        } else {
            // After break, go back to focus
            this.switchSession('focus');
        }
        
        this.saveStats();
        this.updateStats();
        this.showRandomQuote();
        
        // Show notification
        this.showNotification();
    }

    switchSession(session) {
        this.currentSession = session;
        this.pauseTimer();
        
        // Update tabs
        this.sessionTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.session === session);
        });
        
        // Update timer
        this.timeRemaining = this.getSessionDuration() * 60;
        this.totalTime = this.timeRemaining;
        this.updateDisplay();
        
        // Update label
        const labels = {
            'focus': 'Focus Time',
            'short-break': 'Short Break',
            'long-break': 'Long Break'
        };
        this.timerLabel.textContent = labels[session];
        
        // Update progress ring color
        const colors = {
            'focus': 'var(--accent-primary)',
            'short-break': 'var(--accent-secondary)',
            'long-break': 'var(--accent-tertiary)'
        };
        this.timerProgress.style.stroke = colors[session];
    }

    getSessionDuration() {
        switch (this.currentSession) {
            case 'focus': return this.settings.focusDuration;
            case 'short-break': return this.settings.shortBreakDuration;
            case 'long-break': return this.settings.longBreakDuration;
            default: return this.settings.focusDuration;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timerDisplay.textContent = timeString;
        this.zenTimer.textContent = timeString;
        
        // Update progress ring
        const circumference = 2 * Math.PI * 90; // radius is 90
        const progress = this.timeRemaining / this.totalTime;
        const offset = circumference * (1 - progress);
        this.timerProgress.style.strokeDashoffset = offset;
        
        // Update session counter
        this.sessionCounter.textContent = `Session ${this.sessionCount} of ${this.settings.sessionsUntilLongBreak}`;
        
        // Update page title
        document.title = this.isRunning ? `${timeString} - Aura Focus` : 'Aura Focus - Pomodoro Timer';
    }

    // ===== Zen Mode =====
    toggleZenMode() {
        this.isZenMode = !this.isZenMode;
        this.zenOverlay.classList.toggle('active', this.isZenMode);
        
        if (this.isZenMode) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // ===== Sound =====
    playSound() {
        if (!this.settings.soundEnabled) return;
        
        // Create audio context lazily (requires user interaction first)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const volume = this.settings.soundVolume / 100;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Bell-like sound
        oscillator.frequency.setValueAtTime(830, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
        
        // Second tone
        setTimeout(() => {
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            
            osc2.frequency.setValueAtTime(1046, this.audioContext.currentTime);
            osc2.type = 'sine';
            
            gain2.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            osc2.start(this.audioContext.currentTime);
            osc2.stop(this.audioContext.currentTime + 0.8);
        }, 200);
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const messages = {
                'focus': 'Focus session complete! Time for a break.',
                'short-break': 'Break is over! Ready to focus?',
                'long-break': 'Long break is over! Let\'s get back to work!'
            };
            
            new Notification('Aura Focus', {
                body: messages[this.currentSession] || 'Session complete!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="%23ff6b6b" stroke-width="2" fill="none"/><circle cx="16" cy="16" r="4" fill="%23ff6b6b"/></svg>'
            });
        }
    }

    // ===== Theme =====
    toggleTheme() {
        const themes = ['light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }

    setTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme(theme);
        this.saveSettings();
        this.updateThemeOptions();
    }

    applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
    }

    updateThemeOptions() {
        this.themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.settings.theme);
        });
    }

    // ===== Settings =====
    openSettings() {
        this.settingsModal.classList.add('active');
        this.populateSettings();
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    populateSettings() {
        this.focusDurationInput.value = this.settings.focusDuration;
        this.shortBreakDurationInput.value = this.settings.shortBreakDuration;
        this.longBreakDurationInput.value = this.settings.longBreakDuration;
        this.sessionsUntilLongBreakInput.value = this.settings.sessionsUntilLongBreak;
        this.soundEnabledInput.checked = this.settings.soundEnabled;
        this.soundVolumeInput.value = this.settings.soundVolume;
    }

    updateSettings() {
        this.settings.focusDuration = parseInt(this.focusDurationInput.value) || DEFAULT_SETTINGS.focusDuration;
        this.settings.shortBreakDuration = parseInt(this.shortBreakDurationInput.value) || DEFAULT_SETTINGS.shortBreakDuration;
        this.settings.longBreakDuration = parseInt(this.longBreakDurationInput.value) || DEFAULT_SETTINGS.longBreakDuration;
        this.settings.sessionsUntilLongBreak = parseInt(this.sessionsUntilLongBreakInput.value) || DEFAULT_SETTINGS.sessionsUntilLongBreak;
        this.settings.soundEnabled = this.soundEnabledInput.checked;
        this.settings.soundVolume = parseInt(this.soundVolumeInput.value);
        
        this.saveSettings();
        
        // Update timer if not running
        if (!this.isRunning) {
            this.timeRemaining = this.getSessionDuration() * 60;
            this.totalTime = this.timeRemaining;
            this.updateDisplay();
        }
    }

    // ===== Tasks =====
    addTask(e) {
        e.preventDefault();
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.taskInput.value = '';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            
            // Update stats based on toggle direction
            if (task.completed && !wasCompleted) {
                this.stats.completedTasks++;
            } else if (!task.completed && wasCompleted) {
                this.stats.completedTasks = Math.max(0, this.stats.completedTasks - 1);
            }
            
            this.saveStats();
            this.updateStats();
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" data-id="${task.id}" aria-label="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            // Add event listeners
            li.querySelector('.task-checkbox').addEventListener('click', () => this.toggleTask(task.id));
            li.querySelector('.task-delete').addEventListener('click', () => this.deleteTask(task.id));
            
            this.taskList.appendChild(li);
        });
        
        // Update count
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        this.tasksCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Stats =====
    updateStats() {
        const hours = Math.floor(this.stats.focusMinutes / 60);
        const mins = this.stats.focusMinutes % 60;
        
        if (hours > 0) {
            this.focusTimeDisplay.textContent = `${hours}h ${mins}m`;
        } else {
            this.focusTimeDisplay.textContent = `${mins}m`;
        }
        
        this.completedSessionsDisplay.textContent = this.stats.completedSessions;
        this.completedTasksDisplay.textContent = this.stats.completedTasks;
    }

    // ===== Quotes =====
    showRandomQuote() {
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        this.quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <cite class="quote-author">— ${quote.author}</cite>
        `;
        
        // Add fade animation
        this.quoteElement.style.animation = 'none';
        void this.quoteElement.offsetHeight; // Trigger reflow
        this.quoteElement.style.animation = 'fadeIn 0.5s ease';
    }

    // ===== Keyboard Shortcuts =====
    handleKeyboard(e) {
        // Don't trigger shortcuts when typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.toggleTimer();
                break;
            case 'KeyR':
                this.resetTimer();
                break;
            case 'KeyZ':
                this.toggleZenMode();
                break;
            case 'Escape':
                if (this.isZenMode) this.toggleZenMode();
                if (this.settingsModal.classList.contains('active')) this.closeSettingsModal();
                break;
        }
    }

    handleVisibilityChange() {
        // Timer continues in background, but we could pause if needed
        // Currently keeping timer running for accuracy
    }

    // ===== Data Persistence =====
    loadSettings() {
        try {
            const saved = localStorage.getItem('auraFocus_settings');
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('auraFocus_settings', JSON.stringify(this.settings));
        } catch {
            console.warn('Could not save settings to localStorage');
        }
    }

    loadStats() {
        try {
            const today = new Date().toDateString();
            const saved = localStorage.getItem('auraFocus_stats');
            const stats = saved ? JSON.parse(saved) : null;
            
            // Reset stats if it's a new day
            if (!stats || stats.date !== today) {
                return {
                    date: today,
                    focusMinutes: 0,
                    completedSessions: 0,
                    completedTasks: 0
                };
            }
            
            return stats;
        } catch {
            return {
                date: new Date().toDateString(),
                focusMinutes: 0,
                completedSessions: 0,
                completedTasks: 0
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('auraFocus_stats', JSON.stringify(this.stats));
        } catch {
            console.warn('Could not save stats to localStorage');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('auraFocus_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('auraFocus_tasks', JSON.stringify(this.tasks));
        } catch {
            console.warn('Could not save tasks to localStorage');
        }
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('auraFocus_settings');
            localStorage.removeItem('auraFocus_stats');
            localStorage.removeItem('auraFocus_tasks');
            
            // Reload the page to reset everything
            window.location.reload();
        }
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Initialize the app
    window.auraFocus = new AuraFocus();
});
