// Among Us - Contrôles améliorés et gameplay
class GameControls {
    constructor(renderer) {
        this.renderer = renderer;
        this.isGameActive = true;
        this.keys = new Set();
        this.gameMode = 'freeplay'; // freeplay, multiplayer
        
        // Configuration des contrôles
        this.config = {
            moveSpeed: 200, // pixels par seconde
            sprintMultiplier: 1.5,
            interactionRange: 80,
            cameraSmoothing: 0.08
        };
        
        // État du joueur
        this.playerState = {
            isMoving: false,
            isSprinting: false,
            lastDirection: { x: 0, y: 1 }, // direction pour l'animation
            interactionTarget: null
        };
        
        this.setupAdvancedControls();
        this.setupGameMechanics();
    }
    
    setupAdvancedControls() {
        // Mouvement fluide avec WASD
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // Contrôles tactiles pour mobile
        this.setupTouchControls();
        
        // Interactions avec la souris
        this.setupMouseControls();
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        // Joystick virtuel
        this.createVirtualJoystick();
        
        // Gestes tactiles
        this.renderer.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        this.renderer.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Mouvement du joueur basé sur le delta
            this.handleTouchMovement(deltaX, deltaY);
        });
        
        this.renderer.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchDuration = Date.now() - touchStartTime;
            
            // Tap court = interaction
            if (touchDuration < 300) {
                this.handleInteraction();
            }
        });
    }
    
    createVirtualJoystick() {
        // Créer un joystick virtuel pour mobile
        const joystickContainer = document.createElement('div');
        joystickContainer.className = 'virtual-joystick';
        joystickContainer.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50px;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: none;
            z-index: 1000;
        `;
        
        const joystickKnob = document.createElement('div');
        joystickKnob.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(103, 126, 234, 0.8);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        
        joystickContainer.appendChild(joystickKnob);
        document.body.appendChild(joystickContainer);
        
        // Détecter si on est sur mobile
        if ('ontouchstart' in window) {
            joystickContainer.style.display = 'block';
        }
        
        this.virtualJoystick = {
            container: joystickContainer,
            knob: joystickKnob,
            active: false,
            startPos: { x: 0, y: 0 },
            currentPos: { x: 0, y: 0 }
        };
    }
    
    setupMouseControls() {
        // Clic droit pour interactions
        this.renderer.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleInteraction();
        });
        
        // Clic gauche pour se déplacer vers un point
        this.renderer.canvas.addEventListener('click', (e) => {
            const rect = this.renderer.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handlePointAndClick(x, y);
        });
    }
    
    setupGameMechanics() {
        // Tâches interactives
        this.tasks = [
            { id: 'fuel', name: 'Faire le plein', x: 300, y: 200, completed: false },
            { id: 'wires', name: 'Réparer les câbles', x: 500, y: 300, completed: false },
            { id: 'scan', name: 'Scanner medical', x: 700, y: 400, completed: false }
        ];
        
        // Ajouter les tâches à la carte
        this.addTasksToRenderer();
        
        // Système d'éclairage simple
        this.setupLighting();
    }
    
    addTasksToRenderer() {
        // Ajouter des objets interactifs pour les tâches
        for (const task of this.tasks) {
            // Convertir en coordonnées de tuile
            const tileX = Math.floor(task.x / this.renderer.config.tileSize);
            const tileY = Math.floor(task.y / this.renderer.config.tileSize);
            
            // Marquer comme objet interactif (simulé)
            console.log(`Added task "${task.name}" at tile ${tileX}, ${tileY}`);
        }
    }
    
    setupLighting() {
        // Système d'éclairage simple
        this.lighting = {
            enabled: true,
            darkness: 0.7, // 0 = jour complet, 1 = nuit complète
            playerLightRadius: 150,
            ambientLight: 0.3
        };
    }
    
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateInteractions();
        this.updateGameLogic(deltaTime);
    }
    
    updateMovement(deltaTime) {
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        // Mouvement basé sur les touches pressées
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) moveY -= 1;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) moveY += 1;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) moveX -= 1;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) moveX += 1;
        
        // Normaliser le mouvement diagonal
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/sqrt(2)
            moveY *= 0.707;
        }
        
        // Appliquer la vitesse
        const speed = this.config.moveSpeed * (this.playerState.isSprinting ? this.config.sprintMultiplier : 1);
        localPlayer.velocity.x = moveX * speed;
        localPlayer.velocity.y = moveY * speed;
        
        // Mettre à jour l'état du joueur
        this.playerState.isMoving = moveX !== 0 || moveY !== 0;
        
        if (this.playerState.isMoving) {
            this.playerState.lastDirection = { x: moveX, y: moveY };
            localPlayer.animation = 'walk';
        } else {
            localPlayer.animation = 'idle';
        }
        
        // Appliquer le mouvement avec collision
        this.applyMovementWithCollision(localPlayer, deltaTime);
    }
    
    applyMovementWithCollision(player, deltaTime) {
        const newX = player.x + player.velocity.x * deltaTime / 1000;
        const newY = player.y + player.velocity.y * deltaTime / 1000;
        
        // Vérification des collisions avec les murs
        const tileSize = this.renderer.config.tileSize;
        const playerRadius = this.renderer.config.playerSize / 2;
        
        // Test horizontal
        const leftTile = Math.floor((newX - playerRadius) / tileSize);
        const rightTile = Math.floor((newX + playerRadius) / tileSize);
        const currentYTile = Math.floor(player.y / tileSize);
        
        let canMoveX = true;
        if (this.renderer.map.walls.has(`${leftTile},${currentYTile}`) || 
            this.renderer.map.walls.has(`${rightTile},${currentYTile}`)) {
            canMoveX = false;
        }
        
        // Test vertical
        const topTile = Math.floor((newY - playerRadius) / tileSize);
        const bottomTile = Math.floor((newY + playerRadius) / tileSize);
        const currentXTile = Math.floor(player.x / tileSize);
        
        let canMoveY = true;
        if (this.renderer.map.walls.has(`${currentXTile},${topTile}`) || 
            this.renderer.map.walls.has(`${currentXTile},${bottomTile}`)) {
            canMoveY = false;
        }
        
        // Appliquer le mouvement
        if (canMoveX) player.x = newX;
        if (canMoveY) player.y = newY;
        
        // Limites de la carte
        const mapWidth = this.renderer.map.width * tileSize;
        const mapHeight = this.renderer.map.height * tileSize;
        
        player.x = Math.max(playerRadius, Math.min(player.x, mapWidth - playerRadius));
        player.y = Math.max(playerRadius, Math.min(player.y, mapHeight - playerRadius));
    }
    
    updateInteractions() {
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        // Trouver les objets/tâches à proximité
        let nearestTask = null;
        let nearestDistance = Infinity;
        
        for (const task of this.tasks) {
            if (task.completed) continue;
            
            const distance = Math.sqrt(
                Math.pow(localPlayer.x - task.x, 2) + 
                Math.pow(localPlayer.y - task.y, 2)
            );
            
            if (distance < this.config.interactionRange && distance < nearestDistance) {
                nearestTask = task;
                nearestDistance = distance;
            }
        }
        
        this.playerState.interactionTarget = nearestTask;
    }
    
    updateGameLogic(deltaTime) {
        // Logique de jeu simple
        this.updateTasks();
        this.updateUI();
    }
    
    updateTasks() {
        // Vérifier si toutes les tâches sont terminées
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        
        if (completedTasks === totalTasks && totalTasks > 0) {
            console.log('🎉 Toutes les tâches terminées !');
            this.showVictoryScreen();
        }
    }
    
    updateUI() {
        // Mettre à jour l'interface utilisateur
        this.drawTasksOnMap();
        this.drawInteractionPrompt();
        this.drawLighting();
    }
    
    drawTasksOnMap() {
        const ctx = this.renderer.ctx;
        
        ctx.save();
        ctx.scale(this.renderer.camera.zoom, this.renderer.camera.zoom);
        ctx.translate(-this.renderer.camera.x, -this.renderer.camera.y);
        
        for (const task of this.tasks) {
            if (task.completed) continue;
            
            // Icône de tâche
            ctx.fillStyle = task === this.playerState.interactionTarget ? '#00ff00' : '#ffff00';
            ctx.beginPath();
            ctx.arc(task.x, task.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Indicateur de tâche
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', task.x, task.y + 4);
        }
        
        ctx.restore();
    }
    
    drawInteractionPrompt() {
        if (!this.playerState.interactionTarget) return;
        
        const ctx = this.renderer.ctx;
        const task = this.playerState.interactionTarget;
        
        // Message d'interaction
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(20, this.renderer.canvas.height - 100, 300, 60);
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, this.renderer.canvas.height - 100, 300, 60);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Appuyez sur E pour: ${task.name}`, 30, this.renderer.canvas.height - 70);
        ctx.fillText('Clic droit ou E pour interagir', 30, this.renderer.canvas.height - 50);
    }
    
    drawLighting() {
        if (!this.lighting.enabled) return;
        
        const ctx = this.renderer.ctx;
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        // Overlay sombre
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(0, 0, 50, ${this.lighting.darkness})`;
        ctx.fillRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        
        // Lumière du joueur
        ctx.globalCompositeOperation = 'screen';
        
        const playerScreenX = (localPlayer.x - this.renderer.camera.x) * this.renderer.camera.zoom;
        const playerScreenY = (localPlayer.y - this.renderer.camera.y) * this.renderer.camera.zoom;
        
        const gradient = ctx.createRadialGradient(
            playerScreenX, playerScreenY, 0,
            playerScreenX, playerScreenY, this.lighting.playerLightRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        
        ctx.restore();
    }
    
    handleKeyPress(e) {
        switch (e.code) {
            case 'KeyE':
            case 'Space':
                this.handleInteraction();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.playerState.isSprinting = true;
                break;
            case 'KeyM':
                this.toggleMap();
                break;
            case 'KeyL':
                this.toggleLighting();
                break;
        }
    }
    
    handleInteraction() {
        if (!this.playerState.interactionTarget) return;
        
        const task = this.playerState.interactionTarget;
        console.log(`Interacting with task: ${task.name}`);
        
        // Simuler l'accomplissement de la tâche
        task.completed = true;
        this.playerState.interactionTarget = null;
        
        // Effet visuel
        this.showTaskCompletionEffect(task);
    }
    
    handleTouchMovement(deltaX, deltaY) {
        // Convertir le mouvement tactile en mouvement du joueur
        const sensitivity = 0.5;
        const moveX = deltaX * sensitivity;
        const moveY = deltaY * sensitivity;
        
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (localPlayer) {
            localPlayer.velocity.x = Math.max(-200, Math.min(200, moveX));
            localPlayer.velocity.y = Math.max(-200, Math.min(200, moveY));
        }
    }
    
    handlePointAndClick(screenX, screenY) {
        // Convertir en coordonnées monde
        const worldX = (screenX / this.renderer.camera.zoom) + this.renderer.camera.x;
        const worldY = (screenY / this.renderer.camera.zoom) + this.renderer.camera.y;
        
        // Déplacer le joueur vers cette position (implémentation simple)
        const localPlayer = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (localPlayer) {
            const dx = worldX - localPlayer.x;
            const dy = worldY - localPlayer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                localPlayer.velocity.x = (dx / distance) * 150;
                localPlayer.velocity.y = (dy / distance) * 150;
                
                // Arrêter le mouvement après un délai
                setTimeout(() => {
                    localPlayer.velocity.x = 0;
                    localPlayer.velocity.y = 0;
                }, distance / 150 * 1000);
            }
        }
    }
    
    showTaskCompletionEffect(task) {
        console.log(`✅ Task completed: ${task.name}`);
        
        // Effet visuel simple (peut être amélioré)
        const ctx = this.renderer.ctx;
        setTimeout(() => {
            ctx.save();
            ctx.scale(this.renderer.camera.zoom, this.renderer.camera.zoom);
            ctx.translate(-this.renderer.camera.x, -this.renderer.camera.y);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓ Terminé!', task.x, task.y - 30);
            
            ctx.restore();
        }, 100);
    }
    
    showVictoryScreen() {
        const ctx = this.renderer.ctx;
        
        // Overlay de victoire
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VICTOIRE!', this.renderer.canvas.width / 2, this.renderer.canvas.height / 2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Inter, Arial';
        ctx.fillText('Toutes les tâches terminées!', this.renderer.canvas.width / 2, this.renderer.canvas.height / 2 + 20);
        
        ctx.font = '16px Inter, Arial';
        ctx.fillText('Appuyez sur R pour recommencer', this.renderer.canvas.width / 2, this.renderer.canvas.height / 2 + 60);
    }
    
    toggleMap() {
        // Basculer l'affichage de la mini-carte
        console.log('Toggle map view');
    }
    
    toggleLighting() {
        this.lighting.enabled = !this.lighting.enabled;
        console.log(`Lighting: ${this.lighting.enabled ? 'ON' : 'OFF'}`);
    }
}

// Export
window.GameControls = GameControls;
