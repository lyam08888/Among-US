// Among Us Interface - Main Application
class AmongUsApp {
    constructor() {
        this.currentScreen = 'main-menu';
        this.gameState = {
            isHost: false,
            roomCode: '',
            players: [],
            settings: this.getDefaultSettings(),
            cosmetics: this.getDefaultCosmetics(),
            missions: this.getDefaultMissions(),
            userProfile: this.getDefaultProfile()
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateUI();
        this.showScreen('main-menu');
        
        // Initialize components
        this.navigation = new Navigation(this);
        this.lobby = new Lobby(this);
        this.matchmaking = new Matchmaking(this);
        this.cosmetics = new Cosmetics(this);
        this.settings = new Settings(this);
        this.hud = new HUD(this);
        
        // Make components available globally for onclick handlers
        window.lobby = this.lobby;
        window.matchmaking = this.matchmaking;
        window.cosmetics = this.cosmetics;
        window.settings = this.settings;
        window.hud = this.hud;
        
        console.log('Among Us Interface initialized');
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('beforeunload', this.saveData.bind(this));
        
        // Menu button listeners
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                this.handleAction(action);
            });
        });
        
        // Range input listeners for real-time updates
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', this.handleSliderChange.bind(this));
        });
        
        // Copy code button
        const copyCodeBtn = document.querySelector('.copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', this.copyRoomCode.bind(this));
        }
        
        // PWA install button
        const pwaInstallBtn = document.getElementById('pwa-install');
        if (pwaInstallBtn) {
            pwaInstallBtn.addEventListener('click', this.installPWA.bind(this));
        }
    }
    
    handleGlobalClick(e) {
        // Handle modal closing
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
            } else if (this.currentScreen !== 'main-menu') {
                this.showScreen('main-menu');
            }
        }
        
        // Enter key for quick actions
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('btn-large')) {
                activeElement.click();
            }
        }
    }
    
    handleResize() {
        // Handle responsive layout changes
        this.updateLayout();
    }
    
    handleAction(action) {
        console.log('Action:', action);
        
        switch (action) {
            case 'matchmaking_quick':
                this.showScreen('matchmaking-screen');
                break;
            case 'goto_lobby':
                this.createLobby();
                break;
            case 'goto_cosmetics':
                this.showScreen('cosmetics-screen');
                break;
            case 'goto_missions':
                this.showScreen('missions-screen');
                this.loadMissions();
                break;
            case 'goto_ranked':
                this.showScreen('ranked-screen');
                break;
            case 'goto_tutorial':
                this.showTutorial();
                break;
            case 'goto_settings':
                this.showScreen('settings-screen');
                break;
            case 'goto_account':
                this.showScreen('account-screen');
                break;
            case 'goto_help':
                this.showScreen('help-screen');
                break;
            case 'show_credits':
                this.showCredits();
                break;
            case 'confirm_exit':
                this.confirmExit();
                break;
            case 'goto_main':
                this.showScreen('main-menu');
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    handleSliderChange(e) {
        const slider = e.target;
        const displayElement = document.getElementById(slider.id + '-display');
        
        if (displayElement) {
            let value = slider.value;
            let suffix = '';
            
            // Add appropriate suffix based on slider type
            if (slider.id.includes('cooldown') || slider.id.includes('time')) {
                suffix = 's';
            } else if (slider.id.includes('vision') || slider.id.includes('speed')) {
                suffix = 'x';
            } else if (slider.id.includes('players')) {
                // Handle player range display
                const minSlider = document.getElementById('mm-players-min');
                const maxSlider = document.getElementById('mm-players-max');
                if (minSlider && maxSlider) {
                    displayElement.textContent = `${minSlider.value}-${maxSlider.value}`;
                    return;
                }
            }
            
            displayElement.textContent = value + suffix;
        }
        
        // Update game settings
        this.updateSetting(slider.id, slider.value);
    }
    
    showScreen(screenId) {
        // Hide current screen
        const currentScreenElement = document.querySelector('.screen.active');
        if (currentScreenElement) {
            currentScreenElement.classList.remove('active');
            currentScreenElement.classList.add('slide-left');
            
            setTimeout(() => {
                currentScreenElement.classList.remove('slide-left');
            }, 300);
        }
        
        // Show new screen
        const newScreenElement = document.getElementById(screenId);
        if (newScreenElement) {
            setTimeout(() => {
                newScreenElement.classList.add('active');
                this.currentScreen = screenId;
                this.updateScreenContent(screenId);
            }, 150);
        }
    }
    
    updateScreenContent(screenId) {
        switch (screenId) {
            case 'lobby-screen':
                this.lobby.updateDisplay();
                break;
            case 'cosmetics-screen':
                this.cosmetics.updateDisplay();
                break;
            case 'settings-screen':
                this.settings.updateDisplay();
                break;
            case 'missions-screen':
                this.updateMissionsDisplay();
                break;
            case 'account-screen':
                this.updateAccountDisplay();
                break;
            case 'help-screen':
                this.updateHelpDisplay();
                break;
        }
    }
    
    createLobby() {
        this.gameState.isHost = true;
        this.gameState.roomCode = this.generateRoomCode();
        this.gameState.players = [{
            id: 'host',
            name: this.gameState.userProfile.displayName,
            color: 'red',
            isHost: true,
            isReady: true
        }];
        
        this.showScreen('lobby-screen');
        this.showToast('Salon créé avec le code: ' + this.gameState.roomCode, 'success');
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    copyRoomCode() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.gameState.roomCode).then(() => {
                this.showToast('Code copié dans le presse-papiers!', 'success');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.gameState.roomCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Code copié!', 'success');
        }
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = this.getOrCreateToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
    }
    
    getOrCreateToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    removeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    showModal(content, title = '') {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        `;
        
        overlay.classList.add('active');
        
        // Add close functionality
        modalContent.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }
    
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
    }
    
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
    
    updateSetting(key, value) {
        // Update the game settings
        if (this.gameState.settings[key] !== undefined) {
            this.gameState.settings[key] = value;
            console.log(`Setting updated: ${key} = ${value}`);
        }
    }
    
    updateLayout() {
        // Handle responsive layout updates
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
        
        // Update grid layouts
        this.updateGridLayouts();
    }
    
    updateGridLayouts() {
        // Update cosmetics grid
        const cosmeticsGrid = document.getElementById('cosmetics-grid');
        if (cosmeticsGrid) {
            // Grid layout is handled by CSS, but we can adjust item counts here if needed
        }
        
        // Update player list
        const playerList = document.getElementById('player-list');
        if (playerList) {
            // Player list layout updates
        }
    }
    
    loadMissions() {
        // Load and display missions
        this.updateMissionsDisplay();
    }
    
    updateMissionsDisplay() {
        const missionsContainer = document.querySelector('.missions-container');
        if (!missionsContainer) return;
        
        const dailyMissions = this.gameState.missions.daily;
        const weeklyMissions = this.gameState.missions.weekly;
        
        missionsContainer.innerHTML = `
            <div class="mission-section">
                <h3>Missions Quotidiennes</h3>
                ${dailyMissions.map(mission => this.createMissionCard(mission)).join('')}
            </div>
            <div class="mission-section">
                <h3>Missions Hebdomadaires</h3>
                ${weeklyMissions.map(mission => this.createMissionCard(mission)).join('')}
            </div>
        `;
    }
    
    createMissionCard(mission) {
        const progress = mission.progress || 0;
        const target = mission.target || 1;
        const progressPercent = Math.min((progress / target) * 100, 100);
        const isCompleted = progress >= target;
        
        return `
            <div class="mission-card ${isCompleted ? 'completed' : ''}">
                <div class="mission-description">${mission.desc}</div>
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${progress}/${target}</span>
                </div>
                <div class="mission-reward">
                    <span>Récompense:</span>
                    <span class="reward-amount">${mission.reward} coins</span>
                    <button class="claim-btn" ${!isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? 'Réclamer' : 'En cours'}
                    </button>
                </div>
            </div>
        `;
    }
    
    updateAccountDisplay() {
        // Update account screen content
        const accountContainer = document.querySelector('.account-container');
        if (!accountContainer) return;
        
        const profile = this.gameState.userProfile;
        
        accountContainer.innerHTML = `
            <div class="account-section">
                <h3>👤 Profil</h3>
                <div class="profile-info">
                    <div class="profile-avatar">${profile.displayName.charAt(0).toUpperCase()}</div>
                    <div class="profile-details">
                        <h4>${profile.displayName}</h4>
                        <div class="profile-id">ID: ${profile.idShort}</div>
                    </div>
                </div>
            </div>
            <div class="account-section">
                <h3>🔒 Sécurité</h3>
                <div class="security-item">
                    <div>
                        <strong>Authentification à deux facteurs</strong>
                        <div class="security-status">
                            <div class="status-dot ${profile.twoFactorEnabled ? 'enabled' : ''}"></div>
                            <span>${profile.twoFactorEnabled ? 'Activée' : 'Désactivée'}</span>
                        </div>
                    </div>
                    <button class="link-account-btn">
                        ${profile.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                    </button>
                </div>
            </div>
            <div class="account-section">
                <h3>🔗 Comptes liés</h3>
                <div class="security-item">
                    <div>
                        <strong>Email</strong>
                        <div>${profile.email || 'Non lié'}</div>
                    </div>
                    <button class="link-account-btn">
                        ${profile.email ? 'Modifier' : 'Lier'}
                    </button>
                </div>
            </div>
            <div class="account-section danger-zone">
                <h3>⚠️ Zone de danger</h3>
                <button class="danger-btn">Supprimer le compte</button>
            </div>
        `;
    }
    
    updateHelpDisplay() {
        // Update help screen content
        const helpContainer = document.querySelector('.help-container');
        if (!helpContainer) return;
        
        helpContainer.innerHTML = `
            <div class="help-sections">
                <div class="help-section" onclick="app.showHelpSection('rules')">
                    <h3>📋 Règles de base</h3>
                    <p>Apprenez les règles fondamentales d'Among Us et comment jouer.</p>
                </div>
                <div class="help-section" onclick="app.showHelpSection('roles')">
                    <h3>🎭 Rôles & Pouvoirs</h3>
                    <p>Découvrez tous les rôles disponibles et leurs capacités spéciales.</p>
                </div>
                <div class="help-section" onclick="app.showHelpSection('maps')">
                    <h3>🗺️ Cartes & Systèmes</h3>
                    <p>Explorez les différentes cartes et leurs systèmes uniques.</p>
                </div>
                <div class="help-section" onclick="app.showHelpSection('controls')">
                    <h3>🎮 Commandes</h3>
                    <p>Maîtrisez les contrôles tactiles et clavier.</p>
                </div>
                <div class="help-section" onclick="app.showHelpSection('safety')">
                    <h3>🛡️ Sécurité & Modération</h3>
                    <p>Informations sur la sécurité et comment signaler des problèmes.</p>
                </div>
                <div class="help-section" onclick="app.showHelpSection('faq')">
                    <h3>❓ FAQ</h3>
                    <p>Réponses aux questions les plus fréquemment posées.</p>
                </div>
            </div>
            <div class="contact-support">
                <h3>Besoin d'aide supplémentaire?</h3>
                <button class="support-btn" onclick="app.contactSupport()">Contacter le support</button>
            </div>
        `;
    }
    
    showHelpSection(section) {
        // Show specific help section in modal
        const content = this.getHelpContent(section);
        this.showModal(content, this.getHelpTitle(section));
    }
    
    getHelpContent(section) {
        const helpContent = {
            rules: `
                <h4>Objectifs de base</h4>
                <p><strong>Équipiers:</strong> Terminez toutes les tâches ou éliminez tous les imposteurs.</p>
                <p><strong>Imposteurs:</strong> Éliminez tous les équipiers ou sabotez le vaisseau.</p>
                
                <h4>Gameplay</h4>
                <ul>
                    <li>Déplacez-vous dans le vaisseau et accomplissez vos tâches</li>
                    <li>Signalez les corps ou appelez des réunions d'urgence</li>
                    <li>Discutez et votez pour éjecter les suspects</li>
                    <li>Utilisez les systèmes de surveillance pour détecter les imposteurs</li>
                </ul>
            `,
            roles: `
                <h4>Rôles d'équipiers</h4>
                <p><strong>Scientifique:</strong> Peut consulter les signes vitaux depuis n'importe où</p>
                <p><strong>Ingénieur:</strong> Peut utiliser les conduits de ventilation</p>
                <p><strong>Ange Gardien:</strong> Peut protéger un joueur (fantôme uniquement)</p>
                
                <h4>Rôles d'imposteurs</h4>
                <p><strong>Métamorphe:</strong> Peut prendre l'apparence d'autres joueurs</p>
                <p><strong>Imposteur classique:</strong> Peut tuer et saboter</p>
            `,
            maps: `
                <h4>The Skeld</h4>
                <p>Le vaisseau spatial classique avec des systèmes O2 et Réacteur.</p>
                
                <h4>Mira HQ</h4>
                <p>Station spatiale avec système de décontamination et capteurs.</p>
                
                <h4>Polus</h4>
                <p>Base polaire avec systèmes sismiques et laboratoires.</p>
                
                <h4>Airship</h4>
                <p>Dirigeable avec échelles, plateformes mobiles et systèmes complexes.</p>
                
                <h4>The Fungle</h4>
                <p>Jungle mystérieuse avec champignons et systèmes de spores.</p>
            `,
            controls: `
                <h4>Contrôles tactiles</h4>
                <ul>
                    <li>Joystick virtuel pour se déplacer</li>
                    <li>Bouton "Utiliser" pour interagir</li>
                    <li>Bouton "Report" pour signaler</li>
                    <li>Boutons spéciaux selon le rôle</li>
                </ul>
                
                <h4>Raccourcis clavier</h4>
                <ul>
                    <li>WASD ou flèches pour se déplacer</li>
                    <li>E pour utiliser/interagir</li>
                    <li>R pour signaler</li>
                    <li>Q pour tuer (imposteur)</li>
                    <li>Tab pour la carte</li>
                </ul>
            `,
            safety: `
                <h4>Signalement</h4>
                <p>Utilisez le bouton de signalement dans le profil d'un joueur pour signaler un comportement inapproprié.</p>
                
                <h4>Types de signalements</h4>
                <ul>
                    <li>Harcèlement ou intimidation</li>
                    <li>Langage inapproprié</li>
                    <li>Triche ou exploitation</li>
                    <li>Spam ou publicité</li>
                </ul>
                
                <h4>Mode Streamer</h4>
                <p>Activez le mode streamer dans les paramètres pour masquer les codes de salon et anonymiser les noms.</p>
            `,
            faq: `
                <h4>Questions fréquentes</h4>
                
                <p><strong>Q: Comment rejoindre une partie?</strong></p>
                <p>A: Utilisez "Jouer (Rapide)" pour le matchmaking automatique ou "Partie Personnalisée" avec un code.</p>
                
                <p><strong>Q: Pourquoi ne puis-je pas me connecter?</strong></p>
                <p>A: Vérifiez votre connexion internet et la région sélectionnée.</p>
                
                <p><strong>Q: Comment débloquer des cosmétiques?</strong></p>
                <p>A: Terminez des missions quotidiennes et hebdomadaires pour gagner des pièces.</p>
                
                <p><strong>Q: Le jeu est-il gratuit?</strong></p>
                <p>A: Oui, le jeu de base est gratuit avec des cosmétiques premium optionnels.</p>
            `
        };
        
        return helpContent[section] || '<p>Contenu non disponible.</p>';
    }
    
    getHelpTitle(section) {
        const titles = {
            rules: 'Règles de base',
            roles: 'Rôles & Pouvoirs',
            maps: 'Cartes & Systèmes',
            controls: 'Commandes',
            safety: 'Sécurité & Modération',
            faq: 'Questions fréquentes'
        };
        
        return titles[section] || 'Aide';
    }
    
    contactSupport() {
        this.showModal(`
            <form class="support-form">
                <div class="form-group">
                    <label for="support-category">Catégorie:</label>
                    <select id="support-category" required>
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="bug">Signaler un bug</option>
                        <option value="account">Problème de compte</option>
                        <option value="gameplay">Question de gameplay</option>
                        <option value="other">Autre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="support-message">Message:</label>
                    <textarea id="support-message" rows="5" required placeholder="Décrivez votre problème..."></textarea>
                </div>
                <button type="submit" class="btn-large primary">Envoyer</button>
            </form>
        `, 'Contacter le support');
    }
    
    showCredits() {
        const creditsContent = `
            <div class="credits-content">
                <h4>Développement</h4>
                <p>Interface prototype développée pour Among Us</p>
                
                <h4>Design</h4>
                <p>Interface utilisateur inspirée du jeu original Among Us</p>
                
                <h4>Technologies utilisées</h4>
                <ul>
                    <li>HTML5, CSS3, JavaScript</li>
                    <li>Design responsive</li>
                    <li>Progressive Web App</li>
                </ul>
                
                <h4>Remerciements</h4>
                <p>Merci à InnerSloth pour le jeu original Among Us</p>
                
                <div class="version-info">
                    <p>Version: 1.0.0 (wmh5)</p>
                    <p>Build: ${new Date().toISOString().split('T')[0]}</p>
                </div>
            </div>
        `;
        
        this.showModal(creditsContent, 'Crédits');
    }
    
    showTutorial() {
        this.showModal(`
            <div class="tutorial-content">
                <h4>Bienvenue dans Among Us!</h4>
                <p>Ce tutoriel vous guidera à travers les bases du jeu.</p>
                
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <h5>1. Rejoindre une partie</h5>
                        <p>Utilisez "Jouer (Rapide)" pour une partie automatique ou créez votre propre salon.</p>
                    </div>
                    
                    <div class="tutorial-step">
                        <h5>2. Accomplir des tâches</h5>
                        <p>En tant qu'équipier, terminez toutes vos tâches pour gagner.</p>
                    </div>
                    
                    <div class="tutorial-step">
                        <h5>3. Identifier les imposteurs</h5>
                        <p>Observez les autres joueurs et signalez les comportements suspects.</p>
                    </div>
                    
                    <div class="tutorial-step">
                        <h5>4. Voter et discuter</h5>
                        <p>Participez aux réunions pour éliminer les imposteurs.</p>
                    </div>
                </div>
                
                <button class="btn-large primary" onclick="app.closeModal()">Commencer à jouer</button>
            </div>
        `, 'Tutoriel');
    }
    
    confirmExit() {
        this.showModal(`
            <div class="confirm-dialog">
                <p>Êtes-vous sûr de vouloir quitter Among Us?</p>
                <div class="confirm-actions">
                    <button class="btn-large danger" onclick="window.close()">Quitter</button>
                    <button class="btn-large" onclick="app.closeModal()">Annuler</button>
                </div>
            </div>
        `, 'Confirmer la sortie');
    }
    
    installPWA() {
        // PWA installation logic would go here
        this.showToast('Installation PWA non disponible dans cette démo', 'info');
    }
    
    updateUI() {
        // Update various UI elements based on current state
        this.updateRoomCodeDisplay();
        this.updatePlayerCount();
        this.updateServerStatus();
    }
    
    updateRoomCodeDisplay() {
        const roomCodeDisplay = document.getElementById('room-code-display');
        if (roomCodeDisplay) {
            roomCodeDisplay.textContent = this.gameState.roomCode || 'XXXXXX';
        }
    }
    
    updatePlayerCount() {
        const playerCountElements = document.querySelectorAll('.player-count');
        playerCountElements.forEach(element => {
            element.textContent = `${this.gameState.players.length}/10`;
        });
    }
    
    updateServerStatus() {
        const statusChip = document.querySelector('.status-chip');
        if (statusChip) {
            // Simulate server status
            statusChip.className = 'status-chip online';
            statusChip.textContent = 'Serveurs en ligne';
        }
    }
    
    saveData() {
        // Save game state to localStorage
        try {
            localStorage.setItem('amongus-gamestate', JSON.stringify(this.gameState));
            localStorage.setItem('amongus-settings', JSON.stringify(this.gameState.settings));
        } catch (e) {
            console.warn('Could not save data to localStorage:', e);
        }
    }
    
    loadSavedData() {
        // Load saved data from localStorage
        try {
            const savedGameState = localStorage.getItem('amongus-gamestate');
            const savedSettings = localStorage.getItem('amongus-settings');
            
            if (savedGameState) {
                const parsed = JSON.parse(savedGameState);
                this.gameState = { ...this.gameState, ...parsed };
            }
            
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.gameState.settings = { ...this.gameState.settings, ...parsed };
            }
        } catch (e) {
            console.warn('Could not load saved data:', e);
        }
    }
    
    getDefaultSettings() {
        return {
            // General
            privacy: 'private',
            region: 'auto',
            map: 'the_skeld',
            maxPlayers: 10,
            numImpostors: 2,
            
            // Tasks & Vision
            commonTasks: 2,
            shortTasks: 3,
            longTasks: 2,
            visualTasks: false,
            crewVision: 0.8,
            impostorVision: 1.1,
            lightsSabotage: 'med',
            
            // Timers
            killCooldown: 27,
            emergencyCooldown: 15,
            emergencyMeetings: 1,
            discussionTime: 45,
            votingTime: 75,
            anonymousVotes: false,
            
            // Votes
            confirmEjects: false,
            ejectTie: 'none',
            skipTies: false,
            voteVisibility: 'public',
            
            // Advanced
            taskbarUpdates: 'meetings',
            roleReveal: 'alignment',
            ghostSpeed: 1.0,
            playerSpeed: 1.1,
            killDistance: 'short',
            commsDisable: ['tasks_ui', 'cams'],
            doorsLock: 10,
            
            // Audio
            masterVolume: 80,
            musicVolume: 50,
            sfxVolume: 90,
            voiceChatEnabled: false,
            voiceVolume: 70,
            pushToTalk: true,
            
            // Display
            qualityMode: 'balanced',
            fpsCap: 60,
            dprCap: 1.25,
            postFx: true,
            screenMode: 'fullscreen',
            colorblindIcons: true,
            
            // Accessibility
            textScale: 1.0,
            reduceMotion: false,
            highContrast: false,
            chatFilters: true
        };
    }
    
    getDefaultCosmetics() {
        return {
            equipped: {
                color: 'red',
                hat: 'none',
                skin: 'none',
                visor: 'none',
                pet: 'none',
                nameplate: 'none'
            },
            owned: ['red', 'blue', 'green', 'pink', 'orange', 'yellow', 'black', 'white', 'purple', 'brown', 'cyan', 'lime'],
            currency: 1000
        };
    }
    
    getDefaultMissions() {
        return {
            daily: [
                { id: 'fix_3_sabotages', desc: 'Répare 3 sabotages', reward: 50, progress: 1, target: 3 },
                { id: 'win_as_impostor', desc: 'Gagne 1 partie en imposteur', reward: 100, progress: 0, target: 1 }
            ],
            weekly: [
                { id: 'complete_60_tasks', desc: 'Termine 60 tâches', reward: 300, progress: 23, target: 60 }
            ]
        };
    }
    
    getDefaultProfile() {
        return {
            displayName: 'Joueur',
            idShort: 'ABCDE1',
            email: null,
            twoFactorEnabled: false,
            streamerMode: false,
            dnd: false,
            friendRequests: 'friends_of_friends'
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AmongUsApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmongUsApp;
}