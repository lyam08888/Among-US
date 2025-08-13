// Among Us V4 - Application Principale avec Systèmes Avancés
class AmongUsV4App {
    constructor() {
        this.currentScreen = 'loading';
        this.isInitialized = false;
        
        // Systèmes avancés
        this.audioSystem = null;
        this.mappingSystem = null;
        this.characterSystem = null;
        this.engine = null;
        this.gameLogic = null;
        this.tasksSystem = null;
        this.networkingSystem = null;
        
        // État du jeu
        this.gameState = {
            isHost: false,
            roomCode: '',
            players: new Map(),
            localPlayer: null,
            gamePhase: 'lobby', // lobby, playing, discussion, voting
            currentMap: 'skeld',
            gameMode: 'classic',
            settings: this.getDefaultGameSettings()
        };
        
        // État de l'interface
        this.uiState = {
            activeModal: null,
            secondaryMenuOpen: false,
            chatOpen: false,
            settingsOpen: false
        };
        
        // Contrôles mobiles
        this.mobileControls = {
            joystick: {
                active: false,
                startPos: { x: 0, y: 0 },
                currentPos: { x: 0, y: 0 },
                element: null,
                knob: null
            },
            touchStartPos: { x: 0, y: 0 },
            lastTouchTime: 0
        };
        
        // Caméra de jeu
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            width: window.innerWidth,
            height: window.innerHeight,
            target: null,
            smoothing: 0.1
        };
        
        // Progression du chargement
        this.loadingProgress = {
            current: 0,
            total: 100,
            stage: 'Initialisation...'
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Among Us V4...');
        
        try {
            // Afficher l'écran de chargement
            this.showLoadingScreen();
            
            // Initialiser les systèmes
            await this.initializeSystems();
            
            // Configurer les événements
            this.setupEventListeners();
            
            // Initialiser l'interface
            this.initializeUI();
            
            // Finaliser l'initialisation
            this.completeInitialization();
            
        } catch (error) {
            console.error('❌ Failed to initialize V4 application:', error);
            this.showError('Erreur d\'initialisation', error.message);
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            this.updateLoadingProgress(0, 'Initialisation des systèmes...');
        }
    }
    
