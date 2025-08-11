class GraphicsEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.layers = {
            background: new OffscreenCanvas(canvas.width, canvas.height),
            map: new OffscreenCanvas(canvas.width, canvas.height),
            objects: new OffscreenCanvas(canvas.width, canvas.height),
            players: new OffscreenCanvas(canvas.width, canvas.height),
            ui: new OffscreenCanvas(canvas.width, canvas.height)
        };
        
        this.animations = new Map();
        this.sprites = new Map();
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };

        this.setupCanvas();
    }

    setupCanvas() {
        // Configuration haute performance
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Ajuster la taille du canvas pour correspondre à la résolution de l'écran
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const scale = window.devicePixelRatio;
        this.canvas.width = window.innerWidth * scale;
        this.canvas.height = window.innerHeight * scale;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        // Redimensionner tous les calques
        Object.values(this.layers).forEach(layer => {
            layer.width = this.canvas.width;
            layer.height = this.canvas.height;
        });
    }

    loadSprite(name, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    drawRoom(room) {
        const ctx = this.layers.map.getContext('2d');
        ctx.clearRect(0, 0, this.layers.map.width, this.layers.map.height);
        
        // Dessiner le fond de la salle
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, room.dimensions.width, room.dimensions.height);
        
        // Dessiner les murs et obstacles
        if (room.walls) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            room.walls.forEach(wall => {
                ctx.beginPath();
                ctx.moveTo(wall.start.x, wall.start.y);
                ctx.lineTo(wall.end.x, wall.end.y);
                ctx.stroke();
            });
        }
        
        // Dessiner les points d'intérêt
        if (room.interactables) {
            room.interactables.forEach(item => {
                this.drawInteractable(ctx, item);
            });
        }
    }

    drawPlayer(player) {
        const ctx = this.layers.players.getContext('2d');
        
        // Position ajustée avec la caméra
        const x = player.position.x - this.camera.x;
        const y = player.position.y - this.camera.y;
        
        // Dessiner l'ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 40, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessiner le corps du personnage
        ctx.fillStyle = player.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Corps principal
        ctx.beginPath();
        ctx.roundRect(x - 20, y - 30, 40, 60, 10);
        ctx.fill();
        ctx.stroke();
        
        // Visière
        ctx.fillStyle = '#9BA4B4';
        ctx.beginPath();
        ctx.ellipse(x + 5, y - 10, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Animation de mouvement
        if (player.isMoving) {
            this.animatePlayerMovement(player);
        }
    }

    drawInteractable(ctx, item) {
        switch (item.type) {
            case 'vent':
                ctx.fillStyle = '#4a4a4a';
                ctx.strokeStyle = '#2a2a2a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(item.x - 25, item.y - 25, 50, 50, 5);
                ctx.fill();
                ctx.stroke();
                
                // Grille de ventilation
                for (let i = -15; i <= 15; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(item.x + i, item.y - 15);
                    ctx.lineTo(item.x + i, item.y + 15);
                    ctx.stroke();
                }
                break;
                
            case 'task':
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'emergencyButton':
                ctx.fillStyle = '#FF0000';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    animatePlayerMovement(player) {
        // Animation de balancement pendant le mouvement
        const amplitude = 5;
        const frequency = 0.1;
        const time = performance.now() * 0.001;
        
        const wobble = Math.sin(time * frequency) * amplitude;
        player.renderOffset = { x: 0, y: wobble };
    }

    updateCamera(target) {
        // Smooth camera following
        const targetX = target.position.x - this.canvas.width / (2 * this.camera.zoom);
        const targetY = target.position.y - this.canvas.height / (2 * this.camera.zoom);
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
    }

    render(gameState) {
        // Effacer le canvas principal
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mettre à jour la caméra
        const localPlayer = gameState.getLocalPlayer();
        if (localPlayer) {
            this.updateCamera(localPlayer);
        }
        
        // Dessiner la map
        const currentRoom = gameState.getCurrentRoom();
        if (currentRoom) {
            this.drawRoom(currentRoom);
        }
        
        // Dessiner les joueurs
        gameState.players.forEach(player => {
            this.drawPlayer(player);
        });
        
        // Composer les calques
        Object.values(this.layers).forEach(layer => {
            this.ctx.drawImage(layer, 0, 0);
        });
        
        // Dessiner l'interface utilisateur
        this.drawUI(gameState);
    }

    drawUI(gameState) {
        const ctx = this.layers.ui.getContext('2d');
        ctx.clearRect(0, 0, this.layers.ui.width, this.layers.ui.height);
        
        // Dessiner les éléments d'interface selon l'état du jeu
        if (gameState.currentInteractable) {
            this.drawInteractionPrompt(ctx, gameState.currentInteractable);
        }
        
        // Dessiner la barre de tâches
        this.drawTaskBar(ctx, gameState.taskCompletion);
        
        // Dessiner les boutons spéciaux (Kill, Use, Report)
        if (gameState.localPlayer.isImpostor) {
            this.drawKillButton(ctx, gameState.killCooldown);
        }
    }

    drawParticles(particles) {
        const ctx = this.layers.objects.getContext('2d');
        particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
