// Among Us Interface - Lobby Module
class Lobby {
    constructor(app) {
        this.app = app;
        this.activeTab = 'general';
        this.playerColors = ['red', 'blue', 'green', 'pink', 'orange', 'yellow', 'black', 'white', 'purple', 'brown', 'cyan', 'lime'];
        
        this.init();
    }
    
    init() {
        this.setupTabNavigation();
        this.setupSettingsListeners();
        this.setupPlayerListeners();
        this.setupHostControls();
    }
    
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.lobby-settings .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }
    
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.lobby-settings .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');
        
        this.activeTab = tabId;
        this.updateTabContent(tabId);
    }
    
    updateTabContent(tabId) {
        switch (tabId) {
            case 'general':
                this.updateGeneralTab();
                break;
            case 'roles':
                this.updateRolesTab();
                break;
            case 'tasks':
                this.updateTasksTab();
                break;
            case 'timers':
                this.updateTimersTab();
                break;
            case 'votes':
                this.updateVotesTab();
                break;
            case 'advanced':
                this.updateAdvancedTab();
                break;
            case 'invite':
                this.updateInviteTab();
                break;
        }
    }
    
    setupSettingsListeners() {
        // Range sliders
        document.querySelectorAll('#lobby-screen input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.handleSettingChange(e.target.id, e.target.value);
                this.updateSliderDisplay(e.target);
            });
        });
        
        // Select dropdowns
        document.querySelectorAll('#lobby-screen select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.id, e.target.value);
            });
        });
        
        // Checkboxes
        document.querySelectorAll('#lobby-screen input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.id, e.target.checked);
            });
        });
        
        // Number inputs
        document.querySelectorAll('#lobby-screen input[type="number"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.id, e.target.value);
            });
        });
    }
    
    setupPlayerListeners() {
        // Start game button
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Player list interactions will be set up when players are added
    }
    
    setupHostControls() {
        // Shuffle colors
        const shuffleBtn = document.getElementById('shuffle-colors');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.shufflePlayerColors();
            });
        }
        
        // Toggle privacy
        const privacyBtn = document.getElementById('toggle-privacy');
        if (privacyBtn) {
            privacyBtn.addEventListener('click', () => {
                this.togglePrivacy();
            });
        }
        
        // Copy code
        const copyCodeBtn = document.querySelector('.copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                this.app.copyRoomCode();
            });
        }
    }
    
    handleSettingChange(settingId, value) {
        // Update the game state
        this.app.updateSetting(settingId, value);
        
        // Handle special cases
        switch (settingId) {
            case 'max-players':
                this.updatePlayerSlots(parseInt(value));
                break;
            case 'num-impostors':
                this.validateImpostorCount(parseInt(value));
                break;
            case 'privacy-setting':
                this.updatePrivacySetting(value);
                break;
        }
        
        // Update start button state
        this.updateStartButtonState();
    }
    
    updateSliderDisplay(slider) {
        const displayElement = document.getElementById(slider.id + '-display');
        if (!displayElement) return;
        
        let value = slider.value;
        let suffix = '';
        
        // Determine suffix based on slider type
        if (slider.id.includes('cooldown') || slider.id.includes('time')) {
            suffix = 's';
        } else if (slider.id.includes('vision') || slider.id.includes('speed')) {
            suffix = 'x';
            value = parseFloat(value).toFixed(1);
        } else if (slider.id.includes('players')) {
            // Handle special case for player count
            return;
        }
        
        displayElement.textContent = value + suffix;
    }
    
    updateDisplay() {
        this.updatePlayerList();
        this.updateRoomInfo();
        this.updateSettingsFromState();
        this.updateStartButtonState();
    }
    
    updatePlayerList() {
        const playerList = document.getElementById('player-list');
        if (!playerList) return;
        
        const players = this.app.gameState.players;
        
        playerList.innerHTML = players.map(player => this.createPlayerCard(player)).join('');
        
        // Update player count display
        const playerCountText = document.querySelector('.lobby-players h3');
        if (playerCountText) {
            playerCountText.textContent = `Joueurs (${players.length}/${this.app.gameState.settings.maxPlayers || 10})`;
        }
        
        // Add event listeners to player cards
        this.setupPlayerCardListeners();
    }
    
    createPlayerCard(player) {
        const isHost = this.app.gameState.isHost;
        const isCurrentPlayer = player.id === 'host'; // Simplified for demo
        
        return `
            <div class="player-card ${player.isHost ? 'host' : ''}" data-player-id="${player.id}">
                <div class="player-avatar ${player.color}">
                    ${player.name.charAt(0).toUpperCase()}
                </div>
                <div class="player-name">${player.name}</div>
                <div class="player-status">
                    <div class="status-indicator ${player.isReady ? 'ready' : 'not-ready'}"></div>
                    <span>${player.isReady ? 'Prêt' : 'Pas prêt'}</span>
                </div>
                ${isHost && !player.isHost ? `
                    <div class="player-controls">
                        <button class="player-control-btn" data-action="kick" title="Expulser">👢</button>
                        <button class="player-control-btn" data-action="ban" title="Bannir">🚫</button>
                        <button class="player-control-btn" data-action="mute" title="Muet">🔇</button>
                    </div>
                ` : ''}
                ${isCurrentPlayer ? `
                    <div class="player-controls">
                        <button class="player-control-btn" data-action="change-color" title="Changer couleur">🎨</button>
                        <button class="player-control-btn" data-action="toggle-ready" title="Prêt/Pas prêt">
                            ${player.isReady ? '❌' : '✅'}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    setupPlayerCardListeners() {
        document.querySelectorAll('.player-control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const playerId = e.target.closest('.player-card').dataset.playerId;
                this.handlePlayerAction(action, playerId);
            });
        });
        
        // Color picker for current player
        document.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const playerId = card.dataset.playerId;
                if (playerId === 'host') { // Current player
                    this.showColorPicker(playerId);
                }
            });
        });
    }
    
    handlePlayerAction(action, playerId) {
        const player = this.app.gameState.players.find(p => p.id === playerId);
        if (!player) return;
        
        switch (action) {
            case 'kick':
                this.kickPlayer(playerId);
                break;
            case 'ban':
                this.banPlayer(playerId);
                break;
            case 'mute':
                this.mutePlayer(playerId);
                break;
            case 'change-color':
                this.showColorPicker(playerId);
                break;
            case 'toggle-ready':
                this.togglePlayerReady(playerId);
                break;
        }
    }
    
    kickPlayer(playerId) {
        this.app.gameState.players = this.app.gameState.players.filter(p => p.id !== playerId);
        this.updatePlayerList();
        this.app.showToast('Joueur expulsé', 'warning');
    }
    
    banPlayer(playerId) {
        // In a real implementation, this would add to ban list
        this.kickPlayer(playerId);
        this.app.showToast('Joueur banni', 'warning');
    }
    
    mutePlayer(playerId) {
        const player = this.app.gameState.players.find(p => p.id === playerId);
        if (player) {
            player.isMuted = !player.isMuted;
            this.updatePlayerList();
            this.app.showToast(`Joueur ${player.isMuted ? 'muté' : 'démuté'}`, 'info');
        }
    }
    
    togglePlayerReady(playerId) {
        const player = this.app.gameState.players.find(p => p.id === playerId);
        if (player) {
            player.isReady = !player.isReady;
            this.updatePlayerList();
            this.updateStartButtonState();
        }
    }
    
    showColorPicker(playerId) {
        const availableColors = this.getAvailableColors();
        const colorOptions = availableColors.map(color => 
            `<div class="color-option ${color}" data-color="${color}" onclick="lobby.selectColor('${playerId}', '${color}')"></div>`
        ).join('');
        
        this.app.showModal(`
            <div class="color-picker">
                <h4>Choisir une couleur</h4>
                <div class="color-grid">
                    ${colorOptions}
                </div>
            </div>
        `, 'Couleur du joueur');
    }
    
    selectColor(playerId, color) {
        const player = this.app.gameState.players.find(p => p.id === playerId);
        if (player && this.isColorAvailable(color)) {
            player.color = color;
            this.updatePlayerList();
            this.app.closeModal();
            this.app.showToast(`Couleur changée en ${color}`, 'success');
        }
    }
    
    getAvailableColors() {
        const usedColors = this.app.gameState.players.map(p => p.color);
        return this.playerColors.filter(color => !usedColors.includes(color));
    }
    
    isColorAvailable(color) {
        const usedColors = this.app.gameState.players.map(p => p.color);
        return !usedColors.includes(color);
    }
    
    shufflePlayerColors() {
        const availableColors = [...this.playerColors];
        this.app.gameState.players.forEach(player => {
            if (availableColors.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableColors.length);
                player.color = availableColors.splice(randomIndex, 1)[0];
            }
        });
        
        this.updatePlayerList();
        this.app.showToast('Couleurs mélangées!', 'success');
    }
    
    togglePrivacy() {
        const currentPrivacy = this.app.gameState.settings.privacy;
        const newPrivacy = currentPrivacy === 'private' ? 'public' : 'private';
        
        this.app.gameState.settings.privacy = newPrivacy;
        this.updatePrivacyDisplay();
        this.app.showToast(`Salon ${newPrivacy === 'private' ? 'privé' : 'public'}`, 'info');
    }
    
    updatePrivacyDisplay() {
        const privacySelect = document.getElementById('privacy-setting');
        if (privacySelect) {
            privacySelect.value = this.app.gameState.settings.privacy;
        }
        
        const toggleBtn = document.getElementById('toggle-privacy');
        if (toggleBtn) {
            const isPrivate = this.app.gameState.settings.privacy === 'private';
            toggleBtn.textContent = isPrivate ? '🔓 Rendre public' : '🔒 Rendre privé';
        }
    }
    
    updateRoomInfo() {
        const roomCodeDisplay = document.getElementById('room-code-display');
        if (roomCodeDisplay) {
            roomCodeDisplay.textContent = this.app.gameState.roomCode;
        }
    }
    
    updateSettingsFromState() {
        const settings = this.app.gameState.settings;
        
        // Update all form elements with current settings
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
                
                // Update display for range sliders
                if (element.type === 'range') {
                    this.updateSliderDisplay(element);
                }
            }
        });
    }
    
    updateStartButtonState() {
        const startBtn = document.getElementById('start-game');
        if (!startBtn) return;
        
        const players = this.app.gameState.players;
        const minPlayers = 4;
        const allReady = players.every(p => p.isReady);
        const enoughPlayers = players.length >= minPlayers;
        
        const canStart = this.app.gameState.isHost && enoughPlayers && allReady;
        
        startBtn.disabled = !canStart;
        
        if (!enoughPlayers) {
            startBtn.textContent = `Démarrer (${players.length}/${minPlayers} min)`;
        } else if (!allReady) {
            startBtn.textContent = 'Démarrer (En attente des joueurs)';
        } else {
            startBtn.textContent = 'Démarrer la partie';
        }
    }
    
    startGame() {
        if (!this.canStartGame()) {
            this.app.showToast('Impossible de démarrer la partie', 'error');
            return;
        }
        
        // Show loading state
        const startBtn = document.getElementById('start-game');
        startBtn.textContent = 'Démarrage...';
        startBtn.disabled = true;
        
        // Simulate game start delay
        setTimeout(() => {
            this.app.showScreen('game-hud');
            this.app.showToast('Partie démarrée!', 'success');
        }, 2000);
    }
    
    canStartGame() {
        const players = this.app.gameState.players;
        const minPlayers = 4;
        const allReady = players.every(p => p.isReady);
        const enoughPlayers = players.length >= minPlayers;
        
        return this.app.gameState.isHost && enoughPlayers && allReady;
    }
    
    updatePlayerSlots(maxPlayers) {
        // Ensure we don't exceed the new limit
        if (this.app.gameState.players.length > maxPlayers) {
            // In a real implementation, you might want to handle this more gracefully
            this.app.showToast(`Limite de joueurs réduite à ${maxPlayers}`, 'warning');
        }
        
        this.updatePlayerList();
    }
    
    validateImpostorCount(impostorCount) {
        const playerCount = this.app.gameState.players.length;
        const maxImpostors = Math.floor(playerCount / 2);
        
        if (impostorCount > maxImpostors) {
            this.app.showToast(`Trop d'imposteurs pour ${playerCount} joueurs`, 'warning');
            // Reset to valid value
            const slider = document.getElementById('num-impostors');
            if (slider) {
                slider.value = Math.min(impostorCount, maxImpostors);
                this.updateSliderDisplay(slider);
            }
        }
    }
    
    updatePrivacySetting(privacy) {
        this.updatePrivacyDisplay();
    }
    
    // Tab-specific update methods
    updateGeneralTab() {
        // Update general settings display
        this.updatePrivacyDisplay();
    }
    
    updateRolesTab() {
        // Update role settings
        this.updateRoleRates();
    }
    
    updateRoleRates() {
        const roles = ['scientist', 'engineer', 'guardian', 'shapeshifter'];
        roles.forEach(role => {
            const rateSlider = document.getElementById(`${role}-rate`);
            if (rateSlider) {
                const displaySpan = rateSlider.nextElementSibling;
                if (displaySpan) {
                    displaySpan.textContent = Math.round(rateSlider.value * 100) + '%';
                }
            }
        });
    }
    
    updateTasksTab() {
        // Update task and vision settings
    }
    
    updateTimersTab() {
        // Update timer settings
    }
    
    updateVotesTab() {
        // Update voting settings
    }
    
    updateAdvancedTab() {
        // Update advanced settings
    }
    
    updateInviteTab() {
        // Update invite options
        this.setupInviteActions();
    }
    
    setupInviteActions() {
        const shareBtn = document.getElementById('share-native');
        const copyBtn = document.getElementById('copy-invite');
        const qrBtn = document.getElementById('show-qr');
        
        if (shareBtn) {
            shareBtn.onclick = () => this.shareInvite();
        }
        
        if (copyBtn) {
            copyBtn.onclick = () => this.copyInviteText();
        }
        
        if (qrBtn) {
            qrBtn.onclick = () => this.showQRCode();
        }
    }
    
    shareInvite() {
        const inviteText = `Rejoins ma partie Among Us! Code: ${this.app.gameState.roomCode}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Among Us - Invitation',
                text: inviteText
            }).catch(console.error);
        } else {
            this.copyInviteText();
        }
    }
    
    copyInviteText() {
        const inviteText = `Rejoins ma partie Among Us! Code: ${this.app.gameState.roomCode}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(inviteText).then(() => {
                this.app.showToast('Invitation copiée!', 'success');
            });
        }
    }
    
    showQRCode() {
        // In a real implementation, you would generate a QR code
        this.app.showModal(`
            <div class="qr-code-container">
                <h4>Code QR</h4>
                <div class="qr-placeholder">
                    <div class="qr-code">QR</div>
                    <p>Code: ${this.app.gameState.roomCode}</p>
                </div>
                <p>Scannez ce code pour rejoindre la partie</p>
            </div>
        `, 'Partager par QR Code');
    }
    
    // Add bot players for testing
    addBotPlayer() {
        const botNames = ['Bot1', 'Bot2', 'Bot3', 'Bot4', 'Bot5'];
        const availableColors = this.getAvailableColors();
        
        if (availableColors.length === 0) {
            this.app.showToast('Aucune couleur disponible', 'warning');
            return;
        }
        
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        const botColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        
        const bot = {
            id: 'bot-' + Date.now(),
            name: botName,
            color: botColor,
            isHost: false,
            isReady: true,
            isBot: true
        };
        
        this.app.gameState.players.push(bot);
        this.updatePlayerList();
        this.updateStartButtonState();
    }
}

// Make lobby available globally for onclick handlers
window.lobby = null;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Lobby;
}