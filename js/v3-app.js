// Among Us V3 - Main Application (Fixed)
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
            
            // Setup game update loop
            this.setupGameUpdateLoop();
            
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
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = stage;
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
            if (loadingText) {
                loadingText.textContent = `❌ ${title}: ${message}`;
                loadingText.style.color = '#ff3838';
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
            
            console.log('✅ Game engine created successfully');
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
            await this.sleep(500 + Math.random() * 1000);
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
            color: '#ff3838',
            isImpostor: false,
            isAlive: true,
            position: { x: 0, y: 0 },
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
        console.log(`🗺️ Loading map: ${mapName}`);
        
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
        
        this.createMapRenderables();
        
        this.gameState.localPlayer.position = { x: 0, y: 0 };
        
        if (this.engine.graphics) {
            this.engine.graphics.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    createMapRenderables() {
        if (!this.engine.graphics) return;
        
        this.engine.graphics.layers.background = [];
        this.engine.graphics.layers.environment = [];
        this.engine.graphics.layers.objects = [];
        this.engine.graphics.layers.players = [];
        
        this.engine.graphics.layers.background.push({
            type: 'background',
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
            color: '#1a1a2e'
        });
        
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
        
        this.engine.graphics.layers.objects.push({
            type: 'vent',
            x: -120,
            y: 140,
            radius: 25
        });
        
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
        this.engine.on('keydown', this.handleKeyDown.bind(this));
        this.engine.on('keyup', this.handleKeyUp.bind(this));
        this.engine.on('mousedown', this.handleMouseDown.bind(this));
        this.engine.on('mousemove', this.handleMouseMove.bind(this));
        
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        this.engine.on('playerMove', this.handlePlayerMove.bind(this));
        this.engine.on('taskComplete', this.handleTaskComplete.bind(this));
        this.engine.on('playerKilled', this.handlePlayerKilled.bind(this));
    }
    
    initializeUI() {
        this.updateLoadingProgress(95, 'Initialisation de l\'interface...');
        
        this.notificationSystem = new NotificationSystem();
        this.chatSystem = new ChatSystem();
        this.setupUIEventListeners();
        this.initializeMenuAnimations();
        
        // Load saved character customizations
        setTimeout(() => {
            if (typeof this.loadLocalPlayerCustomization === 'function') {
                this.loadLocalPlayerCustomization();
            }
        }, 100);
    }
    
    setupUIEventListeners() {
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleUIAction(action, e);
            });
        });
        
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
        
        document.querySelectorAll('input[type="range"], select, input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', this.handleSettingChange.bind(this));
        });
    }
    
    initializeMenuAnimations() {
        const menuItems = document.querySelectorAll('.main-actions .action-btn');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-slide-in-up');
        });
    }
    
    initializeMobileControls() {
        if (typeof MobileControls !== 'undefined' && this.engine) {
            this.mobileControls = new MobileControls(this.engine);
            this.engine.on('mobileMovement', this.handleMobileMovement.bind(this));
            this.engine.on('mobileAction', this.handleMobileAction.bind(this));
            console.log('📱 Mobile controls integrated');
        }
    }
    
    handleMobileMovement(data) {
        if (this.gameState.localPlayer) {
            const speed = 200;
            const deltaTime = this.engine.deltaTime / 1000;
            
            this.gameState.localPlayer.position.x += data.x * speed * deltaTime;
            this.gameState.localPlayer.position.y += data.y * speed * deltaTime;
            
            this.gameState.localPlayer.velocity.x = data.x * speed;
            this.gameState.localPlayer.velocity.y = data.y * speed;
            
            if (data.isMoving) {
                this.gameState.localPlayer.animation = 'walking';
                if (Math.abs(data.x) > Math.abs(data.y)) {
                    this.gameState.localPlayer.direction = data.x > 0 ? 'right' : 'left';
                }
            } else {
                this.gameState.localPlayer.animation = 'idle';
            }
            
            this.updatePlayerRenderable();
        }
    }
    
    handleMobileAction(action) {
        switch(action) {
            case 'use':
                this.useInteraction();
                break;
            case 'kill':
                this.killPlayer();
                break;
            case 'sabotage':
                this.toggleSabotage();
                break;
            case 'report':
                this.reportBody();
                break;
            case 'map':
                this.toggleMap();
                break;
            case 'settings':
                this.toggleGameSettings();
                break;
            case 'tasks':
                // Implement task list toggle
                break;
        }
    }

    updatePlayerRenderable() {
        if (!this.engine.graphics || !this.gameState.localPlayer) return;
        
        const playerLayer = this.engine.graphics.layers.players;
        const playerRenderable = playerLayer.find(obj => obj.type === 'player');
        
        if (playerRenderable) {
            playerRenderable.x = this.gameState.localPlayer.position.x;
            playerRenderable.y = this.gameState.localPlayer.position.y;
            playerRenderable.animation = this.gameState.localPlayer.animation;
            playerRenderable.direction = this.gameState.localPlayer.direction;
        }
        
        if (this.engine.graphics.camera) {
            this.engine.graphics.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    initializePopupSystem() {
        if (typeof MobilePopupSystem !== 'undefined') {
            this.popupSystem = new MobilePopupSystem();
            document.addEventListener('popup:action', this.handlePopupAction.bind(this));
            this.createGamePopups();
            console.log('📱 Popup system integrated');
        }
    }
    
    createGamePopups() {
        if (!this.popupSystem) return;
        
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
    }
    
    completeInitialization() {
        this.updateLoadingProgress(100, 'Initialisation terminée!');
        
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showMainMenu();
            this.isInitialized = true;
            
            if (this.engine) {
                this.engine.start();
            }
            
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
        
        if (this.tipTimer) {
            clearTimeout(this.tipTimer);
            this.tipTimer = null;
        }
    }
    
    showMainMenu() {
        this.currentScreen = 'main-menu';
        this.showScreen('main-menu');
        this.startBackgroundAnimations();
        this.updateOnlinePlayerCount();
    }
    
    startBackgroundAnimations() {
        const canvas = document.getElementById('menu-background-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        this.backgroundAnimation = new SpaceBackgroundAnimation(ctx, canvas.width, canvas.height);
        this.backgroundAnimation.start();
    }
    
    updateOnlinePlayerCount() {
        const playerCountElement = document.getElementById('online-players');
        if (playerCountElement) {
            const count = 20000 + Math.floor(Math.random() * 10000);
            playerCountElement.textContent = count.toLocaleString();
        }
        
        if (this.playerCountTimer) {
            clearTimeout(this.playerCountTimer);
        }
        
        if (this.currentScreen === 'main-menu') {
            this.playerCountTimer = setTimeout(() => this.updateOnlinePlayerCount(), 30000);
        }
    }
    
    showScreen(screenId) {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            currentScreen.classList.remove('active');
            currentScreen.classList.add('animate-fade-out');
        }
        
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
        
        const button = event.target.closest('[data-action]');
        if (button) {
            button.classList.add('button-press');
            setTimeout(() => button.classList.remove('button-press'), 150);
        }
        
        switch (action) {
            case 'quick-play':
                this.startQuickPlay();
                break;
            case 'create-room':
                this.showCreateRoom();
                break;
            case 'join-room':
                this.showJoinRoom();
                break;
            case 'training':
                this.startTrainingMode();
                break;
            case 'cosmetics':
                this.showCustomization();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'close-settings':
                this.hideSettings();
                break;
            case 'join-with-code':
                this.joinWithCode();
                break;
            case 'close-join-room':
                this.hideJoinRoom();
                break;
            case 'toggle-secondary':
                this.toggleSecondaryMenu();
                break;
            case 'copy-room-code':
                this.copyRoomCode();
                break;
            case 'toggle-map':
                this.toggleMap();
                break;
            case 'toggle-settings':
                this.toggleGameSettings();
                break;
            case 'emergency-meeting':
                this.callEmergencyMeeting();
                break;
            case 'use':
                this.useInteraction();
                break;
            case 'kill':
                this.killPlayer();
                break;
            case 'sabotage':
                this.toggleSabotage();
                break;
            case 'report':
                this.reportBody();
                break;
            case 'close-character-customizer':
                this.hideCharacterCustomizer();
                break;
        }
    }
    
    startQuickPlay() {
        console.log('🎮 Starting quick play...');
        this.showNotification('Recherche d\'une partie...', 'Connexion en cours...', 'info');
        
        setTimeout(() => {
            this.gameState.roomCode = this.generateRoomCode();
            this.gameState.gamePhase = 'lobby';
            this.startGame();
        }, 2000);
    }
    
    startTrainingMode() {
        console.log('🎓 Starting training mode...');
        this.gameState.gameMode = 'training';
        this.gameState.roomCode = 'TRAIN';
        this.gameState.gamePhase = 'playing';
        
        this.addAIPlayers();
        this.startGame();
    }
    
    startGame() {
        console.log('🎮 Starting game...');
        this.showScreen('game-screen');
        this.currentScreen = 'game';
        
        this.initializeGameWorld();
        this.setupGameUpdateLoop();
        
        this.updateGameUI();
        this.showNotification('Partie commencée!', 'Bonne chance!', 'success');
    }
    
    initializeGameWorld() {
        this.loadMap('skeld');
        this.assignTasks();
        this.spawnPlayers();
        
        if (this.engine.graphics && this.gameState.localPlayer) {
            this.engine.graphics.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    assignTasks() {
        if (!this.gameState.localPlayer) return;
        
        const availableTasks = this.taskSystem.availableTasks;
        const numTasks = 5;
        
        this.gameState.tasks = [];
        for (let i = 0; i < numTasks; i++) {
            const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
            this.gameState.tasks.push({
                ...task,
                id: `task_${i}`,
                completed: false,
                progress: 0
            });
        }
        
        this.gameState.localPlayer.tasks = this.gameState.tasks;
        this.updateTaskUI();
    }
    
    spawnPlayers() {
        if (this.gameState.localPlayer) {
            this.gameState.localPlayer.position = { x: 0, y: 0 };
            
            if (this.engine.physics) {
                const body = this.engine.physics.collisionBodies.get('localPlayer');
                if (body) {
                    body.position.x = 0;
                    body.position.y = 0;
                }
            }
        }
        
        if (this.gameState.gameMode === 'training') {
            this.spawnAIPlayers();
        }
    }
    
    addAIPlayers() {
        const aiNames = ['Rouge', 'Bleu', 'Vert', 'Rose', 'Orange', 'Jaune', 'Noir', 'Blanc', 'Violet'];
        const colors = ['#ff3838', '#1f4e96', '#0f7b0f', '#ee54bb', '#f07613', '#f5f557', '#3f474e', '#d6e0f0', '#6b2fbb'];
        
        for (let i = 0; i < 5; i++) {
            const aiPlayer = {
                id: `ai_${i}`,
                name: aiNames[i],
                color: colors[i],
                isImpostor: i === 0,
                isAlive: true,
                position: { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 },
                tasks: [],
                completedTasks: 0,
                animation: 'idle',
                direction: 'right',
                velocity: { x: 0, y: 0 },
                isAI: true
            };
            
            this.gameState.players.set(aiPlayer.id, aiPlayer);
        }
    }
    
    spawnAIPlayers() {
        this.gameState.players.forEach((player, id) => {
            if (player.isAI) {
                this.engine.graphics.layers.players.push({
                    type: 'player',
                    id: player.id,
                    x: player.position.x,
                    y: player.position.y,
                    color: player.color,
                    name: player.name,
                    animation: player.animation,
                    direction: player.direction,
                    isDead: !player.isAlive,
                    isImpostor: player.isImpostor
                });
            }
        });
    }
    
    updateTaskUI() {
        const taskItems = document.getElementById('task-items');
        const taskProgressText = document.getElementById('task-progress-text');
        const taskProgressFill = document.getElementById('task-progress-fill');
        
        if (taskItems && this.gameState.tasks) {
            taskItems.innerHTML = '';
            
            this.gameState.tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.innerHTML = `
                    <div class="task-icon">
                        <i class="fas fa-wrench"></i>
                    </div>
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-location">${task.location}</div>
                    </div>
                    <div class="task-status">
                        ${task.completed ? '<i class="fas fa-check"></i>' : '<i class="fas fa-circle"></i>'}
                    </div>
                `;
                taskItems.appendChild(taskElement);
            });
            
            const completedTasks = this.gameState.tasks.filter(t => t.completed).length;
            const totalTasks = this.gameState.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            if (taskProgressText) {
                taskProgressText.textContent = `${completedTasks}/${totalTasks}`;
            }
            
            if (taskProgressFill) {
                taskProgressFill.style.width = `${progress}%`;
            }
        }
    }
    
    showCreateRoom() {
        console.log('🏠 Showing create room...');
        this.showNotification('Création de partie', 'Fonctionnalité en développement', 'info');
    }
    
    showJoinRoom() {
        const panel = document.getElementById('join-room-panel');
        if (panel) {
            panel.classList.add('active');
        }
    }
    
    hideJoinRoom() {
        const panel = document.getElementById('join-room-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
    
    joinWithCode() {
        const input = document.getElementById('room-code-input');
        if (input && input.value.trim()) {
            const code = input.value.trim().toUpperCase();
            console.log('🔗 Joining room with code:', code);
            
            this.gameState.roomCode = code;
            this.hideJoinRoom();
            this.startGame();
        }
    }
    
    showCustomization() {
        console.log('🎨 Showing customization...');
        this.showCharacterCustomizer();
    }
    
    hideSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
    
    showCharacterCustomizer() {
        console.log('🎨 Opening character customizer...');
        const panel = document.getElementById('character-customizer-panel');
        if (panel) {
            panel.classList.add('active');
            this.uiState.activeModal = 'character-customizer';
            
            // Initialize character customizer if not already done
            if (!window.characterCustomizer) {
                window.characterCustomizer = new CharacterCustomizer(this);
            }
            
            // Setup tab navigation
            this.setupCustomizerTabs();
        }
    }
    
    hideCharacterCustomizer() {
        const panel = document.getElementById('character-customizer-panel');
        if (panel) {
            panel.classList.remove('active');
            this.uiState.activeModal = null;
            
            // Stop preview animation to save resources
            if (window.characterCustomizer) {
                window.characterCustomizer.stopPreviewAnimation();
            }
        }
    }
    
    setupCustomizerTabs() {
        const tabs = document.querySelectorAll('.customizer-tabs .tab-btn');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                const targetContent = document.querySelector(`[data-tab="${targetTab}"].tab-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
        
        // Setup slider value updates
        this.setupSliderValueUpdates();
    }
    
    setupSliderValueUpdates() {
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            const valueSpan = document.getElementById(slider.id.replace('-slider', '-value'));
            if (valueSpan) {
                slider.addEventListener('input', (e) => {
                    valueSpan.textContent = parseFloat(e.target.value).toFixed(2);
                });
            }
        });
    }
    
    toggleSecondaryMenu() {
        const menu = document.getElementById('secondary-menu');
        if (menu) {
            this.secondaryMenuOpen = !this.secondaryMenuOpen;
            menu.classList.toggle('active', this.secondaryMenuOpen);
        }
    }
    
    copyRoomCode() {
        if (this.gameState.roomCode) {
            navigator.clipboard.writeText(this.gameState.roomCode).then(() => {
                this.showNotification('Code copié!', `Code ${this.gameState.roomCode} copié dans le presse-papiers`, 'success');
            });
        }
    }
    
    toggleMap() {
        console.log('🗺️ Toggling map...');
        this.showNotification('Carte', 'Fonctionnalité en développement', 'info');
    }
    
    toggleGameSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }
    
    callEmergencyMeeting() {
        console.log('🚨 Emergency meeting called!');
        this.showNotification('Réunion d\'urgence!', 'Une réunion d\'urgence a été appelée', 'warning');
    }
    
    useInteraction() {
        console.log('🤏 Use interaction');
    }
    
    killPlayer() {
        console.log('💀 Kill action');
    }
    
    toggleSabotage() {
        console.log('🔧 Toggle sabotage');
    }
    
    reportBody() {
        console.log('📢 Report body');
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    getPlayerName() {
        return localStorage.getItem('playerName') || 'Joueur';
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
    
    showNotification(title, message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${title} - ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const container = document.getElementById('notifications');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
            
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.remove();
            });
        }
    }
    
    handleKeyDown(event) {
        if (this.currentScreen !== 'game') return;
        
        const { code } = event;
        const player = this.gameState.localPlayer;
        if (!player) return;
        
        const moveSpeed = 200;
        
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                player.velocity.y = -moveSpeed;
                player.direction = 'up';
                player.animation = 'walking';
                break;
            case 'KeyS':
            case 'ArrowDown':
                player.velocity.y = moveSpeed;
                player.direction = 'down';
                player.animation = 'walking';
                break;
            case 'KeyA':
            case 'ArrowLeft':
                player.velocity.x = -moveSpeed;
                player.direction = 'left';
                player.animation = 'walking';
                break;
            case 'KeyD':
            case 'ArrowRight':
                player.velocity.x = moveSpeed;
                player.direction = 'right';
                player.animation = 'walking';
                break;
            case 'Space':
                this.useInteraction();
                break;
            case 'KeyE':
                this.useInteraction();
                break;
        }
        
        if (this.engine.physics) {
            const body = this.engine.physics.collisionBodies.get('localPlayer');
            if (body) {
                body.velocity.x = player.velocity.x;
                body.velocity.y = player.velocity.y;
            }
        }
    }
    
    handleKeyUp(event) {
        if (this.currentScreen !== 'game') return;
        
        const { code } = event;
        const player = this.gameState.localPlayer;
        if (!player) return;
        
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
            case 'KeyS':
            case 'ArrowDown':
                player.velocity.y = 0;
                break;
            case 'KeyA':
            case 'ArrowLeft':
            case 'KeyD':
            case 'ArrowRight':
                player.velocity.x = 0;
                break;
        }
        
        if (player.velocity.x === 0 && player.velocity.y === 0) {
            player.animation = 'idle';
        }
        
        if (this.engine.physics) {
            const body = this.engine.physics.collisionBodies.get('localPlayer');
            if (body) {
                body.velocity.x = player.velocity.x;
                body.velocity.y = player.velocity.y;
            }
        }
    }
    
    handleMouseDown(event) {
        if (this.currentScreen === 'game-screen') {
            const worldPos = this.engine.graphics.screenToWorld(event.x, event.y);
            this.handleWorldClick(worldPos.x, worldPos.y);
        }
    }
    
    handleMouseMove(event) {
    }
    
    handleGlobalClick(event) {
    }
    
    handleBeforeUnload(event) {
        if (this.gameState.gamePhase === 'playing') {
            event.preventDefault();
            event.returnValue = 'Vous êtes en cours de partie. Êtes-vous sûr de vouloir quitter?';
        }
    }
    
    handlePlayerMove(event) {
    }
    
    handleTaskComplete(event) {
        this.gameState.localPlayer.completedTasks++;
        this.updateTaskUI();
        this.showNotification('Tâche terminée!', event.taskName, 'success');
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
    
    updateSetting(key, value) {
        if (this.engine) {
            this.engine.updateSetting('graphics', key, value);
        }
        
        console.log(`Setting updated: ${key} = ${value}`);
    }
    
    handleWorldClick(x, y) {
        console.log('World click:', x, y);
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
        
        element.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(notification.id);
        });
        
        this.container.appendChild(element);
        
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
        
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
    
    // Character customization data management
    savePlayerCustomization(playerId, characterOptions) {
        const customizations = this.getStoredCustomizations();
        customizations[playerId] = characterOptions;
        localStorage.setItem('amongus_player_customizations', JSON.stringify(customizations));
    }
    
    loadPlayerCustomization(playerId) {
        const customizations = this.getStoredCustomizations();
        return customizations[playerId] || null;
    }
    
    getStoredCustomizations() {
        try {
            const stored = localStorage.getItem('amongus_player_customizations');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error loading customizations:', e);
            return {};
        }
    }
    
    // Apply customization to local player
    applyLocalPlayerCustomization() {
        if (window.characterCustomizer && this.gameState.localPlayer) {
            const options = window.characterCustomizer.exportCharacterOptions();
            this.gameState.localPlayer.characterOptions = options;
            this.savePlayerCustomization('local', options);
        }
    }
    
    // Load customization for local player
    loadLocalPlayerCustomization() {
        const saved = this.loadPlayerCustomization('local');
        if (saved && window.characterCustomizer) {
            window.characterCustomizer.currentOptions = saved;
            window.characterCustomizer.refreshAllControls();
        }
    }
    
    // Generate sprite sheet for multiplayer sync
    generatePlayerSpriteSheet(characterOptions) {
        if (window.CrewmateGenerator) {
            return window.CrewmateGenerator.buildSpriteSheet(characterOptions, {
                frames: 8,
                dirs: 4,
                ssaa: 1
            });
        }
        return null;
    }
}

// Simple chat system
class ChatSystem {
    constructor() {
        this.messages = [];
    }
    
    addMessage(message) {
        this.messages.push(message);
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
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(1, '#1a1a2e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
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
    window.amongUsApp = new AmongUsV3App();
});

// Export for debugging
window.AmongUsV3App = AmongUsV3App;
