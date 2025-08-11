// Among Us Interface - Matchmaking Module
class Matchmaking {
    constructor(app) {
        this.app = app;
        this.isSearching = false;
        this.searchStartTime = null;
        this.searchInterval = null;
        this.filters = this.getDefaultFilters();
        
        this.init();
    }
    
    init() {
        this.setupFilterListeners();
        this.setupMatchmakingButton();
        this.loadSavedFilters();
    }
    
    setupFilterListeners() {
        // Region selector
        const regionSelect = document.getElementById('mm-region');
        if (regionSelect) {
            regionSelect.addEventListener('change', (e) => {
                this.filters.region = e.target.value;
                this.saveFilters();
            });
        }
        
        // Player count sliders
        const minPlayersSlider = document.getElementById('mm-players-min');
        const maxPlayersSlider = document.getElementById('mm-players-max');
        
        if (minPlayersSlider && maxPlayersSlider) {
            minPlayersSlider.addEventListener('input', (e) => {
                this.filters.playersMin = parseInt(e.target.value);
                this.updatePlayerDisplay();
                this.validatePlayerRange();
                this.saveFilters();
            });
            
            maxPlayersSlider.addEventListener('input', (e) => {
                this.filters.playersMax = parseInt(e.target.value);
                this.updatePlayerDisplay();
                this.validatePlayerRange();
                this.saveFilters();
            });
        }
        
        // Impostor checkboxes
        document.querySelectorAll('input[name="impostors"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateImpostorFilters();
                this.saveFilters();
            });
        });
        
        // Map checkboxes
        document.querySelectorAll('input[name="maps"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateMapFilters();
                this.saveFilters();
            });
        });
        
        // Role checkboxes
        document.querySelectorAll('input[name="roles"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateRoleFilters();
                this.saveFilters();
            });
        });
        
        // Ping limit
        const pingInput = document.getElementById('mm-ping');
        if (pingInput) {
            pingInput.addEventListener('change', (e) => {
                this.filters.pingLimit = parseInt(e.target.value);
                this.saveFilters();
            });
        }
        
        // Fill with bots toggle
        const fillBotsToggle = document.getElementById('fill-empty-bots');
        if (fillBotsToggle) {
            fillBotsToggle.addEventListener('change', (e) => {
                this.filters.fillWithBots = e.target.checked;
                this.saveFilters();
            });
        }
    }
    
    setupMatchmakingButton() {
        const startButton = document.getElementById('start-matchmaking');
        if (startButton) {
            startButton.addEventListener('click', () => {
                if (this.isSearching) {
                    this.cancelMatchmaking();
                } else {
                    this.startMatchmaking();
                }
            });
        }
    }
    
    updatePlayerDisplay() {
        const displayElement = document.getElementById('mm-players-display');
        if (displayElement) {
            displayElement.textContent = `${this.filters.playersMin}-${this.filters.playersMax}`;
        }
    }
    
    validatePlayerRange() {
        // Ensure min doesn't exceed max
        if (this.filters.playersMin > this.filters.playersMax) {
            this.filters.playersMax = this.filters.playersMin;
            const maxSlider = document.getElementById('mm-players-max');
            if (maxSlider) {
                maxSlider.value = this.filters.playersMax;
            }
        }
        
        // Ensure max doesn't go below min
        if (this.filters.playersMax < this.filters.playersMin) {
            this.filters.playersMin = this.filters.playersMax;
            const minSlider = document.getElementById('mm-players-min');
            if (minSlider) {
                minSlider.value = this.filters.playersMin;
            }
        }
        
        this.updatePlayerDisplay();
    }
    
    updateImpostorFilters() {
        const checkedBoxes = document.querySelectorAll('input[name="impostors"]:checked');
        this.filters.impostors = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        
        // Ensure at least one impostor count is selected
        if (this.filters.impostors.length === 0) {
            this.filters.impostors = [1];
            document.querySelector('input[value="1"]').checked = true;
            this.app.showToast('Au moins un nombre d\'imposteurs doit être sélectionné', 'warning');
        }
    }
    
    updateMapFilters() {
        const checkedBoxes = document.querySelectorAll('input[name="maps"]:checked');
        this.filters.maps = Array.from(checkedBoxes).map(cb => cb.value);
        
        // Ensure at least one map is selected
        if (this.filters.maps.length === 0) {
            this.filters.maps = ['the_skeld'];
            document.querySelector('input[value="the_skeld"]').checked = true;
            this.app.showToast('Au moins une carte doit être sélectionnée', 'warning');
        }
    }
    
    updateRoleFilters() {
        const checkedBoxes = document.querySelectorAll('input[name="roles"]:checked');
        this.filters.rolesEnabled = Array.from(checkedBoxes).map(cb => cb.value);
    }
    
    startMatchmaking() {
        if (!this.validateFilters()) {
            return;
        }
        
        this.isSearching = true;
        this.searchStartTime = Date.now();
        
        // Update UI
        this.updateMatchmakingUI();
        
        // Start search simulation
        this.simulateMatchmaking();
        
        this.app.showToast('Recherche de partie en cours...', 'info');
    }
    
    cancelMatchmaking() {
        this.isSearching = false;
        this.searchStartTime = null;
        
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
            this.searchInterval = null;
        }
        
        this.updateMatchmakingUI();
        this.app.showToast('Recherche annulée', 'warning');
    }
    
    validateFilters() {
        // Check if at least one map is selected
        if (this.filters.maps.length === 0) {
            this.app.showToast('Sélectionnez au moins une carte', 'error');
            return false;
        }
        
        // Check if at least one impostor count is selected
        if (this.filters.impostors.length === 0) {
            this.app.showToast('Sélectionnez au moins un nombre d\'imposteurs', 'error');
            return false;
        }
        
        // Validate ping limit
        if (this.filters.pingLimit < 50 || this.filters.pingLimit > 500) {
            this.app.showToast('Limite de ping invalide (50-500ms)', 'error');
            return false;
        }
        
        return true;
    }
    
    updateMatchmakingUI() {
        const startButton = document.getElementById('start-matchmaking');
        if (!startButton) return;
        
        if (this.isSearching) {
            startButton.textContent = 'Annuler';
            startButton.classList.remove('primary');
            startButton.classList.add('danger');
            
            // Start timer display
            this.startSearchTimer();
        } else {
            startButton.textContent = 'Lancer';
            startButton.classList.remove('danger');
            startButton.classList.add('primary');
            
            // Stop timer display
            this.stopSearchTimer();
        }
    }
    
    startSearchTimer() {
        this.searchInterval = setInterval(() => {
            if (!this.isSearching) return;
            
            const elapsed = Math.floor((Date.now() - this.searchStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const startButton = document.getElementById('start-matchmaking');
            if (startButton) {
                startButton.textContent = `Annuler (${timeString})`;
            }
        }, 1000);
    }
    
    stopSearchTimer() {
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
            this.searchInterval = null;
        }
    }
    
    simulateMatchmaking() {
        // Simulate finding a match after a random delay
        const searchTime = Math.random() * 15000 + 5000; // 5-20 seconds
        
        setTimeout(() => {
            if (this.isSearching) {
                this.foundMatch();
            }
        }, searchTime);
        
        // Simulate periodic updates
        const updateInterval = setInterval(() => {
            if (!this.isSearching) {
                clearInterval(updateInterval);
                return;
            }
            
            this.showSearchUpdate();
        }, 3000);
    }
    
    showSearchUpdate() {
        const updates = [
            'Recherche de serveurs...',
            'Analyse des parties disponibles...',
            'Vérification de la compatibilité...',
            'Recherche de joueurs...',
            'Évaluation du ping...'
        ];
        
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        this.app.showToast(randomUpdate, 'info', 2000);
    }
    
    foundMatch() {
        this.isSearching = false;
        this.stopSearchTimer();
        
        // Generate mock game data
        const mockGame = this.generateMockGame();
        
        // Show match found dialog
        this.showMatchFoundDialog(mockGame);
    }
    
    generateMockGame() {
        const maps = ['The Skeld', 'Mira HQ', 'Polus', 'Airship', 'The Fungle'];
        const regions = ['EU-Ouest', 'US-Est', 'AP-Sud'];
        
        return {
            map: maps[Math.floor(Math.random() * maps.length)],
            players: Math.floor(Math.random() * (this.filters.playersMax - this.filters.playersMin + 1)) + this.filters.playersMin,
            maxPlayers: this.filters.playersMax,
            impostors: this.filters.impostors[Math.floor(Math.random() * this.filters.impostors.length)],
            region: regions[Math.floor(Math.random() * regions.length)],
            ping: Math.floor(Math.random() * 100) + 50,
            host: 'Joueur' + Math.floor(Math.random() * 1000)
        };
    }
    
    showMatchFoundDialog(gameData) {
        const content = `
            <div class="match-found-dialog">
                <h4>🎉 Partie trouvée!</h4>
                <div class="match-info">
                    <div class="info-row">
                        <span class="label">Carte:</span>
                        <span class="value">${gameData.map}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Joueurs:</span>
                        <span class="value">${gameData.players}/${gameData.maxPlayers}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Imposteurs:</span>
                        <span class="value">${gameData.impostors}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Région:</span>
                        <span class="value">${gameData.region}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Ping:</span>
                        <span class="value">${gameData.ping}ms</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Hôte:</span>
                        <span class="value">${gameData.host}</span>
                    </div>
                </div>
                <div class="match-actions">
                    <button class="btn-large primary" onclick="matchmaking.joinMatch()">
                        Rejoindre (10s)
                    </button>
                    <button class="btn-large" onclick="matchmaking.declineMatch()">
                        Décliner
                    </button>
                </div>
                <div class="auto-join-timer">
                    <div class="timer-bar">
                        <div class="timer-fill"></div>
                    </div>
                    <p>Rejoindre automatiquement dans <span id="auto-join-countdown">10</span>s</p>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Partie trouvée');
        
        // Start auto-join countdown
        this.startAutoJoinCountdown();
    }
    
    startAutoJoinCountdown() {
        let countdown = 10;
        const countdownElement = document.getElementById('auto-join-countdown');
        const timerFill = document.querySelector('.timer-fill');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            
            if (timerFill) {
                timerFill.style.width = `${(10 - countdown) * 10}%`;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.joinMatch();
            }
        }, 1000);
        
        // Store interval for cleanup
        this.autoJoinInterval = countdownInterval;
    }
    
    joinMatch() {
        if (this.autoJoinInterval) {
            clearInterval(this.autoJoinInterval);
            this.autoJoinInterval = null;
        }
        
        this.app.closeModal();
        this.updateMatchmakingUI();
        
        // Simulate joining game
        this.app.showToast('Connexion à la partie...', 'info');
        
        setTimeout(() => {
            // Simulate successful join - go to game HUD
            this.app.showScreen('game-hud');
            this.app.showToast('Partie rejointe avec succès!', 'success');
        }, 2000);
    }
    
    declineMatch() {
        if (this.autoJoinInterval) {
            clearInterval(this.autoJoinInterval);
            this.autoJoinInterval = null;
        }
        
        this.app.closeModal();
        this.updateMatchmakingUI();
        this.app.showToast('Partie déclinée. Recherche d\'une nouvelle partie...', 'warning');
        
        // Restart matchmaking
        setTimeout(() => {
            this.startMatchmaking();
        }, 1000);
    }
    
    saveFilters() {
        try {
            localStorage.setItem('matchmaking-filters', JSON.stringify(this.filters));
        } catch (e) {
            console.warn('Could not save matchmaking filters:', e);
        }
    }
    
    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('matchmaking-filters');
            if (saved) {
                this.filters = { ...this.filters, ...JSON.parse(saved) };
                this.applyFiltersToUI();
            }
        } catch (e) {
            console.warn('Could not load saved filters:', e);
        }
    }
    
    applyFiltersToUI() {
        // Apply region
        const regionSelect = document.getElementById('mm-region');
        if (regionSelect) {
            regionSelect.value = this.filters.region;
        }
        
        // Apply player range
        const minSlider = document.getElementById('mm-players-min');
        const maxSlider = document.getElementById('mm-players-max');
        if (minSlider && maxSlider) {
            minSlider.value = this.filters.playersMin;
            maxSlider.value = this.filters.playersMax;
            this.updatePlayerDisplay();
        }
        
        // Apply impostor filters
        this.filters.impostors.forEach(count => {
            const checkbox = document.querySelector(`input[name="impostors"][value="${count}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Apply map filters
        this.filters.maps.forEach(map => {
            const checkbox = document.querySelector(`input[name="maps"][value="${map}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Apply role filters
        this.filters.rolesEnabled.forEach(role => {
            const checkbox = document.querySelector(`input[name="roles"][value="${role}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Apply ping limit
        const pingInput = document.getElementById('mm-ping');
        if (pingInput) {
            pingInput.value = this.filters.pingLimit;
        }
        
        // Apply fill bots setting
        const fillBotsToggle = document.getElementById('fill-empty-bots');
        if (fillBotsToggle) {
            fillBotsToggle.checked = this.filters.fillWithBots;
        }
    }
    
    getDefaultFilters() {
        return {
            region: 'auto',
            playersMin: 6,
            playersMax: 15,
            impostors: [1, 2],
            maps: ['the_skeld', 'polus', 'airship', 'fungle'],
            rolesEnabled: ['guardian_angel', 'shapeshifter'],
            pingLimit: 220,
            fillWithBots: false
        };
    }
    
    resetFilters() {
        this.filters = this.getDefaultFilters();
        this.applyFiltersToUI();
        this.saveFilters();
        this.app.showToast('Filtres réinitialisés', 'info');
    }
    
    // Quick filter presets
    applyQuickFilter(preset) {
        switch (preset) {
            case 'casual':
                this.filters = {
                    ...this.filters,
                    playersMin: 6,
                    playersMax: 10,
                    impostors: [1, 2],
                    maps: ['the_skeld', 'polus'],
                    pingLimit: 150
                };
                break;
                
            case 'competitive':
                this.filters = {
                    ...this.filters,
                    playersMin: 10,
                    playersMax: 15,
                    impostors: [2, 3],
                    maps: ['polus', 'airship'],
                    pingLimit: 100
                };
                break;
                
            case 'fun':
                this.filters = {
                    ...this.filters,
                    playersMin: 4,
                    playersMax: 15,
                    impostors: [1, 2, 3],
                    maps: ['the_skeld', 'mira_hq', 'polus', 'airship', 'fungle'],
                    rolesEnabled: ['guardian_angel', 'shapeshifter', 'scientist', 'engineer'],
                    pingLimit: 300
                };
                break;
        }
        
        this.applyFiltersToUI();
        this.saveFilters();
        this.app.showToast(`Filtre "${preset}" appliqué`, 'success');
    }
    
    // Get estimated wait time based on filters
    getEstimatedWaitTime() {
        let baseTime = 30; // Base 30 seconds
        
        // Adjust based on region
        if (this.filters.region !== 'auto') {
            baseTime += 15;
        }
        
        // Adjust based on player count requirements
        const playerRange = this.filters.playersMax - this.filters.playersMin;
        if (playerRange < 3) {
            baseTime += 20;
        }
        
        // Adjust based on ping limit
        if (this.filters.pingLimit < 100) {
            baseTime += 25;
        }
        
        // Adjust based on map selection
        if (this.filters.maps.length < 3) {
            baseTime += 10;
        }
        
        return Math.max(baseTime, 15); // Minimum 15 seconds
    }
    
    showEstimatedWaitTime() {
        const waitTime = this.getEstimatedWaitTime();
        this.app.showToast(`Temps d'attente estimé: ${waitTime}s`, 'info');
    }
}

// Make matchmaking available globally for onclick handlers
window.matchmaking = null;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Matchmaking;
}