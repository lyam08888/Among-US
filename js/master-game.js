// Among Us V4 - Master Game System
console.log('🎮 Initializing Among Us Master Game System...');

class AmongUsMasterGame {
    constructor() {
        this.renderer = null;
        this.gameplay = null;
        this.animations = null;
        this.interactions = null;
        this.audio = null;
        this.networking = null;
        
        this.gameState = 'initializing';
        this.lastUpdate = Date.now();
        this.frameCount = 0;
        this.isRunning = false;
        
        this.init();
    }
    
    async init() {
        console.log('🎮 Initializing master game system...');
        
        try {
            // Étape 1: Initialiser le renderer
            await this.initRenderer();
            
            // Étape 2: Initialiser les systèmes de gameplay
            await this.initGameplay();
            
            // Étape 3: Initialiser les animations
            await this.initAnimations();
            
            // Étape 4: Initialiser les interactions
            await this.initInteractions();
            
            // Étape 5: Initialiser l'audio
            await this.initAudio();
            
            // Étape 6: Démarrer le jeu
            await this.startGame();
            
            console.log('✅ Master game system initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize master game system:', error);
            this.initEmergencyMode();
        }
    }
    
    async initRenderer() {
        console.log('🖼️ Initializing renderer...');
        
        try {
            // Utiliser SuperRenderer si disponible
            if (window.SuperRenderer) {
                this.renderer = new SuperRenderer();
            } else if (window.SimpleRenderer) {
                this.renderer = new SimpleRenderer();
            } else {
                throw new Error('No renderer available');
            }
            
            console.log('✅ Renderer initialized');
            
        } catch (error) {
            console.error('❌ Renderer initialization failed:', error);
            throw error;
        }
    }
    
    async initGameplay() {
        console.log('🎯 Initializing gameplay system...');
        
        try {
            if (window.AmongUsGameplay) {
                this.gameplay = new AmongUsGameplay(this.renderer);
                console.log('✅ Gameplay system initialized');
            } else {
                console.warn('⚠️ Gameplay system not available, using basic mode');
            }
            
        } catch (error) {
            console.error('❌ Gameplay initialization failed:', error);
            // Continue sans gameplay avancé
        }
    }
    
    async initAnimations() {
        console.log('🎬 Initializing animation system...');
        
        try {
            if (window.AmongUsAnimations) {
                this.animations = new AmongUsAnimations(this.renderer);
                console.log('✅ Animation system initialized');
            } else {
                console.warn('⚠️ Animation system not available');
            }
            
        } catch (error) {
            console.error('❌ Animation initialization failed:', error);
            // Continue sans animations avancées
        }
    }
    
    async initInteractions() {
        console.log('🔧 Initializing interaction system...');
        
        try {
            if (window.AmongUsInteractions) {
                this.interactions = new AmongUsInteractions(this.renderer, this.gameplay, this.animations);
                console.log('✅ Interaction system initialized');
            } else {
                console.warn('⚠️ Interaction system not available');
            }
            
        } catch (error) {
            console.error('❌ Interaction initialization failed:', error);
            // Continue sans interactions avancées
        }
    }
    
    async initAudio() {
        console.log('🔊 Initializing audio system...');
        
        try {
            this.audio = {
                context: null,
                sounds: new Map(),
                enabled: true,
                volume: 0.5
            };
            
            // Initialiser le contexte audio si disponible
            if (window.AudioContext || window.webkitAudioContext) {
                this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ Audio context initialized');
            }
            
            // Charger les sons de base
            this.loadBasicSounds();
            
        } catch (error) {
            console.error('❌ Audio initialization failed:', error);
            this.audio.enabled = false;
        }
    }
    
    loadBasicSounds() {
        const basicSounds = [
            { name: 'click', url: 'assets/sounds/button-click.wav' },
            { name: 'footstep', url: 'assets/sounds/footstep.wav' },
            { name: 'task_complete', url: 'assets/sounds/button-click.wav' },
            { name: 'emergency', url: 'assets/sounds/emergency.wav' }
        ];
        
        for (const sound of basicSounds) {
            this.loadSound(sound.name, sound.url);
        }
    }
    
    async loadSound(name, url) {
        try {
            const audio = new Audio(url);
            audio.volume = this.audio.volume;
            this.audio.sounds.set(name, audio);
        } catch (error) {
            console.warn(`⚠️ Failed to load sound: ${name}`);
        }
    }
    
