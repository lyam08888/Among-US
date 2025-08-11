// Among Us Interface - HUD Module
class HUD {
    constructor(app) {
        this.app = app;
        this.currentRole = 'crewmate'; // crewmate, impostor, scientist, engineer, guardian, shapeshifter
        this.isAlive = true;
        this.taskProgress = 0;
        this.cooldowns = {
            kill: 0,
            emergency: 0,
            sabotage: 0,
            shield: 0,
            shift: 0
        };
        this.virtualStick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupHUDListeners();
        this.setupVirtualStick();
        this.setupRoleWidgets();
        this.startGameLoop();
    }
    
    setupHUDListeners() {
        // Task list button
        const taskListBtn = document.getElementById('task-list-btn');
        if (taskListBtn) {
            taskListBtn.addEventListener('click', () => {
                this.toggleTaskPanel();
            });
        }
        
        // Minimap button
        const minimapBtn = document.getElementById('minimap-btn');
        if (minimapBtn) {
            minimapBtn.addEventListener('click', () => {
                this.toggleMinimap();
            });
        }
        
        // Settings quick button
        const settingsBtn = document.getElementById('settings-quick-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showPauseMenu();
            });
        }
        
        // Use button
        const useBtn = document.getElementById('use-btn');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                this.handleUseAction();
            });
        }
        
        // Report button
        const reportBtn = document.getElementById('report-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.handleReportAction();
            });
        }
        
        // Kill button (impostor only)
        const killBtn = document.getElementById('kill-btn');
        if (killBtn) {
            killBtn.addEventListener('click', () => {
                this.handleKillAction();
            });
        }
        
        // Sabotage button (impostor only)
        const sabotageBtn = document.getElementById('sabotage-btn');
        if (sabotageBtn) {
            sabotageBtn.addEventListener('click', () => {
                this.toggleSabotageMap();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }
    
    setupVirtualStick() {
        const stickContainer = document.getElementById('virtual-stick');
        if (!stickContainer) return;
        
        const knob = stickContainer.querySelector('.stick-knob');
        
        // Touch events
        stickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = stickContainer.getBoundingClientRect();
            
            this.virtualStick.active = true;
            this.virtualStick.startX = rect.left + rect.width / 2;
            this.virtualStick.startY = rect.top + rect.height / 2;
            
            this.updateVirtualStick(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.virtualStick.active) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            this.updateVirtualStick(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchend', (e) => {
            if (!this.virtualStick.active) return;
            
            this.virtualStick.active = false;
            this.resetVirtualStick();
        });
        
        // Mouse events for desktop testing
        stickContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = stickContainer.getBoundingClientRect();
            
            this.virtualStick.active = true;
            this.virtualStick.startX = rect.left + rect.width / 2;
            this.virtualStick.startY = rect.top + rect.height / 2;
            
            this.updateVirtualStick(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.virtualStick.active) return;
            this.updateVirtualStick(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', () => {
            if (!this.virtualStick.active) return;
            
            this.virtualStick.active = false;
            this.resetVirtualStick();
        });
    }
    
    updateVirtualStick(clientX, clientY) {
        const stickContainer = document.getElementById('virtual-stick');
        const knob = stickContainer.querySelector('.stick-knob');
        
        const deltaX = clientX - this.virtualStick.startX;
        const deltaY = clientY - this.virtualStick.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 40; // Maximum stick distance
        
        let knobX = deltaX;
        let knobY = deltaY;
        
        if (distance > maxDistance) {
            knobX = (deltaX / distance) * maxDistance;
            knobY = (deltaY / distance) * maxDistance;
        }
        
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        
        // Calculate movement vector (normalized)
        const moveX = knobX / maxDistance;
        const moveY = knobY / maxDistance;
        
        // In a real game, this would move the player
        this.handleMovement(moveX, moveY);
    }
    
    resetVirtualStick() {
        const stickContainer = document.getElementById('virtual-stick');
        const knob = stickContainer.querySelector('.stick-knob');
        
        knob.style.transform = 'translate(0px, 0px)';
        this.handleMovement(0, 0);
    }
    
    handleMovement(x, y) {
        // In a real implementation, this would send movement data to the game engine
        console.log(`Movement: ${x.toFixed(2)}, ${y.toFixed(2)}`);
    }
    
    setupRoleWidgets() {
        // Hide all role panels initially
        document.querySelectorAll('.role-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Show appropriate panel based on role
        this.updateRoleDisplay();
        
        // Setup role-specific button listeners
        this.setupScientistPanel();
        this.setupEngineerPanel();
        this.setupGuardianPanel();
        this.setupShapeshifterPanel();
    }
    
    setupScientistPanel() {
        const vitalsBtn = document.querySelector('.vitals-btn');
        if (vitalsBtn) {
            vitalsBtn.addEventListener('click', () => {
                this.showVitalsPanel();
            });
        }
    }
    
    setupEngineerPanel() {
        // Engineer can use vents - this would be handled by the game engine
    }
    
    setupGuardianPanel() {
        const shieldBtn = document.querySelector('.shield-btn');
        if (shieldBtn) {
            shieldBtn.addEventListener('click', () => {
                this.handleShieldAction();
            });
        }
    }
    
    setupShapeshifterPanel() {
        const shiftBtn = document.querySelector('.shift-btn');
        if (shiftBtn) {
            shiftBtn.addEventListener('click', () => {
                this.handleShiftAction();
            });
        }
    }
    
    handleKeyboardInput(e) {
        // Only handle game keys when in game
        if (this.app.currentScreen !== 'game-hud') return;
        
        switch (e.key.toLowerCase()) {
            case 'e':
                this.handleUseAction();
                break;
            case 'r':
                this.handleReportAction();
                break;
            case 'q':
                if (this.currentRole === 'impostor') {
                    this.handleKillAction();
                }
                break;
            case 'f':
                if (this.currentRole === 'impostor') {
                    this.toggleSabotageMap();
                }
                break;
            case 'tab':
                e.preventDefault();
                this.toggleMinimap();
                break;
            case 'escape':
                this.showPauseMenu();
                break;
        }
    }
    
    handleUseAction() {
        // Simulate using/interacting with objects
        this.showToast('Interaction...', 'info', 1000);
        
        // In a real game, this would:
        // - Open task interfaces
        // - Use doors, buttons, etc.
        // - Interact with systems
    }
    
    handleReportAction() {
        // Simulate reporting a body or calling emergency meeting
        this.showToast('Signalement envoyé!', 'warning');
        
        // In a real game, this would start a meeting
        setTimeout(() => {
            this.startMeeting();
        }, 1000);
    }
    
    handleKillAction() {
        if (this.currentRole !== 'impostor' || this.cooldowns.kill > 0) return;
        
        // Simulate kill action
        this.showToast('Kill!', 'error');
        this.cooldowns.kill = 27; // 27 second cooldown
        this.updateKillButton();
    }
    
    handleShieldAction() {
        if (this.currentRole !== 'guardian' || this.cooldowns.shield > 0) return;
        
        this.showToast('Joueur protégé!', 'success');
        this.cooldowns.shield = 30; // 30 second cooldown
    }
    
    handleShiftAction() {
        if (this.currentRole !== 'shapeshifter' || this.cooldowns.shift > 0) return;
        
        this.showPlayerSelectionModal();
    }
    
    showPlayerSelectionModal() {
        const players = ['Rouge', 'Bleu', 'Vert', 'Rose', 'Orange'];
        const content = `
            <div class="player-selection">
                <h4>Choisir un joueur à imiter</h4>
                <div class="player-grid">
                    ${players.map(player => `
                        <div class="selectable-player" onclick="hud.shiftToPlayer('${player}')">
                            <div class="player-avatar ${player.toLowerCase()}">${player.charAt(0)}</div>
                            <div class="player-name">${player}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Métamorphose');
    }
    
    shiftToPlayer(playerName) {
        this.showToast(`Métamorphose en ${playerName}!`, 'info');
        this.cooldowns.shift = 30;
        this.app.closeModal();
    }
    
    toggleTaskPanel() {
        const existingPanel = document.querySelector('.task-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }
        
        const taskPanel = this.createTaskPanel();
        document.body.appendChild(taskPanel);
        
        // Position the panel
        taskPanel.style.position = 'fixed';
        taskPanel.style.top = '80px';
        taskPanel.style.left = '20px';
        taskPanel.style.zIndex = '1000';
    }
    
    createTaskPanel() {
        const panel = document.createElement('div');
        panel.className = 'task-panel modal-content';
        
        const tasks = [
            { name: 'Fix Wiring (1/3)', room: 'Electrical', type: 'common', completed: false },
            { name: 'Empty Garbage', room: 'Cafeteria', type: 'short', completed: true },
            { name: 'Fuel Engines', room: 'Lower Engine', type: 'long', completed: false },
            { name: 'Submit Scan', room: 'MedBay', type: 'visual', completed: false }
        ];
        
        panel.innerHTML = `
            <div class="modal-header">
                <h3>📋 Tâches</h3>
                <button class="modal-close" onclick="this.closest('.task-panel').remove()">&times;</button>
            </div>
            <div class="task-list">
                ${tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <div class="task-info">
                            <div class="task-name">${task.name}</div>
                            <div class="task-location">${task.room}</div>
                        </div>
                        <div class="task-type ${task.type}">${task.type}</div>
                        <div class="task-status">
                            ${task.completed ? '✅' : '⏳'}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.taskProgress}%"></div>
                </div>
                <div class="progress-text">${this.taskProgress}% terminé</div>
            </div>
        `;
        
        return panel;
    }
    
    toggleMinimap() {
        const existingMap = document.querySelector('.minimap-panel');
        if (existingMap) {
            existingMap.remove();
            return;
        }
        
        const minimapPanel = this.createMinimapPanel();
        document.body.appendChild(minimapPanel);
        
        // Position the panel
        minimapPanel.style.position = 'fixed';
        minimapPanel.style.top = '80px';
        minimapPanel.style.right = '20px';
        minimapPanel.style.zIndex = '1000';
    }
    
    createMinimapPanel() {
        const panel = document.createElement('div');
        panel.className = 'minimap-panel modal-content';
        
        panel.innerHTML = `
            <div class="modal-header">
                <h3>🗺️ Carte</h3>
                <button class="modal-close" onclick="this.closest('.minimap-panel').remove()">&times;</button>
            </div>
            <div class="minimap-container">
                <div class="minimap-grid">
                    <div class="room" data-room="cafeteria">Cafétéria</div>
                    <div class="room" data-room="weapons">Armes</div>
                    <div class="room" data-room="o2">O2</div>
                    <div class="room" data-room="navigation">Navigation</div>
                    <div class="room" data-room="shields">Boucliers</div>
                    <div class="room" data-room="communications">Communications</div>
                    <div class="room" data-room="storage">Stockage</div>
                    <div class="room" data-room="admin">Admin</div>
                    <div class="room" data-room="electrical">Électricité</div>
                    <div class="room" data-room="lower-engine">Moteur Bas</div>
                    <div class="room" data-room="security">Sécurité</div>
                    <div class="room" data-room="reactor">Réacteur</div>
                    <div class="room" data-room="upper-engine">Moteur Haut</div>
                    <div class="room" data-room="medbay">MedBay</div>
                </div>
                <div class="player-indicator you">Vous</div>
            </div>
        `;
        
        return panel;
    }
    
    toggleSabotageMap() {
        const existingMap = document.querySelector('.sabotage-panel');
        if (existingMap) {
            existingMap.remove();
            return;
        }
        
        const sabotagePanel = this.createSabotagePanel();
        document.body.appendChild(sabotagePanel);
        
        // Position the panel
        sabotagePanel.style.position = 'fixed';
        sabotagePanel.style.top = '50%';
        sabotagePanel.style.left = '50%';
        sabotagePanel.style.transform = 'translate(-50%, -50%)';
        sabotagePanel.style.zIndex = '1000';
    }
    
    createSabotagePanel() {
        const panel = document.createElement('div');
        panel.className = 'sabotage-panel modal-content';
        
        panel.innerHTML = `
            <div class="modal-header">
                <h3>💥 Sabotage</h3>
                <button class="modal-close" onclick="this.closest('.sabotage-panel').remove()">&times;</button>
            </div>
            <div class="sabotage-options">
                <button class="sabotage-btn" onclick="hud.triggerSabotage('lights')">
                    💡 Lumières
                </button>
                <button class="sabotage-btn" onclick="hud.triggerSabotage('o2')">
                    🫁 O2
                </button>
                <button class="sabotage-btn" onclick="hud.triggerSabotage('reactor')">
                    ⚛️ Réacteur
                </button>
                <button class="sabotage-btn" onclick="hud.triggerSabotage('comms')">
                    📡 Communications
                </button>
                <button class="sabotage-btn" onclick="hud.triggerSabotage('doors')">
                    🚪 Portes
                </button>
            </div>
        `;
        
        return panel;
    }
    
    triggerSabotage(type) {
        const sabotageNames = {
            lights: 'Lumières',
            o2: 'O2',
            reactor: 'Réacteur',
            comms: 'Communications',
            doors: 'Portes'
        };
        
        this.showToast(`${sabotageNames[type]} saboté!`, 'error');
        this.showStatusToast(`Sabotage: ${sabotageNames[type]}`, 'error');
        
        // Close sabotage panel
        const panel = document.querySelector('.sabotage-panel');
        if (panel) panel.remove();
        
        // In a real game, this would trigger the actual sabotage
    }
    
    showVitalsPanel() {
        const vitalsPanel = this.createVitalsPanel();
        document.body.appendChild(vitalsPanel);
        
        // Position the panel
        vitalsPanel.style.position = 'fixed';
        vitalsPanel.style.top = '50%';
        vitalsPanel.style.left = '50%';
        vitalsPanel.style.transform = 'translate(-50%, -50%)';
        vitalsPanel.style.zIndex = '1000';
    }
    
    createVitalsPanel() {
        const panel = document.createElement('div');
        panel.className = 'vitals-panel modal-content';
        
        const players = [
            { name: 'Rouge', status: 'alive' },
            { name: 'Bleu', status: 'dead', lastSeen: '2m' },
            { name: 'Vert', status: 'alive' },
            { name: 'Rose', status: 'alive' },
            { name: 'Orange', status: 'disconnected' }
        ];
        
        panel.innerHTML = `
            <div class="modal-header">
                <h3>💓 Signes Vitaux</h3>
                <button class="modal-close" onclick="this.closest('.vitals-panel').remove()">&times;</button>
            </div>
            <div class="vitals-list">
                ${players.map(player => `
                    <div class="vital-entry ${player.status}">
                        <div class="player-name">${player.name}</div>
                        <div class="vital-status">
                            ${player.status === 'alive' ? '💚 Vivant' : 
                              player.status === 'dead' ? `💀 Mort (${player.lastSeen})` : 
                              '📴 Déconnecté'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return panel;
    }
    
    showPauseMenu() {
        const content = `
            <div class="pause-menu">
                <h3>⏸️ Menu Pause</h3>
                <div class="pause-options">
                    <button class="menu-option" onclick="hud.resumeGame()">
                        ▶️ Reprendre
                    </button>
                    <button class="menu-option" onclick="app.showScreen('settings-screen')">
                        ⚙️ Paramètres
                    </button>
                    <button class="menu-option" onclick="hud.showHowToPlay()">
                        ❓ Comment jouer
                    </button>
                    <button class="menu-option danger" onclick="hud.leaveGame()">
                        🚪 Quitter la partie
                    </button>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Pause');
    }
    
    resumeGame() {
        this.app.closeModal();
    }
    
    showHowToPlay() {
        const content = `
            <div class="how-to-play">
                <h4>Comment jouer</h4>
                <div class="instructions">
                    <h5>Équipiers:</h5>
                    <ul>
                        <li>Terminez toutes vos tâches</li>
                        <li>Identifiez et éliminez les imposteurs</li>
                        <li>Signalez les corps suspects</li>
                        <li>Participez aux votes</li>
                    </ul>
                    
                    <h5>Imposteurs:</h5>
                    <ul>
                        <li>Éliminez les équipiers</li>
                        <li>Sabotez les systèmes</li>
                        <li>Mentez lors des réunions</li>
                        <li>Évitez d'être découvert</li>
                    </ul>
                    
                    <h5>Contrôles:</h5>
                    <ul>
                        <li>Joystick virtuel: Se déplacer</li>
                        <li>E ou bouton Utiliser: Interagir</li>
                        <li>R ou bouton Report: Signaler</li>
                        <li>Tab: Ouvrir la carte</li>
                    </ul>
                </div>
                <button class="btn-large primary" onclick="app.closeModal()">Compris</button>
            </div>
        `;
        
        this.app.showModal(content, 'Comment jouer');
    }
    
    leaveGame() {
        const content = `
            <div class="confirm-dialog">
                <h4>Quitter la partie?</h4>
                <p>Êtes-vous sûr de vouloir quitter la partie en cours?</p>
                <div class="confirm-actions">
                    <button class="btn-large danger" onclick="hud.confirmLeaveGame()">Quitter</button>
                    <button class="btn-large" onclick="app.closeModal()">Rester</button>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Confirmer');
    }
    
    confirmLeaveGame() {
        this.app.closeModal();
        this.app.showScreen('main-menu');
        this.app.showToast('Partie quittée', 'info');
    }
    
    startMeeting() {
        // Simulate starting a meeting
        this.showToast('Réunion d\'urgence!', 'warning');
        
        // In a real game, this would switch to the meeting interface
        setTimeout(() => {
            this.showMeetingInterface();
        }, 1000);
    }
    
    showMeetingInterface() {
        const content = `
            <div class="meeting-interface">
                <h3>🗣️ Réunion d'urgence</h3>
                <div class="meeting-info">
                    <p>Un corps a été signalé dans Electrical!</p>
                </div>
                <div class="discussion-timer">
                    <div class="timer-circle">
                        <span class="timer-text">45s</span>
                    </div>
                    <p>Temps de discussion</p>
                </div>
                <div class="player-votes">
                    <div class="vote-grid">
                        ${['Rouge', 'Bleu', 'Vert', 'Rose', 'Orange'].map(player => `
                            <div class="vote-option" onclick="hud.votePlayer('${player}')">
                                <div class="player-avatar ${player.toLowerCase()}">${player.charAt(0)}</div>
                                <div class="player-name">${player}</div>
                                <div class="vote-count">0</div>
                            </div>
                        `).join('')}
                        <div class="vote-option skip" onclick="hud.voteSkip()">
                            <div class="skip-icon">⏭️</div>
                            <div class="player-name">Passer</div>
                            <div class="vote-count">0</div>
                        </div>
                    </div>
                </div>
                <div class="chat-area">
                    <div class="chat-messages">
                        <div class="chat-message">
                            <span class="player-name">Bleu:</span>
                            <span class="message">J'étais dans Admin!</span>
                        </div>
                        <div class="chat-message">
                            <span class="player-name">Vert:</span>
                            <span class="message">Rouge était suspect...</span>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Tapez votre message...">
                        <button>Envoyer</button>
                    </div>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Réunion', false); // Don't allow closing
    }
    
    votePlayer(playerName) {
        this.showToast(`Vote pour ${playerName}`, 'info');
        // In a real game, this would register the vote
        
        // Simulate end of voting
        setTimeout(() => {
            this.endMeeting(playerName);
        }, 2000);
    }
    
    voteSkip() {
        this.showToast('Vote pour passer', 'info');
        
        setTimeout(() => {
            this.endMeeting(null);
        }, 2000);
    }
    
    endMeeting(ejectedPlayer) {
        this.app.closeModal();
        
        if (ejectedPlayer) {
            this.showToast(`${ejectedPlayer} a été éjecté!`, 'warning');
        } else {
            this.showToast('Personne n\'a été éjecté', 'info');
        }
        
        // Return to game
        setTimeout(() => {
            this.showToast('Retour au jeu', 'info');
        }, 2000);
    }
    
    updateRoleDisplay() {
        // Hide all role panels
        document.querySelectorAll('.role-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Show appropriate panel
        const rolePanel = document.getElementById(`${this.currentRole}-panel`);
        if (rolePanel) {
            rolePanel.style.display = 'block';
        }
        
        // Update impostor-only buttons
        document.querySelectorAll('.impostor-only').forEach(btn => {
            btn.style.display = this.currentRole === 'impostor' ? 'block' : 'none';
        });
    }
    
    updateKillButton() {
        const killBtn = document.getElementById('kill-btn');
        if (!killBtn) return;
        
        const cooldownRing = killBtn.querySelector('.cooldown-ring');
        
        if (this.cooldowns.kill > 0) {
            killBtn.disabled = true;
            killBtn.classList.add('on-cooldown');
            
            if (cooldownRing) {
                const percentage = (this.cooldowns.kill / 27) * 100;
                cooldownRing.style.background = `conic-gradient(#ff6b6b ${percentage}%, transparent ${percentage}%)`;
            }
        } else {
            killBtn.disabled = false;
            killBtn.classList.remove('on-cooldown');
            
            if (cooldownRing) {
                cooldownRing.style.background = 'transparent';
            }
        }
    }
    
    updateTaskProgress(progress) {
        this.taskProgress = Math.min(Math.max(progress, 0), 100);
        
        const progressBar = document.querySelector('.task-progress-bar .progress-fill');
        const progressText = document.querySelector('.task-progress-bar .progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.taskProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${this.taskProgress}%`;
        }
    }
    
    showStatusToast(message, type = 'info') {
        const toastContainer = document.getElementById('status-toasts');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `status-toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    showToast(message, type = 'info', duration = 3000) {
        this.app.showToast(message, type, duration);
    }
    
    startGameLoop() {
        // Update cooldowns and other time-based elements
        setInterval(() => {
            this.updateCooldowns();
            this.updateTimers();
        }, 1000);
        
        // Update UI elements more frequently
        setInterval(() => {
            this.updateUI();
        }, 100);
    }
    
    updateCooldowns() {
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key]--;
            }
        });
        
        this.updateKillButton();
    }
    
    updateTimers() {
        // Update any timer displays
        const timerElements = document.querySelectorAll('.timer-display');
        timerElements.forEach(element => {
            // Update timer logic would go here
        });
    }
    
    updateUI() {
        // Update ping display
        const pingIndicator = document.querySelector('.ping-indicator');
        if (pingIndicator) {
            // Simulate ping fluctuation
            const ping = Math.floor(Math.random() * 50) + 80;
            pingIndicator.textContent = `${ping}ms`;
            pingIndicator.className = `ping-indicator ${ping < 100 ? 'good' : ping < 150 ? 'ok' : 'bad'}`;
        }
        
        // Update battery for scientist
        if (this.currentRole === 'scientist') {
            const batteryBar = document.querySelector('.battery-fill');
            if (batteryBar) {
                // Simulate battery drain
                const currentWidth = parseFloat(batteryBar.style.width) || 100;
                const newWidth = Math.max(currentWidth - 0.1, 0);
                batteryBar.style.width = `${newWidth}%`;
            }
        }
    }
    
    // Role switching for demo purposes
    switchRole(newRole) {
        this.currentRole = newRole;
        this.updateRoleDisplay();
        this.showToast(`Rôle changé: ${newRole}`, 'info');
    }
    
    // Simulate task completion
    completeTask() {
        this.updateTaskProgress(this.taskProgress + 20);
        this.showToast('Tâche terminée!', 'success');
    }
    
    // Emergency meeting
    callEmergencyMeeting() {
        if (this.cooldowns.emergency > 0) {
            this.showToast('Réunion d\'urgence en cooldown', 'warning');
            return;
        }
        
        this.cooldowns.emergency = 15;
        this.startMeeting();
    }
}

// Make HUD available globally for onclick handlers
window.hud = null;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HUD;
}