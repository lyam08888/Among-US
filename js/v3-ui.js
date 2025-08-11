// Among Us V3 - UI System
class AmongUsV3UI {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // UI state
        this.currentScreen = 'main-menu';
        this.isVisible = true;
        this.animations = new Map();
        
        // UI elements
        this.elements = new Map();
        this.overlays = new Map();
        this.notifications = [];
        
        // Game UI state
        this.gameUI = {
            taskList: null,
            minimap: null,
            playerList: null,
            chatBox: null,
            emergencyButton: null,
            useButton: null,
            killButton: null,
            sabotageButton: null,
            reportButton: null
        };
        
        // Settings
        this.settings = {
            showFPS: false,
            showPing: true,
            chatEnabled: true,
            quickChatOnly: false,
            colorBlindSupport: false,
            fontSize: 'medium',
            uiScale: 1.0
        };
        
        console.log('🎨 UI system created');
    }
    
    async initialize() {
        try {
            // Initialize UI elements
            this.initializeElements();
            this.setupEventHandlers();
            this.setupAnimations();
            
            // Load UI settings
            this.loadSettings();
            
            this.isInitialized = true;
            console.log('🎨 UI system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize UI:', error);
        }
    }
    
    initializeElements() {
        // Get main UI elements
        this.elements.set('app', document.getElementById('app'));
        this.elements.set('loading-screen', document.getElementById('loading-screen'));
        this.elements.set('main-menu', document.getElementById('main-menu-v3'));
        this.elements.set('game-screen', document.getElementById('game-screen'));
        
        // Game UI elements
        this.gameUI.taskList = document.getElementById('task-list');
        this.gameUI.minimap = document.getElementById('minimap');
        this.gameUI.playerList = document.getElementById('player-list');
        this.gameUI.chatBox = document.getElementById('chat-box');
        this.gameUI.emergencyButton = document.getElementById('emergency-button');
        this.gameUI.useButton = document.getElementById('use-button');
        this.gameUI.killButton = document.getElementById('kill-button');
        this.gameUI.sabotageButton = document.getElementById('sabotage-button');
        this.gameUI.reportButton = document.getElementById('report-button');
        
        // Initialize overlays
        this.initializeOverlays();
    }
    
    initializeOverlays() {
        // Create notification overlay
        const notificationOverlay = document.createElement('div');
        notificationOverlay.className = 'notification-overlay';
        notificationOverlay.id = 'notification-overlay';
        document.body.appendChild(notificationOverlay);
        this.overlays.set('notifications', notificationOverlay);
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'modal-overlay';
        document.body.appendChild(modalOverlay);
        this.overlays.set('modal', modalOverlay);
        
        // Create tooltip overlay
        const tooltipOverlay = document.createElement('div');
        tooltipOverlay.className = 'tooltip-overlay';
        tooltipOverlay.id = 'tooltip-overlay';
        document.body.appendChild(tooltipOverlay);
        this.overlays.set('tooltip', tooltipOverlay);
    }
    
    setupEventHandlers() {
        // Listen to engine events
        this.engine.on('gameStarted', this.handleGameStarted.bind(this));
        this.engine.on('gameEnded', this.handleGameEnded.bind(this));
        this.engine.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.engine.on('playerLeft', this.handlePlayerLeft.bind(this));
        this.engine.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.engine.on('meetingStarted', this.handleMeetingStarted.bind(this));
        this.engine.on('votingStarted', this.handleVotingStarted.bind(this));
        this.engine.on('playerEjected', this.handlePlayerEjected.bind(this));
        this.engine.on('chatMessage', this.handleChatMessage.bind(this));
        
        // Setup UI event listeners
        this.setupMenuEventListeners();
        this.setupGameEventListeners();
        this.setupKeyboardShortcuts();
    }
    
    setupMenuEventListeners() {
        // Main menu buttons
        const menuButtons = document.querySelectorAll('[data-action]');
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });
        
        // Settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('change', this.handleSettingsChange.bind(this));
        }
    }
    
    setupGameEventListeners() {
        // Game action buttons
        if (this.gameUI.emergencyButton) {
            this.gameUI.emergencyButton.addEventListener('click', () => {
                this.engine.emit('emergencyButtonClicked');
            });
        }
        
        if (this.gameUI.useButton) {
            this.gameUI.useButton.addEventListener('click', () => {
                this.engine.emit('useButtonClicked');
            });
        }
        
        if (this.gameUI.killButton) {
            this.gameUI.killButton.addEventListener('click', () => {
                this.engine.emit('killButtonClicked');
            });
        }
        
        if (this.gameUI.sabotageButton) {
            this.gameUI.sabotageButton.addEventListener('click', () => {
                this.engine.emit('sabotageButtonClicked');
            });
        }
        
        if (this.gameUI.reportButton) {
            this.gameUI.reportButton.addEventListener('click', () => {
                this.engine.emit('reportButtonClicked');
            });
        }
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
        
        const sendChatButton = document.querySelector('[data-action="send-chat"]');
        if (sendChatButton) {
            sendChatButton.addEventListener('click', () => {
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    this.sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'game') {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        this.engine.emit('useButtonClicked');
                        break;
                    case 'r':
                        this.engine.emit('reportButtonClicked');
                        break;
                    case 'q':
                        this.engine.emit('killButtonClicked');
                        break;
                    case 'tab':
                        e.preventDefault();
                        this.togglePlayerList();
                        break;
                    case 'enter':
                        this.focusChatInput();
                        break;
                    case 'escape':
                        this.showPauseMenu();
                        break;
                }
            }
        });
    }
    
    setupAnimations() {
        // Create animation system for UI elements
        this.animations.set('fadeIn', {
            duration: 300,
            easing: 'ease-out',
            keyframes: [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ]
        });
        
        this.animations.set('fadeOut', {
            duration: 200,
            easing: 'ease-in',
            keyframes: [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-20px)' }
            ]
        });
        
        this.animations.set('slideIn', {
            duration: 400,
            easing: 'ease-out',
            keyframes: [
                { transform: 'translateX(-100%)' },
                { transform: 'translateX(0)' }
            ]
        });
        
        this.animations.set('bounce', {
            duration: 600,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            keyframes: [
                { transform: 'scale(0.8)' },
                { transform: 'scale(1.1)' },
                { transform: 'scale(1)' }
            ]
        });
    }
    
    // Screen management
    showScreen(screenName) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Trigger screen-specific initialization
            this.onScreenChanged(screenName);
        }
    }
    
    onScreenChanged(screenName) {
        switch (screenName) {
            case 'main-menu-v3':
                this.initializeMainMenu();
                break;
            case 'game-screen':
                this.initializeGameScreen();
                break;
            case 'lobby-screen':
                this.initializeLobbyScreen();
                break;
        }
    }
    
    initializeMainMenu() {
        // Animate menu elements
        const menuCards = document.querySelectorAll('.action-card-v3');
        menuCards.forEach((card, index) => {
            setTimeout(() => {
                this.animateElement(card, 'fadeIn');
            }, index * 100);
        });
        
        // Update online player count
        this.updateOnlinePlayerCount();
        
        // Start background animations
        this.startMenuBackgroundAnimation();
    }
    
    initializeGameScreen() {
        // Show game UI elements
        this.showGameUI();
        
        // Initialize minimap
        this.initializeMinimap();
        
        // Setup task list
        this.updateTaskList();
        
        // Initialize player list
        this.updatePlayerList();
    }
    
    initializeLobbyScreen() {
        // Setup lobby-specific UI
        this.updateLobbyPlayerList();
        this.updateLobbySettings();
    }
    
    // Game UI methods
    showGameUI() {
        const gameUIElements = [
            'task-list',
            'minimap',
            'action-buttons',
            'chat-box'
        ];
        
        gameUIElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'block';
                this.animateElement(element, 'fadeIn');
            }
        });
    }
    
    hideGameUI() {
        const gameUIElements = [
            'task-list',
            'minimap',
            'action-buttons',
            'chat-box'
        ];
        
        gameUIElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'none';
            }
        });
    }
    
    updateTaskList(tasks = []) {
        if (!this.gameUI.taskList) return;
        
        this.gameUI.taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-icon">
                    <i class="fas ${task.completed ? 'fa-check' : 'fa-circle'}"></i>
                </div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-location">${task.location}</div>
                </div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
                    </div>
                </div>
            `;
            
            this.gameUI.taskList.appendChild(taskElement);
        });
    }
    
    updatePlayerList(players = []) {
        if (!this.gameUI.playerList) return;
        
        this.gameUI.playerList.innerHTML = '';
        
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-item ${player.isAlive ? 'alive' : 'dead'}`;
            playerElement.innerHTML = `
                <div class="player-avatar" data-color="${player.color}">
                    <div class="avatar-body"></div>
                    <div class="avatar-visor"></div>
                </div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">
                        ${player.isAlive ? 'Vivant' : 'Mort'}
                    </div>
                </div>
                ${player.isHost ? '<div class="host-badge"><i class="fas fa-crown"></i></div>' : ''}
            `;
            
            this.gameUI.playerList.appendChild(playerElement);
        });
    }
    
    initializeMinimap() {
        if (!this.gameUI.minimap) return;
        
        // Create minimap canvas
        const minimapCanvas = document.createElement('canvas');
        minimapCanvas.width = 200;
        minimapCanvas.height = 150;
        minimapCanvas.className = 'minimap-canvas';
        
        this.gameUI.minimap.innerHTML = '';
        this.gameUI.minimap.appendChild(minimapCanvas);
        
        // Store canvas reference for updates
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCanvas.getContext('2d');
    }
    
    updateMinimap(players = [], map = null) {
        if (!this.minimapCtx) return;
        
        // Clear minimap
        this.minimapCtx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        // Draw map outline
        if (map) {
            this.drawMinimapBackground(map);
        }
        
        // Draw players
        players.forEach(player => {
            if (player.isAlive) {
                this.drawMinimapPlayer(player);
            }
        });
    }
    
    drawMinimapBackground(map) {
        this.minimapCtx.fillStyle = '#2a2a2a';
        this.minimapCtx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        // Draw rooms (simplified)
        this.minimapCtx.fillStyle = '#404040';
        this.minimapCtx.fillRect(10, 10, 180, 130);
    }
    
    drawMinimapPlayer(player) {
        const x = (player.position.x / 1920) * this.minimapCanvas.width;
        const y = (player.position.y / 1080) * this.minimapCanvas.height;
        
        this.minimapCtx.fillStyle = this.getPlayerColor(player.color);
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(x, y, 3, 0, Math.PI * 2);
        this.minimapCtx.fill();
    }
    
    // Chat system
    addChatMessage(player, message, isQuickChat = false) {
        if (!this.gameUI.chatBox) return;
        
        const chatMessages = this.gameUI.chatBox.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${isQuickChat ? 'quick-chat' : ''}`;
        messageElement.innerHTML = `
            <div class="message-avatar" data-color="${player.color}">
                <div class="avatar-body"></div>
                <div class="avatar-visor"></div>
            </div>
            <div class="message-content">
                <div class="message-author">${player.name}</div>
                <div class="message-text">${message}</div>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Animate message appearance
        this.animateElement(messageElement, 'fadeIn');
    }
    
    sendChatMessage(message) {
        if (!message.trim()) return;
        
        this.engine.emit('chatMessageSent', {
            text: message,
            isQuickChat: false
        });
    }
    
    // Notification system
    showNotification(title, message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Add to overlay
        const overlay = this.overlays.get('notifications');
        overlay.appendChild(notification);
        
        // Animate in
        this.animateElement(notification, 'slideIn');
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        this.notifications.push(notification);
    }
    
    removeNotification(notification) {
        this.animateElement(notification, 'fadeOut').then(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        });
    }
    
    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || icons.info;
    }
    
    // Animation system
    animateElement(element, animationName) {
        const animation = this.animations.get(animationName);
        if (!animation) return Promise.resolve();
        
        return element.animate(animation.keyframes, {
            duration: animation.duration,
            easing: animation.easing,
            fill: 'forwards'
        }).finished;
    }
    
    // Event handlers
    handleMenuAction(action) {
        switch (action) {
            case 'quick-play-v3':
                this.engine.emit('quickPlayRequested');
                break;
            case 'create-room-v3':
                this.engine.emit('createRoomRequested');
                break;
            case 'join-room-v3':
                this.engine.emit('joinRoomRequested');
                break;
            case 'training-mode':
                this.engine.emit('trainingModeRequested');
                break;
            case 'customize-v3':
                this.showCustomizationScreen();
                break;
            case 'settings-v3':
                this.showSettingsScreen();
                break;
            case 'achievements':
                this.showAchievementsScreen();
                break;
            case 'statistics':
                this.showStatisticsScreen();
                break;
        }
    }
    
    handleGameStarted(data) {
        this.showScreen('game-screen');
        this.updateTaskList(data.playerTasks);
        this.updatePlayerList(data.players);
        this.showNotification('Partie commencée', 'Bonne chance!', 'success');
    }
    
    handleGameEnded(data) {
        this.showScreen('main-menu-v3');
        this.hideGameUI();
        
        const winMessage = data.winner === 'crewmates' ? 
            'Les équipiers ont gagné!' : 'Les imposteurs ont gagné!';
        
        this.showNotification('Partie terminée', winMessage, 'info', 5000);
    }
    
    handlePlayerJoined(data) {
        this.showNotification('Joueur rejoint', `${data.player.name} a rejoint la partie`, 'info');
        this.updatePlayerList();
    }
    
    handlePlayerLeft(data) {
        this.showNotification('Joueur parti', `${data.player.name} a quitté la partie`, 'warning');
        this.updatePlayerList();
    }
    
    handleTaskCompleted(data) {
        this.showNotification('Tâche terminée', `${data.task.name} complétée!`, 'success');
        this.updateTaskList();
    }
    
    handleMeetingStarted(data) {
        this.showMeetingScreen(data);
    }
    
    handleVotingStarted(data) {
        this.showVotingScreen(data);
    }
    
    handlePlayerEjected(data) {
        const message = data.wasImpostor ? 
            `${data.player.name} était un imposteur!` : 
            `${data.player.name} n'était pas un imposteur.`;
        
        this.showNotification('Joueur éjecté', message, 'info', 5000);
    }
    
    handleChatMessage(data) {
        this.addChatMessage(data.player, data.text, data.isQuickChat);
    }
    
    handleSettingsChange(e) {
        const setting = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        this.settings[setting] = value;
        this.saveSettings();
        this.applySettings();
    }
    
    // Utility methods
    getPlayerColor(colorIndex) {
        const colors = [
            '#C51111', '#132ED1', '#117F2D', '#ED54BA',
            '#EF7D0D', '#F5F557', '#3F474E', '#D6E0F0',
            '#6B2FBB', '#71491E', '#38FEDC', '#50EF39'
        ];
        return colors[colorIndex] || colors[0];
    }
    
    updateOnlinePlayerCount() {
        const countElement = document.getElementById('online-players-v3');
        if (countElement) {
            // Simulate online player count
            const count = Math.floor(Math.random() * 50000) + 10000;
            countElement.textContent = count.toLocaleString();
        }
    }
    
    startMenuBackgroundAnimation() {
        // Add animated background effects
        const canvas = document.getElementById('menu-background-canvas');
        if (canvas) {
            // This would contain particle animation code
            // For now, just a placeholder
        }
    }
    
    // Settings management
    loadSettings() {
        const saved = localStorage.getItem('amongus-v3-ui-settings');
        if (saved) {
            try {
                Object.assign(this.settings, JSON.parse(saved));
            } catch (e) {
                console.warn('Failed to load UI settings:', e);
            }
        }
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('amongus-v3-ui-settings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        // Apply UI scale
        document.documentElement.style.setProperty('--ui-scale', this.settings.uiScale);
        
        // Apply font size
        document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
        document.documentElement.classList.add(`font-${this.settings.fontSize}`);
        
        // Apply color blind support
        if (this.settings.colorBlindSupport) {
            document.documentElement.classList.add('colorblind-support');
        } else {
            document.documentElement.classList.remove('colorblind-support');
        }
    }
    
    // Screen methods (placeholders)
    showCustomizationScreen() {
        console.log('Showing customization screen');
    }
    
    showSettingsScreen() {
        console.log('Showing settings screen');
    }
    
    showAchievementsScreen() {
        console.log('Showing achievements screen');
    }
    
    showStatisticsScreen() {
        console.log('Showing statistics screen');
    }
    
    showMeetingScreen(data) {
        console.log('Showing meeting screen', data);
    }
    
    showVotingScreen(data) {
        console.log('Showing voting screen', data);
    }
    
    togglePlayerList() {
        const playerList = this.gameUI.playerList;
        if (playerList) {
            playerList.style.display = playerList.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    focusChatInput() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    }
    
    showPauseMenu() {
        console.log('Showing pause menu');
    }
    
    // Update method
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update animations
        // Update UI elements that need constant updates
        
        if (this.currentScreen === 'game') {
            // Update game-specific UI elements
            this.updateGameUI(deltaTime);
        }
    }
    
    updateGameUI(deltaTime) {
        // Update minimap
        // Update timers
        // Update progress bars
    }
    
    // Cleanup
    destroy() {
        // Remove event listeners
        // Clear animations
        // Reset UI state
        
        this.elements.clear();
        this.overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.overlays.clear();
        this.notifications = [];
        
        this.isInitialized = false;
        console.log('🎨 UI system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3UI = AmongUsV3UI;