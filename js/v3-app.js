// Among Us V3 - Main Application
class AmongUsV3App {
    constructor() {
        this.engine = null;
        this.currentScreen = 'loading';
        this.isInitialized = false;
        
        // Game state
        this.gameState = {
            isHost: false,
            roomCode: '',
            players: new Map(),
            localPlayer: null,
            gamePhase: 'lobby', // lobby, playing, discussion, voting
            settings: this.getDefaultGameSettings(),
            map: null,
            tasks: [],
            gameMode: 'classic'
        };
        
        // UI state
        this.uiState = {
            activeModal: null,
            notifications: [],
            chatMessages: [],
            isChatOpen: false,
            selectedPlayer: null
        };
        
        // Mobile controls
        this.mobileControls = null;
        
        // Mobile popup system
        this.popupSystem = null;
        
        // Loading progress
        this.loadingProgress = {
            current: 0,
            total: 100,
            stage: 'Initialisation...',
            tips: [
                'Astuce: Utilisez les évents pour vous déplacer rapidement sur la carte!',
                'Astuce: Regardez les animations des autres joueurs pour détecter les imposteurs.',
                'Astuce: Les tâches visuelles peuvent prouver votre innocence.',
                'Astuce: Restez groupés pour éviter les éliminations.',
                'Astuce: Mémorisez qui était où pendant les discussions.',
                'Astuce: Les sabotages peuvent créer des alibis pour les imposteurs.',
                'Astuce: Utilisez le chat rapide pour communiquer efficacement.',
                'Astuce: Observez les mouvements suspects près des évents.'
            ],
            currentTip: 0
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Among Us V3...');
        
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize engine
            await this.initializeEngine();
            
            // Load assets
            await this.loadAssets();
            
            // Initialize game systems
            await this.initializeGameSystems();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Initialize mobile controls
            this.initializeMobileControls();
            
            // Initialize popup system
            this.initializePopupSystem();
            
            // Complete initialization
            this.completeInitialization();
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showError('Erreur d\'initialisation', error.message);
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            this.updateLoadingProgress(0, 'Initialisation du moteur de jeu...');
            this.startLoadingTips();
        }
    }
    
    startLoadingTips() {
        const tipElement = document.getElementById('loading-tip');
        if (!tipElement) return;
        
        // Clear any existing tip timer
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
        }
        
        const updateTip = () => {
            if (this.currentScreen === 'loading') {
                tipElement.textContent = this.loadingProgress.tips[this.loadingProgress.currentTip];
                this.loadingProgress.currentTip = (this.loadingProgress.currentTip + 1) % this.loadingProgress.tips.length;
                this.tipTimer = setTimeout(updateTip, 3000);
            }
        };
        
