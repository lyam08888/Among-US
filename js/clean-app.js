/* ===== AMONG US - APPLICATION ÉPURÉE ===== */

class CleanAmongUsApp {
    constructor() {
        this.currentScreen = 'loading';
        this.isLoading = true;
        this.secondaryMenuOpen = false;
        this.chatOpen = false;
        this.gameState = {
            isPlaying: false,
            isImpostor: false,
            roomCode: '',
            players: [],
            tasks: []
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initialisation de Among Us - Interface Épurée');
        
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupEventListeners();
        this.startLoading();
        this.setupMobileControls();
        this.setupChat();
        this.setupGestures();
    }

    /* ===== GESTION DES ÉVÉNEMENTS ===== */
    setupEventListeners() {
        // Délégation d'événements pour tous les boutons
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) {
                this.handleAction(action, e);
            }
        });

        // Gestion du clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Gestion de la résolution
        window.addEventListener('resize', () => this.handleResize());
        
        // Gestion de l'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });

        // Prévenir le zoom sur double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    handleAction(action, event) {
        console.log(`🎮 Action: ${action}`);
        
        // Feedback haptique sur mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        // Son de clic
        this.playSound('button-click');

        switch (action) {
            // Menu principal
            case 'quick-play':
                this.quickPlay();
                break;
            case 'create-room':
                this.createRoom();
                break;
            case 'join-room':
                this.showJoinRoomPanel();
                break;
            case 'training':
                this.startTraining();
                break;
            case 'cosmetics':
                this.showCosmetics();
                break;
            case 'stats':
                this.showStats();
                break;
            case 'settings':
                this.showSettings();
                break;
            
            // Menu secondaire
            case 'toggle-secondary':
                this.toggleSecondaryMenu();
                break;
            
            // Panneaux
            case 'close-settings':
                this.closePanel('settings-panel');
                break;
            case 'close-join-room':
                this.closePanel('join-room-panel');
                break;
            case 'join-with-code':
                this.joinWithCode();
                break;
            
            // Jeu
            case 'copy-room-code':
                this.copyRoomCode();
                break;
            case 'toggle-map':
                this.toggleMap();
                break;
            case 'toggle-settings':
                this.showSettings();
                break;
            case 'emergency-meeting':
                this.callEmergencyMeeting();
                break;
            
            // Contrôles mobiles
            case 'use':
                this.useAction();
                break;
            case 'kill':
                this.killAction();
                break;
            case 'sabotage':
                this.sabotageAction();
                break;
            case 'report':
                this.reportAction();
                break;
        }
    }

    handleKeyboard(e) {
        if (this.currentScreen !== 'game') return;

        switch (e.code) {
            case 'KeyE':
                this.useAction();
                break;
            case 'Tab':
                e.preventDefault();
                this.toggleMap();
                break;
            case 'KeyR':
                this.reportAction();
                break;
            case 'Escape':
                this.showSettings();
                break;
            case 'Enter':
                if (this.chatOpen) {
                    this.sendChatMessage();
                } else {
                    this.toggleChat();
                }
                break;
        }
    }

    handleResize() {
        // Redimensionner le canvas de jeu
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        // Ajuster l'interface mobile
        this.adjustMobileInterface();
    }

    /* ===== ÉCRAN DE CHARGEMENT ===== */
    startLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressFill = document.getElementById('loading-progress-fill');
        const loadingText = document.getElementById('loading-text');
        
        const loadingSteps = [
            { text: 'Initialisation du moteur...', duration: 500 },
            { text: 'Chargement des ressources...', duration: 800 },
            { text: 'Configuration des contrôles...', duration: 400 },
            { text: 'Connexion aux serveurs...', duration: 600 },
            { text: 'Finalisation...', duration: 300 }
        ];

        let currentStep = 0;
        let totalProgress = 0;

        const processStep = () => {
            if (currentStep >= loadingSteps.length) {
                this.finishLoading();
                return;
            }

            const step = loadingSteps[currentStep];
            loadingText.textContent = step.text;
            
            const stepProgress = (currentStep + 1) / loadingSteps.length * 100;
            
            // Animation fluide de la barre de progression
            const animateProgress = () => {
                totalProgress += 2;
                if (totalProgress > stepProgress) {
                    totalProgress = stepProgress;
                }
                
                progressFill.style.width = `${totalProgress}%`;
                
                if (totalProgress < stepProgress) {
                    requestAnimationFrame(animateProgress);
                } else {
                    setTimeout(() => {
                        currentStep++;
                        processStep();
                    }, step.duration);
                }
            };
            
            animateProgress();
        };

        processStep();
    }

    finishLoading() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.remove('active');
            this.showScreen('main-menu');
            this.isLoading = false;
            
            // Initialiser les systèmes de jeu
            this.initializeGameSystems();
        }, 500);
    }

    /* ===== NAVIGATION ENTRE ÉCRANS ===== */
    showScreen(screenId) {
        // Masquer tous les écrans
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Afficher l'écran demandé
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    /* ===== MENU SECONDAIRE ===== */
    toggleSecondaryMenu() {
        const secondaryMenu = document.getElementById('secondary-menu');
        const toggleBtn = document.getElementById('menu-toggle');
        
        this.secondaryMenuOpen = !this.secondaryMenuOpen;
        
        if (this.secondaryMenuOpen) {
            secondaryMenu.classList.add('active');
            toggleBtn.classList.add('active');
        } else {
            secondaryMenu.classList.remove('active');
            toggleBtn.classList.remove('active');
        }
    }

    /* ===== ACTIONS DE JEU ===== */
    quickPlay() {
        this.showNotification('Recherche d\'une partie...', 'info');
        
        // Simuler la recherche de partie
        setTimeout(() => {
            this.joinGame('ABCDEF');
        }, 2000);
    }

    createRoom() {
        // Générer un code de salle aléatoire
        const roomCode = this.generateRoomCode();
        this.showNotification(`Création de la partie ${roomCode}...`, 'info');
        
        setTimeout(() => {
            this.joinGame(roomCode);
        }, 1000);
    }

    showJoinRoomPanel() {
        this.showPanel('join-room-panel');
    }

    joinWithCode() {
        const input = document.getElementById('room-code-input');
        const code = input.value.toUpperCase().trim();
        
        if (code.length !== 6) {
            this.showNotification('Le code doit contenir 6 caractères', 'error');
            return;
        }
        
        this.closePanel('join-room-panel');
        this.showNotification(`Connexion à la partie ${code}...`, 'info');
        
        setTimeout(() => {
            this.joinGame(code);
        }, 1500);
    }

    joinGame(roomCode) {
        this.gameState.roomCode = roomCode;
        this.gameState.isPlaying = true;
        
        // Mettre à jour l'interface
        document.getElementById('current-room-code').textContent = roomCode;
        
        // Passer à l'écran de jeu
        this.showScreen('game-screen');
        
        // Initialiser les tâches
        this.initializeTasks();
        
        this.showNotification(`Partie rejointe: ${roomCode}`, 'success');
    }

    startTraining() {
        this.showNotification('Lancement du mode entraînement...', 'info');
        
        setTimeout(() => {
            this.gameState.isPlaying = true;
            this.gameState.roomCode = 'TRAIN';
            this.showScreen('game-screen');
            this.initializeTrainingTasks();
        }, 1000);
    }

    /* ===== GESTION DES PANNEAUX ===== */
    showPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.add('active');
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('active');
        }
    }

    showSettings() {
        this.showPanel('settings-panel');
    }

    /* ===== CONTRÔLES MOBILES ===== */
    setupMobileControls() {
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystick-knob');
        
        if (!joystick || !joystickKnob) return;

        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        let currentPos = { x: 0, y: 0 };

        const handleStart = (e) => {
            isDragging = true;
            joystick.classList.add('active');
            joystickKnob.classList.add('active');
            
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            startPos = { x: centerX, y: centerY };
            
            if ('vibrate' in navigator) {
                navigator.vibrate(30);
            }
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const deltaX = clientX - startPos.x;
            const deltaY = clientY - startPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 35; // Rayon maximum
            
            if (distance <= maxDistance) {
                currentPos = { x: deltaX, y: deltaY };
            } else {
                const angle = Math.atan2(deltaY, deltaX);
                currentPos = {
                    x: Math.cos(angle) * maxDistance,
                    y: Math.sin(angle) * maxDistance
                };
            }
            
            joystickKnob.style.transform = `translate(-50%, -50%) translate(${currentPos.x}px, ${currentPos.y}px)`;
            
            // Envoyer les données de mouvement au moteur de jeu
            this.handleMovement(currentPos.x / maxDistance, currentPos.y / maxDistance);
        };

        const handleEnd = () => {
            isDragging = false;
            joystick.classList.remove('active');
            joystickKnob.classList.remove('active');
            
            joystickKnob.style.transform = 'translate(-50%, -50%)';
            currentPos = { x: 0, y: 0 };
            
            // Arrêter le mouvement
            this.handleMovement(0, 0);
        };

        // Événements tactiles
        joystick.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);

        // Événements souris (pour les tests sur desktop)
        joystick.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }

    handleMovement(x, y) {
        // Intégration avec le moteur de jeu
        if (window.gameEngine && this.gameState.isPlaying) {
            window.gameEngine.setPlayerMovement(x, y);
        }
    }

    /* ===== CHAT ===== */
    setupChat() {
        const chatToggle = document.getElementById('chat-toggle');
        const chatPanel = document.getElementById('chat-panel');
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');

        if (!chatToggle || !chatPanel) return;

        chatToggle.addEventListener('click', () => {
            this.toggleChat();
        });

        chatSend.addEventListener('click', () => {
            this.sendChatMessage();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    toggleChat() {
        const chatPanel = document.getElementById('chat-panel');
        const chatInput = document.getElementById('chat-input');
        
        this.chatOpen = !this.chatOpen;
        
        if (this.chatOpen) {
            chatPanel.classList.add('active');
            setTimeout(() => chatInput.focus(), 100);
        } else {
            chatPanel.classList.remove('active');
            chatInput.blur();
        }
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        this.addChatMessage('Vous', message);
        chatInput.value = '';
        
        // Simuler une réponse
        setTimeout(() => {
            this.addChatMessage('Joueur2', 'Message reçu!');
        }, 1000);
    }

    addChatMessage(sender, content) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <div class="sender">${sender}</div>
            <div class="content">${content}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Afficher le badge si le chat est fermé
        if (!this.chatOpen) {
            const badge = document.getElementById('chat-badge');
            badge.style.display = 'flex';
            badge.textContent = '1';
        }
    }

    /* ===== GESTES TACTILES ===== */
    setupGestures() {
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const deltaY = startY - endY;
            const deltaX = startX - endX;
            
            // Swipe vers le haut pour ouvrir le menu secondaire
            if (deltaY > 50 && Math.abs(deltaX) < 100 && this.currentScreen === 'main-menu') {
                if (!this.secondaryMenuOpen) {
                    this.toggleSecondaryMenu();
                }
            }
            
            // Swipe vers le bas pour fermer le menu secondaire
            if (deltaY < -50 && Math.abs(deltaX) < 100 && this.currentScreen === 'main-menu') {
                if (this.secondaryMenuOpen) {
                    this.toggleSecondaryMenu();
                }
            }
            
            // Swipe vers la droite pour ouvrir le chat
            if (deltaX < -100 && Math.abs(deltaY) < 50 && this.currentScreen === 'game') {
                if (!this.chatOpen) {
                    this.toggleChat();
                }
            }
            
            // Swipe vers la gauche pour fermer le chat
            if (deltaX > 100 && Math.abs(deltaY) < 50 && this.currentScreen === 'game') {
                if (this.chatOpen) {
                    this.toggleChat();
                }
            }
        });
    }

    /* ===== ACTIONS DE JEU ===== */
    useAction() {
        if (!this.gameState.isPlaying) return;
        
        this.showNotification('Action: Utiliser', 'info');
        
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }

    killAction() {
        if (!this.gameState.isPlaying || !this.gameState.isImpostor) return;
        
        this.showNotification('Action: Éliminer', 'warning');
        
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    sabotageAction() {
        if (!this.gameState.isPlaying || !this.gameState.isImpostor) return;
        
        this.showNotification('Action: Sabotage', 'warning');
        
        if ('vibrate' in navigator) {
            navigator.vibrate(150);
        }
    }

    reportAction() {
        if (!this.gameState.isPlaying) return;
        
        this.showNotification('Corps signalé!', 'error');
        
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    callEmergencyMeeting() {
        if (!this.gameState.isPlaying) return;
        
        this.showNotification('Réunion d\'urgence appelée!', 'warning');
        this.playSound('emergency');
        
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300, 100, 300]);
        }
    }

    copyRoomCode() {
        const roomCode = this.gameState.roomCode;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomCode).then(() => {
                this.showNotification(`Code ${roomCode} copié!`, 'success');
            });
        } else {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = roomCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification(`Code ${roomCode} copié!`, 'success');
        }
    }

    toggleMap() {
        this.showNotification('Carte ouverte', 'info');
        // TODO: Implémenter l'affichage de la carte
    }

    /* ===== TÂCHES ===== */
    initializeTasks() {
        const tasks = [
            { id: 1, name: 'Réparer les câbles', location: 'Électricité', completed: false },
            { id: 2, name: 'Vider les déchets', location: 'Cafétéria', completed: false },
            { id: 3, name: 'Analyser les échantillons', location: 'Laboratoire', completed: true },
            { id: 4, name: 'Aligner le moteur', location: 'Moteurs', completed: false },
            { id: 5, name: 'Télécharger les données', location: 'Communications', completed: false }
        ];
        
        this.gameState.tasks = tasks;
        this.updateTaskList();
    }

    initializeTrainingTasks() {
        const tasks = [
            { id: 1, name: 'Apprendre les contrôles', location: 'Tutoriel', completed: false },
            { id: 2, name: 'Effectuer une tâche', location: 'Cafétéria', completed: false },
            { id: 3, name: 'Utiliser les évents', location: 'Évents', completed: false }
        ];
        
        this.gameState.tasks = tasks;
        this.updateTaskList();
    }

    updateTaskList() {
        const taskItems = document.getElementById('task-items');
        const progressFill = document.getElementById('task-progress-fill');
        const progressText = document.getElementById('task-progress-text');
        
        if (!taskItems) return;
        
        const completedTasks = this.gameState.tasks.filter(task => task.completed).length;
        const totalTasks = this.gameState.tasks.length;
        const progress = (completedTasks / totalTasks) * 100;
        
        // Mettre à jour la progression
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${completedTasks}/${totalTasks}`;
        
        // Mettre à jour la liste
        taskItems.innerHTML = '';
        
        this.gameState.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-icon">
                    <i class="fas ${task.completed ? 'fa-check' : 'fa-circle'}"></i>
                </div>
                <div class="task-name">${task.name}</div>
                <div class="task-location">${task.location}</div>
            `;
            
            taskItems.appendChild(taskElement);
        });
    }

    /* ===== UTILITAIRES ===== */
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    playSound(soundName) {
        // TODO: Implémenter la lecture des sons
        console.log(`🔊 Son: ${soundName}`);
    }

    adjustMobileInterface() {
        const isMobile = window.innerWidth <= 768;
        const mobileControls = document.getElementById('mobile-controls');
        
        if (mobileControls) {
            mobileControls.style.display = isMobile ? 'flex' : 'none';
        }
    }

    initializeGameSystems() {
        // Initialiser les systèmes de jeu si nécessaire
        console.log('🎮 Systèmes de jeu initialisés');
        
        // Ajuster l'interface pour mobile
        this.adjustMobileInterface();
        
        // Mettre à jour les statistiques
        this.updateOnlineStats();
    }

    updateOnlineStats() {
        const onlinePlayers = document.getElementById('online-players');
        const pingValue = document.getElementById('ping-value');
        
        if (onlinePlayers) {
            // Simuler des statistiques en ligne
            const playerCount = Math.floor(Math.random() * 5000) + 10000;
            onlinePlayers.textContent = `${playerCount.toLocaleString()} joueurs`;
        }
        
        if (pingValue) {
            const ping = Math.floor(Math.random() * 50) + 15;
            pingValue.textContent = `${ping}ms`;
        }
    }

    showCosmetics() {
        this.showNotification('Cosmétiques - Bientôt disponible!', 'info');
    }

    showStats() {
        this.showNotification('Statistiques - Bientôt disponible!', 'info');
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.cleanAmongUsApp = new CleanAmongUsApp();
});

// Exporter pour utilisation globale
window.CleanAmongUsApp = CleanAmongUsApp;