    playSound(name) {
        if (!this.audio.enabled) return;
        
        const sound = this.audio.sounds.get(name);
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.play().catch(e => console.warn('⚠️ Sound play failed:', e));
            } catch (error) {
                console.warn('⚠️ Sound play error:', error);
            }
        }
    }
    
    async startGame() {
        console.log('🚀 Starting game...');
        
        this.gameState = 'playing';
        this.isRunning = true;
        
        // Créer le joueur local
        this.createLocalPlayer();
        
        // Afficher l'interface de jeu
        this.createGameUI();
        
        // Démarrer la boucle de jeu
        this.startGameLoop();
        
        // Afficher le message de succès
        this.showWelcomeMessage();
        
        console.log('🎮 ===== AMONG US V4 - MASTER GAME ACTIVE =====');
    }
    
    createLocalPlayer() {
        if (!this.renderer || !this.renderer.players) return;
        
        const localPlayer = {
            id: 'local_player',
            name: 'Player',
            color: 'red',
            x: 450, // Centre cafétéria
            y: 350,
            isLocal: true,
            isAlive: true,
            isImpostor: Math.random() < 0.3, // 30% chance d'être imposteur
            velocity: { x: 0, y: 0 },
            speed: 150,
            lastUpdate: Date.now()
        };
        
        this.renderer.players.set(localPlayer.id, localPlayer);
        
        console.log(`👤 Local player created - Role: ${localPlayer.isImpostor ? 'IMPOSTOR' : 'CREWMATE'}`);
        
        // Mettre à jour le gameplay si disponible
        if (this.gameplay) {
            this.gameplay.gameMode = localPlayer.isImpostor ? 'impostor' : 'crewmate';
        }
    }
    
    createGameUI() {
        console.log('🖥️ Creating game UI...');
        
        // Interface principale
        const gameUI = document.createElement('div');
        gameUI.id = 'master-game-ui';
        gameUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100;
            font-family: Arial, sans-serif;
        `;
        
        gameUI.innerHTML = `
            <!-- Informations du joueur -->
            <div id="player-info" style="
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid #3498db;
            ">
                <div id="player-role">🤔 Determining role...</div>
                <div id="player-status">Status: Active</div>
                <div id="player-location">Location: Cafeteria</div>
            </div>
            
            <!-- Mini-carte -->
            <div id="mini-map" style="
                position: absolute;
                top: 20px;
                right: 20px;
                width: 200px;
                height: 150px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #3498db;
                border-radius: 10px;
                pointer-events: auto;
            ">
                <canvas id="mini-map-canvas" width="196" height="146" style="border-radius: 8px;"></canvas>
            </div>
            
            <!-- Liste des tâches -->
            <div id="task-list" style="
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid #27ae60;
                max-width: 300px;
            ">
                <h4 style="margin: 0 0 10px 0; color: #27ae60;">📋 Tâches</h4>
                <div id="task-items">Loading tasks...</div>
            </div>
            
            <!-- Contrôles -->
            <div id="controls-help" style="
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid #f39c12;
            ">
                <h4 style="margin: 0 0 10px 0; color: #f39c12;">🎮 Contrôles</h4>
                <div style="font-size: 12px;">
                    <div>WASD/Flèches: Déplacement</div>
                    <div>E/Space: Utiliser</div>
                    <div>R: Signaler</div>
                    <div>T: Réunion d'urgence</div>
                    <div>Tab: Liste des tâches</div>
                </div>
            </div>
            
            <!-- Indicateur FPS -->
            <div id="fps-counter" style="
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.5);
                color: #2ecc71;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
            ">
                FPS: 60
            </div>
        `;
        
        document.body.appendChild(gameUI);
        
        // Initialiser la mini-carte
        this.initMiniMap();
    }
    
    initMiniMap() {
        const canvas = document.getElementById('mini-map-canvas');
        if (!canvas || !this.gameplay) return;
        
        const ctx = canvas.getContext('2d');
        this.miniMapCanvas = canvas;
        this.miniMapCtx = ctx;
        
        console.log('🗺️ Mini-map initialized');
    }
    
    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2c3e50, #3498db);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 10000;
            border: 3px solid #3498db;
            box-shadow: 0 0 30px rgba(52, 152, 219, 0.5);
            font-family: Arial, sans-serif;
        `;
        
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        const role = localPlayer && localPlayer.isImpostor ? 'IMPOSTEUR' : 'COÉQUIPIER';
        const roleColor = localPlayer && localPlayer.isImpostor ? '#e74c3c' : '#27ae60';
        const roleIcon = localPlayer && localPlayer.isImpostor ? '🔪' : '🔧';
        
        welcomeDiv.innerHTML = `
            <h1 style="margin: 0 0 20px 0; font-size: 36px;">🚀 Among Us V4</h1>
            <h2 style="margin: 0 0 20px 0; color: ${roleColor};">
                ${roleIcon} Vous êtes ${role} ${roleIcon}
            </h2>
            <div style="font-size: 18px; margin-bottom: 20px;">
                ${localPlayer && localPlayer.isImpostor ? 
                    'Éliminez les coéquipiers et sabotez le vaisseau!' : 
                    'Accomplissez vos tâches et trouvez les imposteurs!'
                }
            </div>
            <div style="font-size: 14px; color: #bdc3c7; margin-bottom: 20px;">
                Utilisez WASD pour vous déplacer, E pour interagir
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: ${roleColor};
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 18px;
                cursor: pointer;
                font-family: Arial, sans-serif;
            ">Commencer la Partie</button>
        `;
        
        document.body.appendChild(welcomeDiv);
        
        // Son de bienvenue
        this.playSound('click');
        
        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (welcomeDiv.parentElement) {
                welcomeDiv.remove();
            }
        }, 10000);
    }
    
    startGameLoop() {
        console.log('🔄 Starting game loop...');
        
        const gameLoop = () => {
            if (!this.isRunning) return;
            
            const now = Date.now();
            const deltaTime = now - this.lastUpdate;
            this.lastUpdate = now;
            this.frameCount++;
            
            // Mettre à jour tous les systèmes
            this.update(deltaTime);
            
            // Renderer
            this.render();
            
            // Programmer la prochaine frame
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    update(deltaTime) {
        try {
            // Mettre à jour le gameplay
            if (this.gameplay && this.gameplay.update) {
                this.gameplay.update(deltaTime);
            }
            
            // Mettre à jour les animations
            if (this.animations && this.animations.update) {
                this.animations.update(deltaTime);
            }
            
            // Mettre à jour les interactions
            if (this.interactions && this.interactions.update) {
                this.interactions.update(deltaTime);
            }
            
            // Mettre à jour l'interface
            this.updateUI(deltaTime);
            
            // Mettre à jour la physique basique
            this.updatePhysics(deltaTime);
            
        } catch (error) {
            console.error('❌ Update error:', error);
        }
    }
    
    updatePhysics(deltaTime) {
        if (!this.renderer || !this.renderer.players) return;
        
        for (const [id, player] of this.renderer.players) {
            if (!player.velocity) continue;
            
            // Appliquer la vélocité
            player.x += player.velocity.x * deltaTime / 1000;
            player.y += player.velocity.y * deltaTime / 1000;
            
            // Limites du monde
            player.x = Math.max(50, Math.min(player.x, 750));
            player.y = Math.max(50, Math.min(player.y, 750));
            
            // Friction
            player.velocity.x *= 0.9;
            player.velocity.y *= 0.9;
            
            // Arrêter si très lent
            if (Math.abs(player.velocity.x) < 1) player.velocity.x = 0;
            if (Math.abs(player.velocity.y) < 1) player.velocity.y = 0;
        }
    }
    
    updateUI(deltaTime) {
        // Mettre à jour le compteur FPS
        if (this.frameCount % 60 === 0) {
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsCounter) {
                const fps = Math.round(1000 / deltaTime);
                fpsCounter.textContent = `FPS: ${Math.min(fps, 60)}`;
            }
        }
        
        // Mettre à jour les informations du joueur
        this.updatePlayerInfo();
        
        // Mettre à jour la liste des tâches
        this.updateTaskList();
        
        // Mettre à jour la mini-carte
        this.updateMiniMap();
    }
    
    updatePlayerInfo() {
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        const roleDiv = document.getElementById('player-role');
        const statusDiv = document.getElementById('player-status');
        const locationDiv = document.getElementById('player-location');
        
        if (roleDiv) {
            const roleIcon = localPlayer.isImpostor ? '🔪' : '🔧';
            const roleText = localPlayer.isImpostor ? 'IMPOSTEUR' : 'COÉQUIPIER';
            roleDiv.textContent = `${roleIcon} ${roleText}`;
            roleDiv.style.color = localPlayer.isImpostor ? '#e74c3c' : '#27ae60';
        }
        
        if (statusDiv) {
            statusDiv.textContent = `Status: ${localPlayer.isAlive ? 'Vivant' : 'Mort'}`;
        }
        
        if (locationDiv && this.gameplay) {
            const currentRoom = this.getCurrentRoom(localPlayer);
            locationDiv.textContent = `Location: ${this.getRoomDisplayName(currentRoom)}`;
        }
    }
    
    updateTaskList() {
        const taskItemsDiv = document.getElementById('task-items');
        if (!taskItemsDiv || !this.gameplay || !this.gameplay.tasks) return;
        
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        // Ne pas afficher les tâches pour les imposteurs
        if (localPlayer.isImpostor) {
            taskItemsDiv.innerHTML = '<div style="color: #e74c3c;">🔪 Éliminez les coéquipiers</div>';
            return;
        }
        
        let taskHTML = '';
        let completedTasks = 0;
        let totalTasks = 0;
        
        for (const [id, task] of this.gameplay.tasks) {
            totalTasks++;
            const icon = task.completed ? '✅' : '📋';
            const style = task.completed ? 'color: #27ae60; text-decoration: line-through;' : 'color: white;';
            
            taskHTML += `<div style="${style}; font-size: 12px; margin: 2px 0;">
                ${icon} ${task.name} (${this.getRoomDisplayName(task.room)})
            </div>`;
            
            if (task.completed) completedTasks++;
        }
        
        const progressHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #3498db;">
                Progression: ${completedTasks}/${totalTasks}
            </div>
        `;
        
        taskItemsDiv.innerHTML = progressHTML + taskHTML;
    }
    
    updateMiniMap() {
        if (!this.miniMapCtx || !this.gameplay) return;
        
        const ctx = this.miniMapCtx;
        const canvas = this.miniMapCanvas;
        
        // Effacer
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dessiner la carte en miniature
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dessiner les salles
        const scale = 0.25; // Échelle pour la mini-carte
        
        for (const [roomName, room] of Object.entries(this.gameplay.map.rooms)) {
            ctx.fillStyle = room.color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(
                room.x * scale,
                room.y * scale,
                room.width * scale,
                room.height * scale
            );
        }
        
        ctx.globalAlpha = 1;
        
        // Dessiner les joueurs
        for (const [id, player] of this.renderer.players) {
            ctx.fillStyle = player.isLocal ? '#f1c40f' : this.getPlayerColorHex(player.color);
            ctx.beginPath();
            ctx.arc(player.x * scale, player.y * scale, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Contour pour le joueur local
            if (player.isLocal) {
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    render() {
        try {
            // Renderer principal
            if (this.renderer && this.renderer.render) {
                this.renderer.render();
            }
            
            // Renderer des animations
            if (this.animations && this.animations.render && this.renderer.ctx) {
                this.animations.render(this.renderer.ctx);
            }
            
            // Renderer des interactions
            if (this.interactions && this.interactions.render && this.renderer.ctx) {
                this.interactions.render(this.renderer.ctx);
            }
            
        } catch (error) {
            console.error('❌ Render error:', error);
        }
    }
    
    initEmergencyMode() {
        console.log('🚨 Initializing emergency mode...');
        
        // Mode de secours basique
        const emergencyDiv = document.createElement('div');
        emergencyDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        emergencyDiv.innerHTML = `
            <h2>🚨 Mode d'Urgence</h2>
            <p>Impossible d'initialiser le jeu complet.</p>
            <p>Utilisation du mode de base.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #e74c3c;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 20px;
            ">Recharger</button>
        `;
        
        document.body.appendChild(emergencyDiv);
    }
    
    // Méthodes utilitaires
    getCurrentRoom(player) {
        if (!this.gameplay || !this.gameplay.map) return 'unknown';
        
        for (const [roomName, room] of Object.entries(this.gameplay.map.rooms)) {
            if (
                player.x >= room.x &&
                player.x <= room.x + room.width &&
                player.y >= room.y &&
                player.y <= room.y + room.height
            ) {
                return roomName;
            }
        }
        
        return 'corridor';
    }
    
    getRoomDisplayName(roomName) {
        const names = {
            cafeteria: 'Cafétéria',
            weapons: 'Armurerie',
            o2: 'O2',
            navigation: 'Navigation',
            shields: 'Boucliers',
            communications: 'Communications',
            storage: 'Stockage',
            electrical: 'Électricité',
            lowerEngine: 'Moteur Inférieur',
            upperEngine: 'Moteur Supérieur',
            security: 'Sécurité',
            reactor: 'Réacteur',
            medbay: 'Infirmerie',
            admin: 'Administration'
        };
        
        return names[roomName] || roomName;
    }
    
    getPlayerColorHex(color) {
        const colors = {
            red: '#e74c3c',
            blue: '#3498db',
            green: '#27ae60',
            yellow: '#f1c40f',
            orange: '#e67e22',
            pink: '#e91e63',
            cyan: '#1abc9c',
            lime: '#2ecc71',
            purple: '#9b59b6',
            black: '#34495e'
        };
        
        return colors[color] || colors.red;
    }
    
    // Méthodes publiques pour l'interaction
    pauseGame() {
        this.isRunning = false;
        console.log('⏸️ Game paused');
    }
    
    resumeGame() {
        this.isRunning = true;
        this.lastUpdate = Date.now();
        this.startGameLoop();
        console.log('▶️ Game resumed');
    }
    
    stopGame() {
        this.isRunning = false;
        console.log('⏹️ Game stopped');
    }
    
    restartGame() {
        this.stopGame();
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Among Us Master Game...');
    
    // Donner un peu de temps pour que tous les scripts se chargent
    setTimeout(() => {
        window.ultraSafeMasterGame = new AmongUsMasterGame();
    }, 1000);
});

// Export global
window.AmongUsMasterGame = AmongUsMasterGame;

console.log('✅ Among Us Master Game System loaded');