        updateTip();
    }
    
    updateLoadingProgress(progress, stage) {
        this.loadingProgress.current = progress;
        this.loadingProgress.stage = stage;
        
        const progressFill = document.getElementById('loading-progress-fill');
        const progressText = document.getElementById('loading-text');
        const progressPercentage = document.getElementById('loading-percentage');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = stage;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
    }
    
    async waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showError(title, message) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const loadingText = document.getElementById('loading-text');
            const loadingPercentage = document.getElementById('loading-percentage');
            
            if (loadingText) {
                loadingText.textContent = `❌ ${title}: ${message}`;
                loadingText.style.color = '#ff3838';
            }
            
            if (loadingPercentage) {
                loadingPercentage.textContent = 'Erreur';
                loadingPercentage.style.color = '#ff3838';
            }
        }
        
        // Also show in console for debugging
        console.error(`${title}: ${message}`);
    }
    
    async initializeEngine() {
        this.updateLoadingProgress(10, 'Initialisation du moteur de jeu...');
        
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize game engine
            console.log('🔧 Creating game engine...');
            this.engine = new AmongUsV3Engine();
            
            // Engine is initialized in constructor, no need to wait for start event
            console.log('✅ Game engine created successfully');
            
            console.log('✅ Game engine initialized successfully');
            this.updateLoadingProgress(25, 'Moteur de jeu initialisé');
            
        } catch (error) {
            console.error('❌ Engine initialization failed:', error);
            throw new Error(`Échec d'initialisation du moteur: ${error.message}`);
        }
    }
    
    async loadAssets() {
        this.updateLoadingProgress(30, 'Chargement des ressources...');
        
        // Simulate asset loading with progress updates
        const assets = [
            { name: 'Textures des personnages', weight: 20 },
            { name: 'Cartes du jeu', weight: 25 },
            { name: 'Effets sonores', weight: 15 },
            { name: 'Musiques', weight: 10 },
            { name: 'Interface utilisateur', weight: 15 },
            { name: 'Animations', weight: 15 }
        ];
        
        let currentProgress = 30;
        
        for (let asset of assets) {
            this.updateLoadingProgress(currentProgress, `Chargement: ${asset.name}...`);
            await this.sleep(500 + Math.random() * 1000); // Simulate loading time
            currentProgress += asset.weight;
        }
        
        this.updateLoadingProgress(70, 'Ressources chargées');
    }
    
    async initializeGameSystems() {
        this.updateLoadingProgress(75, 'Initialisation des systèmes de jeu...');
        
        // Initialize audio system
        if (this.engine.audio) {
            await this.engine.audio.initialize();
        }
        
        this.updateLoadingProgress(80, 'Système audio initialisé');
        
        // Initialize networking
        if (this.engine.networking) {
            await this.engine.networking.initialize();
        }
        
        this.updateLoadingProgress(85, 'Système réseau initialisé');
        
        // Initialize game logic
        this.initializeGameLogic();
        
        this.updateLoadingProgress(90, 'Logique de jeu initialisée');
    }
    
    initializeGameLogic() {
        // Create local player
        this.gameState.localPlayer = {
            id: this.generatePlayerId(),
            name: this.getPlayerName(),
            color: '#ff3838', // Red by default
            isImpostor: false,
            isAlive: true,
            position: { x: 0, y: 0 }, // Start at center
            tasks: [],
            completedTasks: 0,
            animation: 'idle',
            direction: 'right',
            velocity: { x: 0, y: 0 },
            lastPosition: { x: 0, y: 0 }
        };
        
        // Add to players map
        this.gameState.players.set(this.gameState.localPlayer.id, this.gameState.localPlayer);
        
        // Initialize task system
        this.initializeTaskSystem();
        
        // Initialize map system
        this.initializeMapSystem();
        
        // Initialize player in physics system
        this.initializePlayerPhysics();
    }
    
    initializePlayerPhysics() {
        if (this.engine.physics) {
            this.engine.physics.createBody('localPlayer', {
                x: this.gameState.localPlayer.position.x,
                y: this.gameState.localPlayer.position.y,
                width: 50,
                height: 50,
                type: 'dynamic',
                mass: 1,
                friction: 0.8,
                restitution: 0
            });
        }
    }
    
    initializeTaskSystem() {
        // This would be expanded with actual task implementations
        this.taskSystem = {
            availableTasks: [
                { id: 'wires', name: 'Réparer les câbles', location: 'Electrical', type: 'common' },
                { id: 'fuel', name: 'Faire le plein', location: 'Storage', type: 'long' },
                { id: 'scan', name: 'Scanner médical', location: 'MedBay', type: 'visual' },
                { id: 'asteroids', name: 'Détruire les astéroïdes', location: 'Weapons', type: 'visual' },
                { id: 'shields', name: 'Calibrer les boucliers', location: 'Shields', type: 'visual' }
            ],
            assignedTasks: [],
            completedTasks: []
        };
    }
    
    initializeMapSystem() {
        // Initialize with The Skeld map
        this.mapSystem = {
            currentMap: 'skeld',
            availableMaps: ['skeld', 'polus', 'airship', 'fungle'],
            rooms: new Map(),
            vents: new Map(),
            spawnPoints: []
        };
        
        this.loadMap('skeld');
    }
    
    loadMap(mapName) {
        // This would load actual map data
        console.log(`🗺️ Loading map: ${mapName}`);
        
        // Create a simple map structure with renderable objects
        this.mapSystem.rooms.set('cafeteria', {
            name: 'Cafeteria',
            bounds: { x: 0, y: 0, width: 200, height: 150 },
            tasks: ['wires'],
            vents: []
        });
        
        this.mapSystem.rooms.set('electrical', {
            name: 'Electrical',
            bounds: { x: -150, y: 100, width: 100, height: 80 },
            tasks: ['wires', 'fuel'],
            vents: ['vent1']
        });
        
        // Add renderable objects to graphics engine
        this.createMapRenderables();
        
        // Set spawn point
        this.gameState.localPlayer.position = { x: 0, y: 0 };
        
        // Set camera target to local player
        if (this.engine.graphics) {
            this.engine.graphics.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    createMapRenderables() {
        if (!this.engine.graphics) return;
        
        // Clear existing renderables
        this.engine.graphics.layers.background = [];
        this.engine.graphics.layers.environment = [];
        this.engine.graphics.layers.objects = [];
        this.engine.graphics.layers.players = [];
        
        // Add background
        this.engine.graphics.layers.background.push({
            type: 'background',
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
            color: '#1a1a2e'
        });
        
        // Add rooms
        this.mapSystem.rooms.forEach((room, roomName) => {
            this.engine.graphics.layers.environment.push({
                type: 'room',
                x: room.bounds.x,
                y: room.bounds.y,
                width: room.bounds.width,
                height: room.bounds.height,
                name: roomName,
                color: '#4a5568'
            });
        });
        
        // Add walls around rooms
        this.engine.graphics.layers.environment.push({
            type: 'wall',
            x: -100,
            y: -75,
            width: 200,
            height: 10
        });
        
        this.engine.graphics.layers.environment.push({
            type: 'wall',
            x: -100,
            y: 75,
            width: 200,
            height: 10
        });
        
        // Add some tasks
        this.engine.graphics.layers.objects.push({
            type: 'task',
            x: 50,
            y: 0,
            width: 40,
            height: 30,
            taskType: 'wires'
        });
        
        this.engine.graphics.layers.objects.push({
            type: 'task',
            x: -100,
            y: 120,
            width: 40,
            height: 30,
            taskType: 'fuel'
        });
        
        // Add a vent
        this.engine.graphics.layers.objects.push({
            type: 'vent',
            x: -120,
            y: 140,
            radius: 25
        });
        
        // Add local player to render
        if (this.gameState.localPlayer) {
            this.engine.graphics.layers.players.push({
                type: 'player',
                x: this.gameState.localPlayer.position.x,
                y: this.gameState.localPlayer.position.y,
                color: this.gameState.localPlayer.color,
                name: this.gameState.localPlayer.name,
                animation: this.gameState.localPlayer.animation,
                direction: this.gameState.localPlayer.direction,
                isDead: !this.gameState.localPlayer.isAlive,
                isImpostor: this.gameState.localPlayer.isImpostor
            });
        }
        
        console.log('🎨 Map renderables created');
    }
    
    setupEventListeners() {
        // Engine events
        this.engine.on('keydown', this.handleKeyDown.bind(this));
        this.engine.on('keyup', this.handleKeyUp.bind(this));
        this.engine.on('mousedown', this.handleMouseDown.bind(this));
        this.engine.on('mousemove', this.handleMouseMove.bind(this));
        
        // UI events
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Custom game events
        this.engine.on('playerMove', this.handlePlayerMove.bind(this));
        this.engine.on('taskComplete', this.handleTaskComplete.bind(this));
        this.engine.on('playerKilled', this.handlePlayerKilled.bind(this));
    }
    
    initializeUI() {
        this.updateLoadingProgress(95, 'Initialisation de l\'interface...');
        
        // Initialize notification system
        this.notificationSystem = new NotificationSystem();
        
        // Initialize chat system
        this.chatSystem = new ChatSystem();
        
        // Setup UI event listeners
        this.setupUIEventListeners();
        
        // Initialize menu animations
        this.initializeMenuAnimations();
    }
    
    setupUIEventListeners() {
        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleUIAction(action, e);
            });
        });
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
        
        // Settings changes
        document.querySelectorAll('input[type="range"], select, input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', this.handleSettingChange.bind(this));
        });
    }
    
    initializeMenuAnimations() {
        // Add stagger animations to menu items
        const menuItems = document.querySelectorAll('.main-actions-v3 .action-card-v3');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-slide-in-up');
        });
        
        const secondaryItems = document.querySelectorAll('.secondary-menu-v3 .menu-item-v3');
        secondaryItems.forEach((item, index) => {
            item.style.animationDelay = `${(index * 0.05) + 0.5}s`;
            item.classList.add('animate-fade-in');
        });
    }
    
    initializeMobileControls() {
        // Initialize mobile controls if available
        if (typeof MobileControls !== 'undefined' && this.engine) {
            this.mobileControls = new MobileControls(this.engine);
            
            // Setup mobile control event listeners
            this.engine.on('mobileMovement', this.handleMobileMovement.bind(this));
            this.engine.on('mobileAction', this.handleMobileAction.bind(this));
            
            console.log('📱 Mobile controls integrated');
        }
    }
    
    handleMobileMovement(data) {
        // Handle mobile joystick movement
        if (this.gameState.localPlayer) {
            const speed = 200; // pixels per second
            const deltaTime = this.engine.deltaTime / 1000; // Convert to seconds
            
            // Update position
            this.gameState.localPlayer.position.x += data.x * speed * deltaTime;
            this.gameState.localPlayer.position.y += data.y * speed * deltaTime;
            
            // Update velocity for physics
            this.gameState.localPlayer.velocity.x = data.x * speed;
            this.gameState.localPlayer.velocity.y = data.y * speed;
            
            // Update animation state
            if (data.isMoving) {
                this.gameState.localPlayer.animation = 'walking';
                // Set direction based on movement
                if (Math.abs(data.x) > Math.abs(data.y)) {
                    this.gameState.localPlayer.direction = data.x > 0 ? 'right' : 'left';
                }
            } else {
                this.gameState.localPlayer.animation = 'idle';
            }
            
            // Update player renderable
            this.updatePlayerRenderable();
        }
    }
    
    updatePlayerRenderable() {
        if (!this.engine.graphics || !this.gameState.localPlayer) return;
        
        // Find and update player in render layers
        const playerLayer = this.engine.graphics.layers.players;
        const playerRenderable = playerLayer.find(obj => obj.type === 'player');
        
        if (playerRenderable) {
            playerRenderable.x = this.gameState.localPlayer.position.x;
            playerRenderable.y = this.gameState.localPlayer.position.y;
            playerRenderable.animation = this.gameState.localPlayer.animation;
            playerRenderable.direction = this.gameState.localPlayer.direction;
        }
        
        // Update camera target
        if (this.engine.graphics.camera) {
            this.engine.graphics.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    handleMobileAction(data) {
        // Handle mobile action buttons
        switch (data.action) {
            case 'use':
                this.handleUIAction('use-interact');
                break;
            case 'report':
                this.handleUIAction('emergency-meeting');
                break;
            case 'kill':
                if (this.gameState.localPlayer?.isImpostor) {
                    this.handleUIAction('kill-player');
                }
                break;
            case 'sabotage':
                if (this.gameState.localPlayer?.isImpostor) {
                    this.handleUIAction('toggle-sabotage');
                }
                break;
            case 'emergency':
                this.handleUIAction('emergency-meeting');
                break;
            case 'map':
                this.handleUIAction('toggle-map');
                break;
            case 'toggle-menu':
                this.handleUIAction('toggle-settings');
                break;
            case 'toggle-chat':
                this.toggleChat();
                break;
            case 'toggle-tasks':
                this.toggleTaskList();
                break;
        }
    }
    
    initializePopupSystem() {
        // Initialize popup system if available
        if (typeof MobilePopupSystem !== 'undefined') {
            this.popupSystem = new MobilePopupSystem();
            
            // Setup popup event listeners
            document.addEventListener('popup:action', this.handlePopupAction.bind(this));
            
            // Create game-specific popups
            this.createGamePopups();
            
            console.log('📱 Popup system integrated');
        }
    }
    
    createGamePopups() {
        if (!this.popupSystem) return;
        
        // Create floating action menu
        this.popupSystem.showPopup('game-menu', 'floating', {
            icon: 'fas fa-bars',
            items: [
                { icon: 'fas fa-cog', label: 'Paramètres', action: 'settings' },
                { icon: 'fas fa-map', label: 'Carte', action: 'map' },
                { icon: 'fas fa-list', label: 'Tâches', action: 'tasks' },
                { icon: 'fas fa-comments', label: 'Chat', action: 'chat' },
                { icon: 'fas fa-home', label: 'Menu', action: 'main-menu' }
            ],
            position: { x: window.innerWidth - 80, y: window.innerHeight - 160 }
        });
        
        // Create task popup (minimizable)
        this.popupSystem.showPopup('task-tracker', 'minimizable', {
            title: 'Suivi des Tâches',
            content: this.generateTaskTrackerContent(),
            position: { x: 20, y: 80 }
        });
        
        // Create player list popup (slide-up, hidden by default)
        // Will be shown when needed
    }
    
    generateTaskTrackerContent() {
        const tasks = this.gameState.tasks || [];
        
        if (tasks.length === 0) {
            return `
                <div class="task-tracker-empty">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; color: var(--text-muted); margin-bottom: 15px;"></i>
                    <p>Aucune tâche assignée</p>
                    <small>Les tâches apparaîtront ici une fois la partie commencée</small>
                </div>
            `;
        }
        
        return `
            <div class="task-tracker-list">
                ${tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <div class="task-icon">
                            <i class="${task.icon || 'fas fa-wrench'}"></i>
                        </div>
                        <div class="task-info">
                            <div class="task-name">${task.name}</div>
                            <div class="task-location">${task.location}</div>
                        </div>
                        <div class="task-status">
                            ${task.completed ? '<i class="fas fa-check"></i>' : '<i class="fas fa-circle"></i>'}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(tasks.filter(t => t.completed).length / tasks.length) * 100}%"></div>
                </div>
                <div class="progress-text">
                    ${tasks.filter(t => t.completed).length}/${tasks.length} tâches terminées
                </div>
            </div>
        `;
    }
    
    handlePopupAction(event) {
        const { id, action } = event.detail;
        
        switch (action) {
            case 'settings':
                this.showSettings();
                break;
            case 'map':
                this.toggleMap();
                break;
            case 'tasks':
                this.showTaskList();
                break;
            case 'chat':
                this.toggleChat();
                break;
            case 'main-menu':
                this.showMainMenu();
                break;
            case 'player-list':
                this.showPlayerList();
                break;
            case 'emergency':
                this.callEmergencyMeeting();
                break;
        }
    }
    
    showSettings() {
        if (this.popupSystem) {
            this.popupSystem.showPopup('settings', 'slide-up', {
                title: 'Paramètres',
                content: this.generateSettingsContent()
            });
        }
    }
    
    generateSettingsContent() {
        return `
            <div class="settings-sections">
                <div class="setting-section">
                    <h4>Audio</h4>
                    <div class="setting-item">
                        <label>Volume Principal</label>
                        <input type="range" class="mobile-slider" min="0" max="100" value="80" data-setting="masterVolume">
                    </div>
                    <div class="setting-item">
                        <label>Effets Sonores</label>
                        <input type="range" class="mobile-slider" min="0" max="100" value="70" data-setting="sfxVolume">
                    </div>
                </div>
                
                <div class="setting-section">
                    <h4>Graphismes</h4>
                    <div class="setting-item">
                        <label>Qualité</label>
                        <div class="mobile-button-group">
                            <button class="mobile-option-btn" data-value="low">Faible</button>
                            <button class="mobile-option-btn active" data-value="medium">Moyen</button>
                            <button class="mobile-option-btn" data-value="high">Élevé</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label>Éclairage</label>
                        <div class="mobile-toggle active" data-setting="lighting"></div>
                    </div>
                </div>
                
                <div class="setting-section">
                    <h4>Contrôles</h4>
                    <div class="setting-item">
                        <label>Sensibilité du Joystick</label>
                        <input type="range" class="mobile-slider" min="0.5" max="2" step="0.1" value="1" data-setting="joystickSensitivity">
                    </div>
                    <div class="setting-item">
                        <label>Vibrations</label>
                        <div class="mobile-toggle active" data-setting="hapticFeedback"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showPlayerList() {
        if (this.popupSystem) {
            this.popupSystem.showPopup('player-list', 'slide-up', {
                title: 'Liste des Joueurs',
                content: this.generatePlayerListContent()
            });
        }
    }
    
    generatePlayerListContent() {
        const players = Array.from(this.gameState.players.values()) || [];
        
        return `
            <div class="player-list-container">
                ${players.map(player => `
                    <div class="player-item ${player.isDead ? 'dead' : ''} ${player.isImpostor ? 'impostor' : ''}">
                        <div class="player-avatar" style="background-color: ${player.color}">
                            <div class="crewmate-mini"></div>
                        </div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-status">
                                ${player.isDead ? 'Mort' : 'Vivant'}
                                ${player.isImpostor && this.gameState.localPlayer?.isDead ? ' - Imposteur' : ''}
                            </div>
                        </div>
                        <div class="player-actions">
                            ${!player.isDead && this.gameState.gamePhase === 'discussion' ? 
                                `<button class="vote-btn" data-player="${player.id}">Voter</button>` : 
                                ''
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateTaskTracker() {
        if (this.popupSystem && this.popupSystem.isPopupActive('task-tracker')) {
            this.popupSystem.updatePopupContent('task-tracker', this.generateTaskTrackerContent());
        }
    }
    
    completeInitialization() {
        this.updateLoadingProgress(100, 'Initialisation terminée!');
        
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showMainMenu();
            this.isInitialized = true;
            
            // Start the game engine
            if (this.engine) {
                this.engine.start();
            }
            
            // Show welcome notification
            this.showNotification('Bienvenue dans Among Us V3!', 'Profitez de l\'expérience premium complète.', 'success');
            
            console.log('✅ Among Us V3 initialized successfully');
        }, 1000);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            loadingScreen.classList.add('animate-fade-out');
        }
        
        // Stop loading tips timer
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
            this.tipTimer = null;
        }
    }
    
    showMainMenu() {
        this.currentScreen = 'main-menu-v3';
        this.showScreen('main-menu-v3');
        
        // Start background animations
        this.startBackgroundAnimations();
        
        // Update online player count
        this.updateOnlinePlayerCount();
    }
    
    startBackgroundAnimations() {
        const canvas = document.getElementById('menu-background-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Create animated space background
        this.backgroundAnimation = new SpaceBackgroundAnimation(ctx, canvas.width, canvas.height);
        this.backgroundAnimation.start();
    }
    
    updateOnlinePlayerCount() {
        const playerCountElement = document.getElementById('online-players-v3');
        if (playerCountElement) {
            // Simulate online player count
            const count = 20000 + Math.floor(Math.random() * 10000);
            playerCountElement.textContent = count.toLocaleString();
        }
        
        // Clear any existing timer
        if (this.playerCountTimer) {
            clearTimeout(this.playerCountTimer);
        }
        
        // Update every 30 seconds only if still on main menu
        if (this.currentScreen === 'main-menu-v3') {
            this.playerCountTimer = setTimeout(() => this.updateOnlinePlayerCount(), 30000);
        }
    }
    
    showScreen(screenId) {
        // Hide current screen
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            currentScreen.classList.remove('active');
            currentScreen.classList.add('animate-fade-out');
        }
        
        // Show new screen
        const newScreen = document.getElementById(screenId);
        if (newScreen) {
            setTimeout(() => {
                newScreen.classList.add('active');
                newScreen.classList.add('animate-fade-in');
                this.currentScreen = screenId;
            }, 150);
        }
    }
    
    handleUIAction(action, event) {
        console.log('UI Action:', action);
        
        // Add button press animation
        const button = event.target.closest('[data-action]');
        if (button) {
            button.classList.add('button-press');
            setTimeout(() => button.classList.remove('button-press'), 150);
        }
        
        switch (action) {
            case 'quick-play-v3':
                this.startQuickPlay();
                break;
            case 'create-room-v3':
                this.showCreateRoom();
                break;
            case 'join-room-v3':
                this.showJoinRoom();
                break;
            case 'training-mode':
                this.startTrainingMode();
                break;
            case 'customize-v3':
                this.showCustomization();
                break;
            case 'achievements':
                this.showAchievements();
                break;
            case 'statistics':
                this.showStatistics();
                break;
            case 'settings-v3':
                this.showSettings();
                break;
            case 'start-game':
                this.startGame();
                break;
            case 'emergency-meeting':
                this.callEmergencyMeeting();
                break;
            case 'use-interact':
                this.useInteract();
                break;
            case 'kill-player':
                this.killPlayer();
                break;
            case 'toggle-map':
                this.toggleMap();
                break;
            case 'send-chat':
                this.sendChatMessage();
                break;
            case 'toggle-chat':
                this.toggleChat();
                break;
            default:
                console.warn('Unknown UI action:', action);
        }
    }
    
    startQuickPlay() {
        this.showNotification('Recherche de partie...', 'Recherche de joueurs dans votre région', 'info');
        
        // Simulate matchmaking
        setTimeout(() => {
            this.showNotification('Partie trouvée!', 'Connexion en cours...', 'success');
            setTimeout(() => {
                this.showGameScreen();
                this.initializeGameSession();
            }, 2000);
        }, 3000);
    }
    
    showCreateRoom() {
        this.showNotification('Création de partie', 'Fonctionnalité en développement', 'info');
    }
    
    showJoinRoom() {
        this.showNotification('Rejoindre une partie', 'Fonctionnalité en développement', 'info');
    }
    
    startTrainingMode() {
        this.showNotification('Mode Entraînement', 'Lancement du tutoriel interactif...', 'info');
        
        setTimeout(() => {
            this.showGameScreen();
            this.initializeTrainingSession();
        }, 1500);
    }
    
    showCustomization() {
        this.showNotification('Personnalisation', 'Fonctionnalité en développement', 'info');
    }
    
    showAchievements() {
        this.showNotification('Succès', 'Fonctionnalité en développement', 'info');
    }
    
    showStatistics() {
        this.showNotification('Statistiques', 'Fonctionnalité en développement', 'info');
    }
    
    showSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('active');
            this.uiState.activeModal = 'settings';
        }
    }
    
    startGame(mode = 'classic') {
        this.gameState.gameMode = mode;
        this.gameState.gamePhase = 'playing';
        
        // Switch to game screen
        this.showScreen('game-screen');
        
        // Initialize game world
        this.initializeGameWorld();
        
        // Start game loop
        this.startGameLoop();
        
        this.showNotification('Partie commencée!', `Mode: ${mode}`, 'success');
    }
    
    joinGame(roomCode) {
        this.gameState.roomCode = roomCode;
        this.startGame();
    }
    
    initializeGameWorld() {
        // Create player physics body
        const playerBody = this.engine.physics.createBody('localPlayer', {
            x: this.gameState.localPlayer.position.x,
            y: this.gameState.localPlayer.position.y,
            mass: 1,
            shape: { type: 'circle', radius: 20 },
            userData: { type: 'player', id: this.gameState.localPlayer.id }
        });
        
        // Create player visual representation
        const player = this.gameState.localPlayer;
        const playerSprite = {
            type: 'player',
            id: player.id,
            x: player.position.x,
            y: player.position.y,
            color: player.color,
            name: player.name,
            isDead: !player.isAlive,
            isImpostor: player.isImpostor,
            animation: player.animation,
            direction: player.direction
        };
        
        this.engine.graphics.addToLayer('players', playerSprite);
        
        // Set camera to follow player
        this.engine.graphics.setCameraTarget(this.gameState.localPlayer.position);
        
        // Create map elements
        this.createMapElements();
        
        // Assign tasks
        this.assignTasks();
    }
    
    createMapElements() {
        // Create a basic room to make the world visible
        const room = {
            type: 'room',
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            color: '#3a3a5a',
            name: 'Cafeteria'
        };
        this.engine.graphics.addToLayer('environment', room);

        // Create physics bodies for the walls of the room
        const wallThickness = 20;

        // Top wall
        this.engine.physics.createBody('wall_top', {
            x: 0,
            y: -300 - wallThickness / 2,
            isStatic: true,
            shape: { type: 'rectangle', width: 800 + 2 * wallThickness, height: wallThickness }
        });
        
        // Bottom wall
        this.engine.physics.createBody('wall_bottom', {
            x: 0,
            y: 300 + wallThickness / 2,
            isStatic: true,
            shape: { type: 'rectangle', width: 800 + 2 * wallThickness, height: wallThickness }
        });

        // Left wall
        this.engine.physics.createBody('wall_left', {
            x: -400 - wallThickness / 2,
            y: 0,
            isStatic: true,
            shape: { type: 'rectangle', width: wallThickness, height: 600 }
        });
        
        // Right wall
        this.engine.physics.createBody('wall_right', {
            x: 400 + wallThickness / 2,
            y: 0,
            isStatic: true,
            shape: { type: 'rectangle', width: wallThickness, height: 600 }
        });
    }
    
    assignTasks() {
        // Assign random tasks to player
        const availableTasks = this.taskSystem.availableTasks.slice();
        const numTasks = 5 + Math.floor(Math.random() * 3); // 5-7 tasks
        
        for (let i = 0; i < numTasks && availableTasks.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableTasks.length);
            const task = availableTasks.splice(randomIndex, 1)[0];
            this.gameState.localPlayer.tasks.push(task);
        }
        
        this.updateTaskUI();
    }
    
    updateTaskUI() {
        const taskItems = document.getElementById('task-items');
        if (!taskItems) return;
        
        taskItems.innerHTML = '';
        
        this.gameState.localPlayer.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="task-icon">
                    <i class="fas fa-wrench"></i>
                </div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-location">${task.location}</div>
                </div>
                <div class="task-status"></div>
            `;
            
            taskItems.appendChild(taskElement);
        });
        
        // Update progress
        const progress = (this.gameState.localPlayer.completedTasks / this.gameState.localPlayer.tasks.length) * 100;
        const progressFill = document.getElementById('task-progress-fill');
        const progressText = document.getElementById('task-progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${this.gameState.localPlayer.completedTasks}/${this.gameState.localPlayer.tasks.length}`;
    }
    
    startGameLoop() {
        // Game-specific update loop
        const gameUpdate = () => {
            if (this.currentScreen === 'game-screen' && this.gameState.gamePhase === 'playing') {
                this.updateGame();
                requestAnimationFrame(gameUpdate);
            }
        };
        
        gameUpdate();
    }
    
    updateGame() {
        // Update player movement
        this.updatePlayerMovement();
        
        // Update game logic
        this.updateGameLogic();
        
        // Update UI
        this.updateGameUI();
    }
    
    updatePlayerMovement() {
        if (!this.gameState.localPlayer) return;
        
        const player = this.gameState.localPlayer;
        const speed = 150; // pixels per second
        const deltaTime = this.engine.deltaTime / 1000;
        
        let velocityX = 0;
        let velocityY = 0;
        
        // Handle input
        if (this.engine.isKeyPressed('KeyW') || this.engine.isKeyPressed('ArrowUp')) {
            velocityY = -speed;
        }
        if (this.engine.isKeyPressed('KeyS') || this.engine.isKeyPressed('ArrowDown')) {
            velocityY = speed;
        }
        if (this.engine.isKeyPressed('KeyA') || this.engine.isKeyPressed('ArrowLeft')) {
            velocityX = -speed;
        }
        if (this.engine.isKeyPressed('KeyD') || this.engine.isKeyPressed('ArrowRight')) {
            velocityX = speed;
        }
        
        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX = (velocityX / length) * speed;
            velocityY = (velocityY / length) * speed;
        }
        
        // Update player animation state
        const isMoving = velocityX !== 0 || velocityY !== 0;
        player.animation = isMoving ? 'walk' : 'idle';
        
        // Update player direction
        if (velocityX !== 0) {
            player.direction = velocityX > 0 ? 'right' : 'left';
        }
        
        // Update physics body
        if (this.engine.physics) {
            this.engine.physics.setVelocity('localPlayer', velocityX, velocityY);
            
            // Update player position from physics
            const body = this.engine.physics.getBody('localPlayer');
            if (body) {
                player.position.x = body.position.x;
                player.position.y = body.position.y;
            }
        } else {
            // Fallback direct movement
            player.position.x += velocityX * deltaTime;
            player.position.y += velocityY * deltaTime;
        }
        
        // Update player in graphics system
        this.updatePlayerInGraphics(player);
        
        // Update camera to follow player
        if (this.engine.graphics) {
            this.engine.graphics.camera.target = player.position;
        }
    }
    
    updatePlayerInGraphics(player) {
        if (!this.engine.graphics) return;
        
        // Remove old player from graphics
        this.engine.graphics.layers.players = this.engine.graphics.layers.players.filter(
            obj => obj.id !== player.id
        );
        
        // Add updated player to graphics
        this.engine.graphics.layers.players.push({
            type: 'player',
            id: player.id,
            x: player.position.x,
            y: player.position.y,
            color: player.color,
            name: player.name,
            animation: player.animation,
            direction: player.direction,
            isDead: player.isDead,
            isImpostor: player.isImpostor,
            showImpostorIndicator: false // Only show for debugging
        });
    }
    
    updateGameLogic() {
        // Check for task interactions
        this.checkTaskInteractions();
        
        // Check for player interactions
        this.checkPlayerInteractions();
        
        // Update game state
        this.updateGameState();
    }
    
    checkTaskInteractions() {
        // Check if player is near a task location
        // This would be expanded with actual task locations
    }
    
    checkPlayerInteractions() {
        // Check for other players nearby
        // This would be expanded with multiplayer logic
    }
    
    updateGameState() {
        // Update game phase based on conditions
        // Check win conditions, etc.
    }
    
    updateGameUI() {
        // Update HUD elements
        this.updateTaskUI();
        
        // Update player count
        const aliveElement = document.getElementById('alive-players');
        const totalElement = document.getElementById('total-players');
        
        if (aliveElement) aliveElement.textContent = this.getAlivePlayerCount();
        if (totalElement) totalElement.textContent = this.gameState.players.size;
    }
    
    getAlivePlayerCount() {
        let count = 0;
        for (let [id, player] of this.gameState.players) {
            if (player.isAlive) count++;
        }
        return count;
    }
    
    // Event handlers
    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyE':
                if (this.currentScreen === 'game-screen') {
                    this.useInteract();
                }
                break;
            case 'Tab':
                if (this.currentScreen === 'game-screen') {
                    event.preventDefault();
                    this.toggleMap();
                }
                break;
            case 'KeyR':
                if (this.currentScreen === 'game-screen') {
                    this.reportBody();
                }
                break;
            case 'Escape':
                this.handleEscapeKey();
                break;
        }
    }
    
    handleKeyUp(event) {
        // Handle key release events
    }
    
    handleMouseDown(event) {
        // Handle mouse clicks in game world
        if (this.currentScreen === 'game-screen') {
            const worldPos = this.engine.graphics.screenToWorld(event.x, event.y);
            this.handleWorldClick(worldPos.x, worldPos.y);
        }
    }
    
    handleMouseMove(event) {
        // Handle mouse movement
    }
    
    handleWorldClick(x, y) {
        // Handle clicks in the game world
        console.log('World click:', x, y);
    }
    
    handleGlobalClick(event) {
        // Handle global UI clicks
        if (event.target.classList.contains('modal-overlay')) {
            this.closeModal();
        }
    }
    
    handleEscapeKey() {
        if (this.uiState.activeModal) {
            this.closeModal();
        } else if (this.currentScreen === 'game-screen') {
            this.showSettings();
        }
    }
    
    handleBeforeUnload(event) {
        if (this.gameState.gamePhase === 'playing') {
            event.preventDefault();
            event.returnValue = 'Vous êtes en cours de partie. Êtes-vous sûr de vouloir quitter?';
        }
    }
    
    handlePlayerMove(event) {
        // Handle player movement events
    }
    
    handleTaskComplete(event) {
        this.gameState.localPlayer.completedTasks++;
        this.updateTaskUI();
        this.showNotification('Tâche terminée!', event.taskName, 'success');
        
        // Play task complete sound
        if (this.engine.audio) {
            this.engine.audio.playSound('taskComplete');
        }
    }
    
    handlePlayerKilled(event) {
        this.showNotification('Vous avez été éliminé!', 'Vous pouvez maintenant observer la partie.', 'error');
        this.gameState.localPlayer.isAlive = false;
    }
    
    handleSettingChange(event) {
        const setting = event.target.dataset.setting;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        if (setting) {
            this.updateSetting(setting, value);
        }
    }
    
    // Game actions
    useInteract() {
        console.log('Use/Interact action');
        // Check for nearby interactive objects
    }
    
    killPlayer() {
        if (this.gameState.localPlayer.isImpostor) {
            console.log('Kill action');
            // Implement kill logic
        }
    }
    
    callEmergencyMeeting() {
        console.log('Emergency meeting called');
        this.showNotification('Réunion d\'urgence!', 'Tous les joueurs se rassemblent.', 'warning');
        
        // Switch to voting phase
        this.gameState.gamePhase = 'discussion';
        this.showVotingScreen();
    }
    
    reportBody() {
        console.log('Body reported');
        this.showNotification('Corps signalé!', 'Réunion d\'urgence déclenchée.', 'warning');
        this.callEmergencyMeeting();
    }
    
    toggleMap() {
        console.log('Toggle map');
        // Show/hide map overlay
    }
    
    toggleChat() {
        this.uiState.isChatOpen = !this.uiState.isChatOpen;
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.classList.toggle('collapsed', !this.uiState.isChatOpen);
        }
    }
    
    sendChatMessage(message) {
        if (!message || !message.trim()) return;
        
        const chatMessage = {
            id: Date.now(),
            author: this.gameState.localPlayer.name,
            content: message.trim(),
            timestamp: new Date(),
            type: 'player'
        };
        
        this.addChatMessage(chatMessage);
    }
    
    addChatMessage(message) {
        this.uiState.chatMessages.push(message);
        
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${message.author}</span>
                    <span class="message-time">${message.timestamp.toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    showVotingScreen() {
        this.showScreen('voting-screen');
        // Initialize voting UI
    }
    
    closeModal() {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            this.uiState.activeModal = null;
        }
    }
    
    showNotification(title, message, type = 'info') {
        if (this.notificationSystem) {
            this.notificationSystem.show(title, message, type);
        }
    }
    
    updateSetting(key, value) {
        // Update engine settings
        if (this.engine) {
            this.engine.updateSetting('graphics', key, value);
        }
        
        console.log(`Setting updated: ${key} = ${value}`);
    }
    
    // Utility methods
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    getPlayerName() {
        return localStorage.getItem('playerName') || 'Joueur';
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    getDefaultGameSettings() {
        return {
            maxPlayers: 10,
            numImpostors: 2,
            killCooldown: 45,
            emergencyMeetings: 1,
            emergencyCooldown: 15,
            discussionTime: 15,
            votingTime: 120,
            playerSpeed: 1.0,
            crewmateVision: 1.0,
            impostorVision: 1.5,
            killDistance: 1.0,
            taskBarUpdates: 'always',
            commonTasks: 1,
            longTasks: 1,
            shortTasks: 2,
            visualTasks: true,
            confirmEjects: true,
            anonymousVotes: false
        };
    }
    
    async waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showError(title, message) {
        console.error(`${title}: ${message}`);
        alert(`${title}\n\n${message}`);
    }
    
    showGameScreen() {
        // Hide menu screen
        const menuScreen = document.getElementById('main-menu-v3');
        if (menuScreen) {
            menuScreen.classList.remove('active');
        }
        
        // Show game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('active');
        }
        
        // Update mobile controls for game state
        if (this.mobileControls) {
            this.mobileControls.updateForGameState({
                isImpostor: this.gameState.localPlayer?.isImpostor || false,
                nearbyInteractable: false
            });
        }
    }
    
    initializeGameSession() {
        // Initialize local player
        this.gameState.localPlayer = {
            id: 'local-player',
            name: 'Joueur',
            color: '#ff3838',
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            animation: 'idle',
            direction: 'right',
            isAlive: true,
            isImpostor: Math.random() < 0.3, // 30% chance to be impostor
            tasks: [
                { id: 1, name: 'Réparer les câbles', location: 'Cafétéria', icon: 'fas fa-bolt', completed: false },
                { id: 2, name: 'Vider les déchets', location: 'Stockage', icon: 'fas fa-trash', completed: false },
                { id: 3, name: 'Faire le plein', location: 'Moteurs', icon: 'fas fa-gas-pump', completed: false }
            ]
        };
        
        // Add some other players for demo
        this.gameState.players.set('player-2', {
            id: 'player-2',
            name: 'Rouge',
            color: '#ff3838',
            position: { x: 100, y: 50 },
            isAlive: true,
            isImpostor: false
        });
        
        this.gameState.players.set('player-3', {
            id: 'player-3',
            name: 'Bleu',
            color: '#132ed1',
            position: { x: -80, y: 30 },
            isAlive: true,
            isImpostor: false
        });
        
        // Update game state
        this.gameState.gamePhase = 'playing';
        this.gameState.tasks = this.gameState.localPlayer.tasks;
        
        // Load map and create renderables
        this.loadMap('skeld');
        
        // Update task tracker
        this.updateTaskTracker();
        
        console.log('🎮 Game session initialized');
    }
    
    initializeTrainingSession() {
        this.initializeGameSession();
        
        // Add training-specific elements
        this.gameState.isTraining = true;
        
        // Show tutorial popup
        if (this.popupSystem) {
            this.popupSystem.showPopup('tutorial', 'slide-up', {
                title: 'Mode Entraînement',
                content: `
                    <div class="tutorial-content">
                        <h4>Bienvenue dans le mode entraînement !</h4>
                        <p>Utilisez le joystick virtuel pour vous déplacer et explorez la carte.</p>
                        <ul>
                            <li>🕹️ Joystick : Déplacement</li>
                            <li>🤚 Bouton Utiliser : Interagir avec les objets</li>
                            <li>🚨 Bouton Urgence : Appeler une réunion</li>
                            <li>📋 Menu flottant : Accéder aux options</li>
                        </ul>
                        <button class="quick-action-btn primary" onclick="document.querySelector('#popup-tutorial').remove()">
                            Commencer l'entraînement
                        </button>
                    </div>
                `
            });
        }
        
        console.log('🎓 Training session initialized');
    }
}

