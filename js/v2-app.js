// Among Us V2 - Enhanced Application
class AmongUsV2App {
    constructor() {
        this.currentScreen = 'main-menu-v2';
        this.isLoading = false;
        this.gameState = {
            isHost: false,
            roomCode: '',
            players: [],
            settings: this.getDefaultSettings(),
            userProfile: this.getDefaultProfile(),
            matchmaking: {
                isSearching: false,
                searchStartTime: null,
                estimatedTime: 30
            }
        };
        
        this.animations = new AmongUsV2Animations();
        this.components = new AmongUsV2Components();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateOnlinePlayerCount();
        this.showScreen('main-menu-v2');
        
        // Initialize background animations
        this.animations.initBackgroundAnimations();
        
        // Add stagger animation to menu items
        this.animations.addStaggerAnimation('.main-actions .action-card', 100);
        this.animations.addStaggerAnimation('.secondary-menu .menu-item', 50);
        
        console.log('Among Us V2 Interface initialized');
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.saveData.bind(this));
        
        // Action button listeners
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleAction(action);
            });
        });
        
        // Range slider listeners
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', this.handleSliderChange.bind(this));
        });
        
        // Room code input formatting
        const roomCodeInput = document.getElementById('room-code-input');
        if (roomCodeInput) {
            roomCodeInput.addEventListener('input', this.formatRoomCode.bind(this));
        }
        
        // Map selection
        document.querySelectorAll('.map-option').forEach(option => {
            option.addEventListener('click', this.handleMapSelection.bind(this));
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', this.handlePresetSelection.bind(this));
        });
    }
    
    handleGlobalClick(e) {
        // Close modal on overlay click
        if (e.target.classList.contains('modal-overlay')) {
            this.closeModal();
        }
        
        // Handle dropdown closing
        if (!e.target.closest('.dropdown')) {
            this.closeAllDropdowns();
        }
    }
    
    handleKeyDown(e) {
        // ESC key handling
        if (e.key === 'Escape') {
            if (document.querySelector('.modal-overlay.active')) {
                this.closeModal();
            } else if (this.currentScreen !== 'main-menu-v2') {
                this.goBackToMain();
            }
        }
        
        // Enter key for room code input
        if (e.key === 'Enter' && e.target.id === 'room-code-input') {
            this.joinWithCode();
        }
    }
    
    handleResize() {
        // Handle responsive layout changes
        this.updateLayout();
    }
    
    handleAction(action) {
        console.log('Action:', action);
        
        // Add button press animation
        const button = event.target.closest('[data-action]');
        if (button) {
            this.animations.addButtonPressEffect(button);
        }
        
        switch (action) {
            case 'quick-play':
                this.startQuickPlay();
                break;
            case 'create-room':
                this.showScreen('create-room-screen');
                break;
            case 'join-room':
                this.showScreen('join-room-screen');
                break;
            case 'customize':
                this.showCustomizeScreen();
                break;
            case 'tutorial':
                this.showTutorial();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'more':
                this.showScreen('more-options-screen');
                break;
            case 'back-to-main':
                this.goBackToMain();
                break;
            case 'cancel-search':
                this.cancelMatchmaking();
                break;
            case 'create-lobby':
                this.createLobby();
                break;
            case 'join-with-code':
                this.joinWithCode();
                break;
            case 'paste-code':
                this.pasteRoomCode();
                break;
            case 'refresh-games':
                this.refreshPublicGames();
                break;
            case 'missions':
                this.showMissions();
                break;
            case 'ranked':
                this.showRanked();
                break;
            case 'account':
                this.showAccount();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'credits':
                this.showCredits();
                break;
            case 'exit':
                this.confirmExit();
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    handleSliderChange(e) {
        const slider = e.target;
        const valueDisplay = slider.parentNode.querySelector('.slider-value');
        
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
        
        // Update game settings
        this.updateSetting(slider.id, slider.value);
        
        // Add visual feedback
        this.animations.addSliderFeedback(slider);
    }
    
    formatRoomCode(e) {
        const input = e.target;
        let value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
        
        if (value.length > 6) {
            value = value.substring(0, 6);
        }
        
        input.value = value;
        
        // Auto-join if 6 characters entered
        if (value.length === 6) {
            setTimeout(() => this.joinWithCode(), 500);
        }
    }
    
    handleMapSelection(e) {
        const option = e.target.closest('.map-option');
        if (!option) return;
        
        // Remove active class from all options
        document.querySelectorAll('.map-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Add active class to selected option
        option.classList.add('active');
        
        // Update game settings
        const mapId = option.dataset.map;
        this.updateSetting('selectedMap', mapId);
        
        // Add selection animation
        this.animations.addSelectionEffect(option);
    }
    
    handlePresetSelection(e) {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;
        
        // Remove active class from all presets
        document.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to selected preset
        btn.classList.add('active');
        
        // Apply preset settings
        const preset = btn.dataset.preset;
        this.applyPreset(preset);
        
        // Add selection animation
        this.animations.addSelectionEffect(btn);
    }
    
    showScreen(screenId) {
        const currentScreenElement = document.querySelector('.screen.active');
        const newScreenElement = document.getElementById(screenId);
        
        if (!newScreenElement) {
            console.error('Screen not found:', screenId);
            return;
        }
        
        // Hide current screen
        if (currentScreenElement) {
            currentScreenElement.classList.remove('active');
            currentScreenElement.classList.add('slide-left');
            
            setTimeout(() => {
                currentScreenElement.classList.remove('slide-left');
            }, 300);
        }
        
        // Show new screen with animation
        setTimeout(() => {
            newScreenElement.classList.add('active');
            this.currentScreen = screenId;
            this.updateScreenContent(screenId);
            
            // Add entrance animation
            this.animations.addScreenEntranceAnimation(newScreenElement);
        }, 150);
    }
    
    updateScreenContent(screenId) {
        switch (screenId) {
            case 'quick-play-screen':
                this.updateQuickPlayScreen();
                break;
            case 'create-room-screen':
                this.updateCreateRoomScreen();
                break;
            case 'join-room-screen':
                this.updateJoinRoomScreen();
                break;
            case 'more-options-screen':
                this.updateMoreOptionsScreen();
                break;
        }
    }
    
    startQuickPlay() {
        this.showScreen('quick-play-screen');
        this.startMatchmaking();
    }
    
    startMatchmaking() {
        this.gameState.matchmaking.isSearching = true;
        this.gameState.matchmaking.searchStartTime = Date.now();
        
        // Update UI
        this.updateMatchmakingStatus('Recherche en cours...', 'Recherche de joueurs dans votre région');
        
        // Start progress animation
        this.animations.startProgressAnimation();
        
        // Simulate matchmaking process
        this.simulateMatchmaking();
    }
    
    simulateMatchmaking() {
        const phases = [
            { time: 2000, status: 'Recherche en cours...', detail: 'Recherche de joueurs dans votre région' },
            { time: 5000, status: 'Joueurs trouvés!', detail: 'Vérification de la compatibilité' },
            { time: 8000, status: 'Création de la partie...', detail: 'Configuration du serveur' },
            { time: 10000, status: 'Connexion...', detail: 'Rejoindre la partie' }
        ];
        
        phases.forEach((phase, index) => {
            setTimeout(() => {
                if (this.gameState.matchmaking.isSearching) {
                    this.updateMatchmakingStatus(phase.status, phase.detail);
                    
                    if (index === phases.length - 1) {
                        // Simulate successful match
                        setTimeout(() => {
                            this.onMatchFound();
                        }, 2000);
                    }
                }
            }, phase.time);
        });
    }
    
    onMatchFound() {
        this.gameState.matchmaking.isSearching = false;
        this.showToast('Partie trouvée! Connexion en cours...', 'success');
        
        // Simulate joining game
        setTimeout(() => {
            this.showToast('Connexion réussie!', 'success');
            this.goBackToMain();
        }, 2000);
    }
    
    cancelMatchmaking() {
        this.gameState.matchmaking.isSearching = false;
        this.animations.stopProgressAnimation();
        this.showToast('Recherche annulée', 'info');
        this.goBackToMain();
    }
    
    updateMatchmakingStatus(status, detail) {
        const statusElement = document.getElementById('search-status');
        const detailElement = document.getElementById('search-details');
        
        if (statusElement) statusElement.textContent = status;
        if (detailElement) detailElement.textContent = detail;
    }
    
    createLobby() {
        this.showLoadingScreen('Création de la partie...');
        
        // Simulate lobby creation
        setTimeout(() => {
            this.gameState.isHost = true;
            this.gameState.roomCode = this.generateRoomCode();
            
            this.hideLoadingScreen();
            this.showToast(`Partie créée! Code: ${this.gameState.roomCode}`, 'success');
            this.goBackToMain();
        }, 2000);
    }
    
    joinWithCode() {
        const input = document.getElementById('room-code-input');
        const code = input.value.trim();
        
        if (code.length !== 6) {
            this.showToast('Le code doit contenir 6 lettres', 'error');
            this.animations.addErrorShake(input);
            return;
        }
        
        this.showLoadingScreen('Connexion à la partie...');
        
        // Simulate joining
        setTimeout(() => {
            // Simulate random success/failure
            const success = Math.random() > 0.3;
            
            this.hideLoadingScreen();
            
            if (success) {
                this.gameState.roomCode = code;
                this.showToast('Connexion réussie!', 'success');
                this.goBackToMain();
            } else {
                this.showToast('Partie introuvable ou pleine', 'error');
                this.animations.addErrorShake(input);
            }
        }, 2000);
    }
    
    pasteRoomCode() {
        if (navigator.clipboard) {
            navigator.clipboard.readText().then(text => {
                const input = document.getElementById('room-code-input');
                input.value = text.toUpperCase().substring(0, 6);
                this.formatRoomCode({ target: input });
                this.showToast('Code collé!', 'success');
            }).catch(() => {
                this.showToast('Impossible de coller le code', 'error');
            });
        }
    }
    
    refreshPublicGames() {
        const button = event.target.closest('.refresh-games-btn');
        this.animations.addSpinAnimation(button.querySelector('i'));
        
        // Simulate refresh
        setTimeout(() => {
            this.updatePublicGamesList();
            this.showToast('Liste actualisée', 'success');
        }, 1000);
    }
    
    updatePublicGamesList() {
        // Simulate updating the games list with random data
        const gamesList = document.querySelector('.games-list');
        if (!gamesList) return;
        
        const maps = ['The Skeld', 'Polus', 'Airship', 'The Fungle'];
        const games = [];
        
        for (let i = 0; i < 3; i++) {
            games.push({
                map: maps[Math.floor(Math.random() * maps.length)],
                players: `${Math.floor(Math.random() * 10) + 4}/${Math.floor(Math.random() * 5) + 10}`,
                ping: `${Math.floor(Math.random() * 100) + 20}ms`
            });
        }
        
        gamesList.innerHTML = games.map(game => `
            <div class="game-item">
                <div class="game-info">
                    <div class="game-map">${game.map}</div>
                    <div class="game-players">${game.players}</div>
                    <div class="game-ping">${game.ping}</div>
                </div>
                <button class="join-game-btn">Rejoindre</button>
            </div>
        `).join('');
    }
    
    applyPreset(preset) {
        const presets = {
            classic: {
                maxPlayers: 10,
                impostors: 2,
                selectedMap: 'skeld'
            },
            quick: {
                maxPlayers: 8,
                impostors: 1,
                selectedMap: 'skeld'
            },
            long: {
                maxPlayers: 15,
                impostors: 3,
                selectedMap: 'airship'
            },
            custom: {
                maxPlayers: 10,
                impostors: 2,
                selectedMap: 'skeld'
            }
        };
        
        const settings = presets[preset];
        if (settings) {
            // Update sliders
            const maxPlayersSlider = document.getElementById('max-players-v2');
            const impostorsSlider = document.getElementById('impostors-v2');
            
            if (maxPlayersSlider) {
                maxPlayersSlider.value = settings.maxPlayers;
                this.handleSliderChange({ target: maxPlayersSlider });
            }
            
            if (impostorsSlider) {
                impostorsSlider.value = settings.impostors;
                this.handleSliderChange({ target: impostorsSlider });
            }
            
            // Update map selection
            document.querySelectorAll('.map-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.map === settings.selectedMap) {
                    opt.classList.add('active');
                }
            });
        }
    }
    
    showLoadingScreen(message) {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingText) loadingText.textContent = message;
        if (loadingScreen) {
            loadingScreen.classList.add('active');
            this.animations.startLoadingAnimation();
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            this.animations.stopLoadingAnimation();
        }
    }
    
    goBackToMain() {
        this.showScreen('main-menu-v2');
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const container = this.getOrCreateToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast-v2 ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close-v2">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Add close functionality
        toast.querySelector('.toast-close-v2').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }
    
    getOrCreateToastContainer() {
        let container = document.querySelector('.toast-container-v2');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container-v2';
            document.body.appendChild(container);
        }
        return container;
    }
    
    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    showModal(content, title = '') {
        const overlay = document.getElementById('modal-overlay-v2');
        const modalContent = document.querySelector('.modal-content-v2');
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="app.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        `;
        
        overlay.classList.add('active');
    }
    
    closeModal() {
        const overlay = document.getElementById('modal-overlay-v2');
        overlay.classList.remove('active');
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
    
    updateOnlinePlayerCount() {
        const counter = document.getElementById('online-players');
        if (counter) {
            // Simulate online player count
            const count = Math.floor(Math.random() * 20000) + 10000;
            counter.textContent = count.toLocaleString();
        }
        
        // Update every 30 seconds
        setTimeout(() => this.updateOnlinePlayerCount(), 30000);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    updateSetting(key, value) {
        if (this.gameState.settings[key] !== undefined) {
            this.gameState.settings[key] = value;
            console.log(`Setting updated: ${key} = ${value}`);
        }
    }
    
    updateLayout() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
    }
    
    getDefaultSettings() {
        return {
            maxPlayers: 10,
            impostors: 2,
            selectedMap: 'skeld',
            privacy: 'public',
            region: 'auto'
        };
    }
    
    getDefaultProfile() {
        return {
            displayName: 'Player',
            color: 'red',
            hat: 'none',
            pet: 'none',
            skin: 'none'
        };
    }
    
    loadSavedData() {
        try {
            const saved = localStorage.getItem('amongus-v2-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...data };
            }
        } catch (error) {
            console.warn('Failed to load saved data:', error);
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('amongus-v2-data', JSON.stringify(this.gameState));
        } catch (error) {
            console.warn('Failed to save data:', error);
        }
    }
    
    // Placeholder methods for future implementation
    showCustomizeScreen() { this.showToast('Personnalisation bientôt disponible!', 'info'); }
    showTutorial() { this.showToast('Tutoriel bientôt disponible!', 'info'); }
    showSettings() { this.showToast('Paramètres bientôt disponibles!', 'info'); }
    showMissions() { this.showToast('Missions bientôt disponibles!', 'info'); }
    showRanked() { this.showToast('Mode classé bientôt disponible!', 'info'); }
    showAccount() { this.showToast('Compte bientôt disponible!', 'info'); }
    showHelp() { this.showToast('Aide bientôt disponible!', 'info'); }
    showCredits() { this.showToast('Crédits bientôt disponibles!', 'info'); }
    
    confirmExit() {
        if (confirm('Êtes-vous sûr de vouloir quitter?')) {
            window.close();
        }
    }
    
    updateQuickPlayScreen() {
        // Update quick play screen content
    }
    
    updateCreateRoomScreen() {
        // Update create room screen content
    }
    
    updateJoinRoomScreen() {
        this.updatePublicGamesList();
    }
    
    updateMoreOptionsScreen() {
        // Update more options screen content
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AmongUsV2App();
});

// Handle PWA installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}