    updateLoadingProgress(progress, stage) {
        this.loadingProgress.current = progress;
        this.loadingProgress.stage = stage;
        
        const progressBar = document.getElementById('loading-progress-bar');
        const progressText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = stage;
        }
    }
    
    async initializeSystems() {
        // Initialiser le système audio
        this.updateLoadingProgress(10, 'Initialisation du système audio...');
        this.audioSystem = new AdvancedAudioSystem();
        await this.audioSystem.init();

        document.addEventListener('pointerdown', async () => {
            await this.audioSystem.resume();
            if (this.gameState.gamePhase === 'lobby' && this.audioSystem.isReady?.()) {
                this.audioSystem.startLobbyMusic();
            }
        }, { once: true });
        
        // Initialiser le moteur de jeu
        this.updateLoadingProgress(30, 'Initialisation du moteur de jeu...');
        this.engine = new AmongUsV3Engine(); // Réutiliser le moteur V3
        
        // Initialiser le système de mapping
        this.updateLoadingProgress(50, 'Chargement des cartes...');
        this.mappingSystem = new AdvancedMappingSystem(this.engine);
        await this.mappingSystem.init();
        
        // Initialiser le système de personnages
        this.updateLoadingProgress(60, 'Chargement des personnages...');
        this.characterSystem = new AdvancedCharacterSystem(this.engine);
        await this.characterSystem.init();
        
        // Initialiser la logique de jeu
        this.updateLoadingProgress(70, 'Initialisation de la logique de jeu...');
        this.gameLogic = new GameLogic(this);
        
        // Initialiser le système de tâches
        this.updateLoadingProgress(80, 'Chargement des tâches...');
        this.tasksSystem = new TasksSystem(this);
        
        // Initialiser le réseau
        this.updateLoadingProgress(85, 'Connexion réseau...');
        this.networkingSystem = new NetworkingSystem(this);
        
        // Créer le joueur local
        this.updateLoadingProgress(90, 'Création du personnage...');
        this.createLocalPlayer();
        
        // Initialiser le canvas de jeu
        this.updateLoadingProgress(95, 'Finalisation...');
        this.initializeGameCanvas();
        
        this.updateLoadingProgress(100, 'Prêt !');
    }
    
    createLocalPlayer() {
        const playerId = this.generatePlayerId();
        const playerName = this.getPlayerName();
        
        this.gameState.localPlayer = this.characterSystem.createCharacter(playerId, {
            name: playerName,
            color: 'red',
            x: 0,
            y: 0,
            isLocal: true,
            isImpostor: false
        });
        
        this.gameState.players.set(playerId, this.gameState.localPlayer);
    }
    
    initializeGameCanvas() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.camera.width = canvas.width;
        this.camera.height = canvas.height;
        
        // Configurer le contexte de rendu
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Démarrer la boucle de rendu
        this.startRenderLoop();
    }
    
    setupEventListeners() {
        // Événements de l'interface
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Événements de redimensionnement
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Événements de visibilité
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Événements audio (pour reprendre le contexte)
        document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
        document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
    }
    
    initializeUI() {
        // Initialiser les contrôles mobiles
        this.initializeMobileControls();
        
        // Initialiser les sliders de volume
        this.initializeVolumeControls();
        
        // Configurer les boutons d'action
        this.setupActionButtons();
    }
    
    initializeMobileControls() {
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystick-knob');
        
        if (joystick && joystickKnob) {
            this.mobileControls.joystick.element = joystick;
            this.mobileControls.joystick.knob = joystickKnob;
        }
    }
    
    initializeVolumeControls() {
        const masterVolume = document.getElementById('master-volume');
        const sfxVolume = document.getElementById('sfx-volume');
        const musicVolume = document.getElementById('music-volume');
        const ambientVolume = document.getElementById('ambient-volume');
        
        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                this.audioSystem.setMasterVolume(e.target.value / 100);
            });
        }
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                this.audioSystem.setSfxVolume(e.target.value / 100);
            });
        }
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                this.audioSystem.setMusicVolume(e.target.value / 100);
            });
        }
        
        if (ambientVolume) {
            ambientVolume.addEventListener('input', (e) => {
                this.audioSystem.setAmbientVolume(e.target.value / 100);
            });
        }
    }
    
    setupActionButtons() {
        // Configuration des boutons avec leurs actions
        const buttonActions = {
            'quick-play': () => this.startQuickPlay(),
            'create-room': () => this.createRoom(),
            'join-room': () => this.showJoinRoom(),
            'training': () => this.startTraining(),
            'cosmetics': () => this.showCosmetics(),
            'stats': () => this.showStats(),
            'toggle-secondary': () => this.toggleSecondaryMenu(),
            'settings': () => this.showSettings(),
            'close-settings': () => this.hideSettings(),
            'use': () => this.useObject(),
            'kill': () => this.killPlayer(),
            'report': () => this.reportBody(),
            'emergency-meeting': () => this.callEmergencyMeeting()
        };
        
        // Attacher les événements aux boutons
        Object.keys(buttonActions).forEach(action => {
            const buttons = document.querySelectorAll(`[data-action="${action}"]`);
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.audioSystem.playButtonClick();
                    buttonActions[action]();
                });
            });
        });
    }
    
    completeInitialization() {
        this.isInitialized = true;
        
        // Masquer l'écran de chargement
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showMainMenu();
        }, 1000);
        
        console.log('✅ Among Us V4 initialized successfully');
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }
    
    showMainMenu() {
        this.currentScreen = 'main-menu';
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('active');
        }
    }
    
    showGameScreen() {
        this.currentScreen = 'game-screen';
        
        // Masquer le menu principal
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.remove('active');
        }
        
        // Afficher l'écran de jeu
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('active');
        }
        
        // Démarrer la musique de jeu
        this.audioSystem.startGameplayMusic();
        
        // Configurer la caméra sur le joueur local
        if (this.gameState.localPlayer) {
            this.camera.target = this.gameState.localPlayer.position;
        }
    }
    
    // Actions des boutons
    startQuickPlay() {
        console.log('🎮 Starting quick play...');
        this.gameState.roomCode = this.generateRoomCode();
        this.showGameScreen();
    }
    
    createRoom() {
        console.log('🏠 Creating room...');
        this.gameState.isHost = true;
        this.gameState.roomCode = this.generateRoomCode();
        this.showGameScreen();
    }
    
    showJoinRoom() {
        console.log('🚪 Showing join room...');
        // Implémenter l'interface de rejoindre une partie
    }
    
    startTraining() {
        console.log('🎓 Starting training...');
        this.gameState.gameMode = 'training';
        this.showGameScreen();
    }
    
    showCosmetics() {
        console.log('🎨 Showing cosmetics...');
        // Implémenter l'interface des cosmétiques
    }
    
    showStats() {
        console.log('📊 Showing stats...');
        // Implémenter l'interface des statistiques
    }
    
    toggleSecondaryMenu() {
        const secondaryMenu = document.getElementById('secondary-menu');
        const menuToggle = document.getElementById('menu-toggle');
        
        if (secondaryMenu && menuToggle) {
            this.uiState.secondaryMenuOpen = !this.uiState.secondaryMenuOpen;
            
            if (this.uiState.secondaryMenuOpen) {
                secondaryMenu.classList.add('active');
                menuToggle.classList.add('active');
            } else {
                secondaryMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    }
    
    showSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.add('active');
            this.uiState.settingsOpen = true;
        }
    }
    
    hideSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.remove('active');
            this.uiState.settingsOpen = false;
        }
    }
    
    // Actions de gameplay
    useObject() {
        if (!this.gameState.localPlayer) return;
        
        console.log('⚙️ Using object...');
        
        // Vérifier s'il y a une tâche à proximité
        const nearbyTask = this.findNearbyTask();
        if (nearbyTask) {
            this.tasksSystem.startTask(nearbyTask.id, this.gameState.localPlayer.id);
        } else {
            this.characterSystem.setCharacterState(this.gameState.localPlayer.id, 'using');
            this.audioSystem.playSound('task-progress');
        }
    }
    
    findNearbyTask() {
        if (!this.gameState.localPlayer) return null;
        
        const player = this.gameState.localPlayer;
        const tasks = this.tasksSystem.getTasksForPlayer(player.id);
        
        // Trouver une tâche non terminée à proximité
        return tasks.find(task => {
            if (task.completed) return false;
            
            // Vérifier la distance (simulation)
            const taskDistance = Math.random() * 150; // Distance simulée
            return taskDistance < 100; // Portée d'interaction
        });
    }
    
    killPlayer() {
        if (!this.gameState.localPlayer || !this.gameState.localPlayer.isImpostor) return;
        
        console.log('💀 Attempting kill...');
        this.characterSystem.setCharacterState(this.gameState.localPlayer.id, 'killing');
        this.audioSystem.playKillSound(this.gameState.localPlayer.position);
    }
    
    reportBody() {
        console.log('📢 Reporting body...');
        this.audioSystem.playEmergencyMeeting();
    }
    
    callEmergencyMeeting() {
        console.log('🚨 Calling emergency meeting...');
        this.audioSystem.playEmergencyMeeting();
    }
    
    // Gestion des événements tactiles
    handleTouchStart(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Vérifier si c'est le joystick
        if (e.target.closest('#joystick')) {
            this.startJoystickControl(touch);
        }
        
        this.mobileControls.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.mobileControls.lastTouchTime = Date.now();
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (this.mobileControls.joystick.active) {
            this.updateJoystickControl(e.touches[0]);
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        if (this.mobileControls.joystick.active) {
            this.endJoystickControl();
        }
    }
    
    startJoystickControl(touch) {
        const joystick = this.mobileControls.joystick.element;
        const rect = joystick.getBoundingClientRect();
        
        this.mobileControls.joystick.active = true;
        this.mobileControls.joystick.startPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        this.updateJoystickControl(touch);
    }
    
    updateJoystickControl(touch) {
        if (!this.mobileControls.joystick.active) return;
        
        const startPos = this.mobileControls.joystick.startPos;
        const deltaX = touch.clientX - startPos.x;
        const deltaY = touch.clientY - startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 35; // Rayon maximum du joystick
        
        // Limiter la distance
        const clampedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        const clampedX = Math.cos(angle) * clampedDistance;
        const clampedY = Math.sin(angle) * clampedDistance;
        
        // Mettre à jour la position du bouton
        const knob = this.mobileControls.joystick.knob;
        if (knob) {
            knob.style.transform = `translate(-50%, -50%) translate(${clampedX}px, ${clampedY}px)`;
        }
        
        // Calculer la vélocité du joueur
        const intensity = clampedDistance / maxDistance;
        const velocityX = Math.cos(angle) * intensity * 200; // Vitesse maximale
        const velocityY = Math.sin(angle) * intensity * 200;
        
        // Appliquer le mouvement au joueur
        if (this.gameState.localPlayer) {
            this.characterSystem.moveCharacter(this.gameState.localPlayer.id, {
                x: velocityX,
                y: velocityY
            });
            
            // Jouer le son de pas si le joueur bouge
            if (intensity > 0.1) {
                // Jouer le son de pas de manière espacée
                if (!this.lastFootstepTime || Date.now() - this.lastFootstepTime > 500) {
                    this.audioSystem.playFootstep(this.gameState.localPlayer.position);
                    this.lastFootstepTime = Date.now();
                }
            }
        }
    }
    
    endJoystickControl() {
        this.mobileControls.joystick.active = false;
        
        // Remettre le bouton au centre
        const knob = this.mobileControls.joystick.knob;
        if (knob) {
            knob.style.transform = 'translate(-50%, -50%)';
        }
        
        // Arrêter le mouvement du joueur
        if (this.gameState.localPlayer) {
            this.characterSystem.moveCharacter(this.gameState.localPlayer.id, { x: 0, y: 0 });
        }
    }
    
    handleClick(e) {
        // Gérer les clics sur l'interface
        const target = e.target.closest('[data-action]');
        if (target) {
            // Les actions sont gérées par setupActionButtons
            return;
        }
    }
    
    handleResize() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.camera.width = canvas.width;
            this.camera.height = canvas.height;
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.audioSystem.pauseAll();
        } else {
            this.audioSystem.resumeAll();
        }
    }
    
    resumeAudioContext() {
        if (this.audioSystem && this.audioSystem.audioContext.state === 'suspended') {
            this.audioSystem.audioContext.resume();
        }
    }
    
    // Boucle de rendu
    startRenderLoop() {
        let lastTime = 0;
        
        const renderLoop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(renderLoop);
        };
        
        requestAnimationFrame(renderLoop);
    }
    
    update(deltaTime) {
        if (!this.isInitialized || this.currentScreen !== 'game-screen') return;
        
        // Mettre à jour les personnages
        if (this.characterSystem) {
            for (const [id] of this.gameState.players) {
                this.characterSystem.updateCharacter(id, deltaTime);
            }
        }
        
        // Mettre à jour la caméra
        this.updateCamera();
        
        // Mettre à jour l'audio spatial
        if (this.audioSystem && this.gameState.localPlayer) {
            this.audioSystem.updateListenerPosition(this.gameState.localPlayer.position);
        }
    }
    
    updateCamera() {
        if (!this.camera.target) return;
        
        // Suivre le joueur avec un lissage
        const targetX = this.camera.target.x;
        const targetY = this.camera.target.y;
        
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
    }
    
    render() {
        if (!this.ctx || this.currentScreen !== 'game-screen') return;
        
        // Nettoyer le canvas
        this.ctx.clearRect(0, 0, this.camera.width, this.camera.height);
        
        // Rendre la carte
        if (this.mappingSystem) {
            this.mappingSystem.render(this.ctx, this.camera);
        }
        
        // Rendre les personnages
        if (this.characterSystem) {
            this.characterSystem.render(this.ctx, this.camera);
        }
    }
    
    // Méthodes utilitaires
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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
            playerSpeed: 1,
            crewmateVision: 1,
            impostorVision: 1.5,
            killDistance: 1,
            taskBarUpdates: 'always',
            commonTasks: 1,
            longTasks: 1,
            shortTasks: 2
        };
    }
    
    // Callbacks pour les événements de jeu
    onGameStarted() {
        console.log('🎮 Game started callback');
        this.gameState.gamePhase = 'playing';
        
        // Mettre à jour l'interface
        this.updateGameUI();
        
        // Démarrer la musique de jeu
        this.audioSystem.startGameplayMusic();
    }
    
    onMeetingStarted(meeting) {
        console.log('🗣️ Meeting started callback');
        this.gameState.gamePhase = 'discussion';
        
        // Afficher l'interface de meeting
        this.showMeetingInterface(meeting);
    }
    
    onVotingStarted() {
        console.log('🗳️ Voting started callback');
        this.gameState.gamePhase = 'voting';
        
        // Afficher l'interface de vote
        this.showVotingInterface();
    }
    
    onVotingResults(results) {
        console.log('📊 Voting results callback', results);
        
        // Afficher les résultats
        this.showVotingResults(results);
    }
    
    onReturnToGame() {
        console.log('🔄 Return to game callback');
        this.gameState.gamePhase = 'playing';
        
        // Masquer les interfaces de meeting
        this.hideMeetingInterface();
        this.hideVotingInterface();
    }
    
    onGameEnded(winner, reason) {
        console.log('🏁 Game ended callback', winner, reason);
        this.gameState.gamePhase = 'ended';
        
        // Afficher l'écran de fin
        this.showGameEndScreen(winner, reason);
    }
    
    onTaskProgress(progress, completed, total) {
        console.log('📋 Task progress callback', progress);
        
        // Mettre à jour l'interface des tâches
        this.updateTaskProgress(progress, completed, total);
    }
    
    onMeetingTimerUpdate(timeLeft) {
        // Mettre à jour le timer de meeting
        this.updateMeetingTimer(timeLeft);
    }
    
    onNetworkUpdate() {
        // Mettre à jour les positions des joueurs réseau
        if (this.networkingSystem) {
            this.networkingSystem.connectedPlayers.forEach(player => {
                if (player.id !== this.gameState.localPlayer?.id) {
                    this.characterSystem.updateCharacterPosition(player.id, player.x, player.y);
                }
            });
        }
    }
    
    onChatMessage(playerName, message) {
        console.log('💬 Chat message callback', playerName, message);
        
        // Afficher le message dans le chat
        this.addChatMessage(playerName, message);
    }
    
    onNetworkGameStart(data) {
        console.log('🌐 Network game start callback');
        this.gameLogic.startGame();
    }
    
    onNetworkGameEnd(data) {
        console.log('🌐 Network game end callback');
        this.onGameEnded(data.winner, data.reason);
    }
    
    // Méthodes d'interface
    updateGameUI() {
        // Mettre à jour le HUD
        const roomCodeElement = document.getElementById('current-room-code');
        if (roomCodeElement) {
            roomCodeElement.textContent = this.gameState.roomCode;
        }
        
        const totalPlayersElement = document.getElementById('total-players');
        if (totalPlayersElement) {
            totalPlayersElement.textContent = this.gameState.players.size;
        }
    }
    
    updateTaskProgress(progress, completed, total) {
        const taskProgressElement = document.getElementById('task-progress-text');
        if (taskProgressElement) {
            taskProgressElement.textContent = `${completed}/${total}`;
        }
        
        // Mettre à jour la liste des tâches
        this.updateTaskList();
    }
    
    updateTaskList() {
        const taskItemsContainer = document.getElementById('task-items');
        if (!taskItemsContainer || !this.gameState.localPlayer) return;
        
        const tasks = this.tasksSystem.getTasksForPlayer(this.gameState.localPlayer.id);
        
        taskItemsContainer.innerHTML = tasks.map(task => `
            <div class="v4-task-item ${task.completed ? 'completed' : ''}">
                <i class="fas ${task.completed ? 'fa-check' : 'fa-circle'}"></i>
                <span>${task.name}</span>
            </div>
        `).join('');
    }
    
    showMeetingInterface(meeting) {
        // Créer l'interface de meeting
        console.log('Showing meeting interface for', meeting.type);
    }
    
    showVotingInterface() {
        // Créer l'interface de vote
        console.log('Showing voting interface');
    }
    
    showVotingResults(results) {
        // Afficher les résultats du vote
        console.log('Showing voting results', results);
    }
    
    hideMeetingInterface() {
        // Masquer l'interface de meeting
        console.log('Hiding meeting interface');
    }
    
    hideVotingInterface() {
        // Masquer l'interface de vote
        console.log('Hiding voting interface');
    }
    
    showGameEndScreen(winner, reason) {
        // Afficher l'écran de fin de partie
        console.log('Showing game end screen', winner, reason);
    }
    
    updateMeetingTimer(timeLeft) {
        // Mettre à jour le timer de meeting
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        console.log(`Meeting timer: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    
    addChatMessage(playerName, message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'v4-chat-message';
        messageElement.innerHTML = `<strong>${playerName}:</strong> ${message}`;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Afficher le chat temporairement
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.classList.add('active');
            setTimeout(() => {
                chatContainer.classList.remove('active');
            }, 5000);
        }
    }
    
    // Nettoyage
    destroy() {
        if (this.audioSystem) {
            this.audioSystem.destroy();
        }
        
        if (this.networkingSystem) {
            this.networkingSystem.disconnect();
        }
        
        console.log('🧹 Application destroyed');
    }
    
    showError(title, message) {
        console.error(`${title}: ${message}`);
        
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = `❌ ${title}: ${message}`;
            loadingText.style.color = '#ff3838';
        }
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.amongUsApp = new AmongUsV4App();
});

// Gérer les erreurs globales
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error?.stack || e.message || e);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Global unhandled:', e.reason?.stack || e.reason || e);
});