// Simple notification system
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = [];
    }
    
    show(title, message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            duration
        };
        
        this.notifications.push(notification);
        this.render(notification);
        
        setTimeout(() => {
            this.remove(notification.id);
        }, duration);
    }
    
    render(notification) {
        if (!this.container) return;
        
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.id = notification.id;
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas ${this.getIcon(notification.type)}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="notification-progress"></div>
        `;
        
        // Add close functionality
        element.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(notification.id);
        });
        
        this.container.appendChild(element);
        
        // Trigger animation
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
        
        // Progress bar animation
        const progressBar = element.querySelector('.notification-progress');
        progressBar.style.width = '100%';
        progressBar.style.transition = `width ${notification.duration}ms linear`;
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 10);
    }
    
    remove(id) {
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    getIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
}

// Simple chat system
class ChatSystem {
    constructor() {
        this.messages = [];
    }
    
    addMessage(message) {
        this.messages.push(message);
        // Implementation would update UI
    }
}

// Space background animation
class SpaceBackgroundAnimation {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.stars = [];
        this.isRunning = false;
        
        this.generateStars();
    }
    
    generateStars() {
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    update() {
        for (let star of this.stars) {
            star.x -= star.speed;
            
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(1, '#1a1a2e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render stars
        for (let star of this.stars) {
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.amongUsV3App = new AmongUsV3App();
});

// Export for debugging
window.AmongUsV3App = AmongUsV3App;