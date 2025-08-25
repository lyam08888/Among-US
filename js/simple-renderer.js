// Among Us - Moteur de rendu simple avec graphiques
class SimpleRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = new Map();
        this.loadedImages = new Map();
        
        // État du jeu
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.players = new Map();
        this.map = null;
        
        // Configuration
        this.config = {
            tileSize: 64,
            playerSize: 48,
            viewDistance: 800
        };
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Initializing Simple Renderer...');
        
        try {
            // Charger les assets de base
            await this.loadBasicAssets();
            
            // Créer une carte simple
            this.createSimpleMap();
            
            // Créer un joueur de test
            this.createTestPlayer();
            
            console.log('✅ Simple Renderer initialized');
        } catch (error) {
            console.error('❌ Failed to initialize renderer:', error);
        }
    }
    
    async loadBasicAssets() {
        // Créer des textures de base si les vraies ne sont pas disponibles
        this.createBasicTextures();
        
        // Essayer de charger les vraies textures
        try {
            await this.loadImage('floor', 'assets/decor/floor-metal.png');
            await this.loadImage('wall', 'assets/decor/wall-panel.png');
            await this.loadImage('player-red', 'assets/characters/crew-red-sheet.png');
        } catch (error) {
            console.log('ℹ️ Using fallback textures');
        }
    }
    
    createBasicTextures() {
        // Texture de sol
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 64;
        floorCanvas.height = 64;
        const floorCtx = floorCanvas.getContext('2d');
        
        // Sol métallique
        const floorGradient = floorCtx.createLinearGradient(0, 0, 64, 64);
        floorGradient.addColorStop(0, '#4a5568');
        floorGradient.addColorStop(1, '#2d3748');
        floorCtx.fillStyle = floorGradient;
        floorCtx.fillRect(0, 0, 64, 64);
        
        // Détails
        floorCtx.strokeStyle = '#718096';
        floorCtx.lineWidth = 1;
        for (let i = 0; i < 64; i += 16) {
            floorCtx.beginPath();
            floorCtx.moveTo(i, 0);
            floorCtx.lineTo(i, 64);
            floorCtx.stroke();
            floorCtx.beginPath();
            floorCtx.moveTo(0, i);
            floorCtx.lineTo(64, i);
            floorCtx.stroke();
        }
        
        this.loadedImages.set('floor-basic', floorCanvas);
        
        // Texture de mur
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 64;
        wallCanvas.height = 64;
        const wallCtx = wallCanvas.getContext('2d');
        
        const wallGradient = wallCtx.createLinearGradient(0, 0, 0, 64);
        wallGradient.addColorStop(0, '#2d3748');
        wallGradient.addColorStop(1, '#1a202c');
        wallCtx.fillStyle = wallGradient;
        wallCtx.fillRect(0, 0, 64, 64);
        
        // Panneau
        wallCtx.strokeStyle = '#4a5568';
        wallCtx.lineWidth = 2;
        wallCtx.strokeRect(8, 8, 48, 48);
        
        this.loadedImages.set('wall-basic', wallCanvas);
    }
    
    async loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedImages.set(key, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            img.src = src;
        });
    }
    
    createSimpleMap() {
        // Carte simple 20x15
        this.map = {
            width: 20,
            height: 15,
            tiles: [],
            walls: new Set()
        };
        
        // Remplir avec du sol
        for (let y = 0; y < this.map.height; y++) {
            this.map.tiles[y] = [];
            for (let x = 0; x < this.map.width; x++) {
                this.map.tiles[y][x] = 'floor';
            }
        }
        
        // Ajouter des murs sur les bords
        for (let x = 0; x < this.map.width; x++) {
            this.map.walls.add(`${x},0`);
            this.map.walls.add(`${x},${this.map.height - 1}`);
        }
        for (let y = 0; y < this.map.height; y++) {
            this.map.walls.add(`0,${y}`);
            this.map.walls.add(`${this.map.width - 1},${y}`);
        }
        
        // Ajouter quelques murs intérieurs
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * (this.map.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.map.height - 2)) + 1;
            this.map.walls.add(`${x},${y}`);
        }
    }
    
    createTestPlayer() {
        this.players.set('player1', {
            id: 'player1',
            x: this.map.width * this.config.tileSize / 2,
            y: this.map.height * this.config.tileSize / 2,
            color: 'red',
            name: 'Player',
            isLocal: true,
            velocity: { x: 0, y: 0 },
            animation: 'idle',
            animationFrame: 0,
            animationTime: 0
        });
        
        // Centrer la caméra sur le joueur
        const player = this.players.get('player1');
        this.camera.x = player.x - this.canvas.width / 2;
        this.camera.y = player.y - this.canvas.height / 2;
    }
    
    update(deltaTime) {
        // Mettre à jour les joueurs
        for (const [id, player] of this.players) {
            this.updatePlayer(player, deltaTime);
        }
        
        // Mettre à jour la caméra
        this.updateCamera(deltaTime);
    }
    
    updatePlayer(player, deltaTime) {
        // Animation simple
        player.animationTime += deltaTime;
        if (player.animationTime > 200) { // 200ms par frame
            player.animationFrame = (player.animationFrame + 1) % 4;
            player.animationTime = 0;
        }
        
        // Mouvement basé sur la vélocité (contrôlée par GameControls)
        if (player.isLocal) {
            player.x += player.velocity.x * deltaTime / 1000;
            player.y += player.velocity.y * deltaTime / 1000;
            
            // Limites de la carte
            const tileSize = this.config.tileSize;
            player.x = Math.max(tileSize, Math.min(player.x, (this.map.width - 1) * tileSize));
            player.y = Math.max(tileSize, Math.min(player.y, (this.map.height - 1) * tileSize));
        }
    }
    
    updateCamera(deltaTime) {
        // Suivre le joueur local
        const localPlayer = Array.from(this.players.values()).find(p => p.isLocal);
        if (localPlayer) {
            const targetX = localPlayer.x - this.canvas.width / (2 * this.camera.zoom);
            const targetY = localPlayer.y - this.canvas.height / (2 * this.camera.zoom);
            
            // Lissage de la caméra
            const smoothing = 0.1;
            this.camera.x += (targetX - this.camera.x) * smoothing;
            this.camera.y += (targetY - this.camera.y) * smoothing;
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        // Effacer l'écran
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sauvegarder le contexte
        ctx.save();
        
        // Appliquer la transformation de la caméra
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Rendu de la carte
        this.renderMap();
        
        // Rendu des joueurs
        this.renderPlayers();
        
        // Restaurer le contexte
        ctx.restore();
        
        // Interface utilisateur
        this.renderUI();
    }
    
    renderMap() {
        if (!this.map) return;
        
        const ctx = this.ctx;
        const tileSize = this.config.tileSize;
        
        // Calculer les tuiles visibles
        const startX = Math.floor(this.camera.x / tileSize);
        const endX = Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / tileSize);
        const startY = Math.floor(this.camera.y / tileSize);
        const endY = Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / tileSize);
        
        // Rendu du sol
        for (let y = Math.max(0, startY); y < Math.min(this.map.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.map.width, endX); x++) {
                const tileType = this.map.tiles[y][x];
                const texture = this.loadedImages.get('floor') || this.loadedImages.get('floor-basic');
                
                if (texture) {
                    ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
                } else {
                    // Fallback
                    ctx.fillStyle = '#4a5568';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
        
        // Rendu des murs
        for (let y = Math.max(0, startY); y < Math.min(this.map.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.map.width, endX); x++) {
                if (this.map.walls.has(`${x},${y}`)) {
                    const texture = this.loadedImages.get('wall') || this.loadedImages.get('wall-basic');
                    
                    if (texture) {
                        ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
                    } else {
                        // Fallback
                        ctx.fillStyle = '#2d3748';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        ctx.strokeStyle = '#4a5568';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x * tileSize + 4, y * tileSize + 4, tileSize - 8, tileSize - 8);
                    }
                }
            }
        }
    }
    
    renderPlayers() {
        const ctx = this.ctx;
        
        for (const [id, player] of this.players) {
            this.renderPlayer(player);
        }
    }
    
    renderPlayer(player) {
        const ctx = this.ctx;
        const size = this.config.playerSize;
        
        // Position du joueur
        const x = player.x - size / 2;
        const y = player.y - size / 2;
        
        // Vérifier si le joueur est visible
        const screenX = (x - this.camera.x) * this.camera.zoom;
        const screenY = (y - this.camera.y) * this.camera.zoom;
        
        if (screenX + size < 0 || screenX > this.canvas.width || 
            screenY + size < 0 || screenY > this.canvas.height) {
            return; // Pas visible
        }
        
        // Dessiner le personnage
        const texture = this.loadedImages.get(`player-${player.color}`);
        
        if (texture) {
            // Utiliser la vraie texture avec animation
            const frameWidth = texture.width / 4; // 4 frames par animation
            const frameHeight = texture.height / 6; // 6 animations
            const animRow = 0; // Animation idle
            
            ctx.drawImage(
                texture,
                player.animationFrame * frameWidth, animRow * frameHeight,
                frameWidth, frameHeight,
                x, y, size, size
            );
        } else {
            // Fallback - crewmate simple
            this.renderSimpleCrewmate(player.x, player.y, player.color, size);
        }
        
        // Nom du joueur
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, y - 10);
    }
    
    renderSimpleCrewmate(x, y, color, size) {
        const ctx = this.ctx;
        const scale = size / 48; // Taille de référence
        
        // Couleurs
        const colors = {
            red: '#ef4444',
            blue: '#132ed1',
            green: '#117f2d',
            yellow: '#f5f557',
            pink: '#ed54ba',
            orange: '#f07613',
            cyan: '#38fedc',
            lime: '#50ef39',
            purple: '#6b2fbb',
            black: '#3f474e'
        };
        
        const bodyColor = colors[color] || colors.red;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Corps principal
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 5, 18, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visière
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(0, -8, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet visière
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-5, -12, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sac à dos
        const backpackColor = this.darkenColor(bodyColor, 0.2);
        ctx.fillStyle = backpackColor;
        ctx.beginPath();
        ctx.ellipse(15, 2, 8, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    darkenColor(color, factor) {
        // Simple darkening function
        const rgb = color.match(/\\d+/g);
        if (rgb) {
            const r = Math.floor(parseInt(rgb[0]) * (1 - factor));
            const g = Math.floor(parseInt(rgb[1]) * (1 - factor));
            const b = Math.floor(parseInt(rgb[2]) * (1 - factor));
            return `rgb(${r}, ${g}, ${b})`;
        }
        return color;
    }
    
    renderUI() {
        const ctx = this.ctx;
        
        // HUD simple
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, 60);
        
        // Titre
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Among Us V4', 20, 30);
        
        // Info du joueur
        ctx.font = '14px Inter, Arial';
        ctx.fillText('Graphics Engine: Active', 20, 50);
        
        // Mini-carte
        this.renderMinimap();
        
        // FPS
        ctx.textAlign = 'right';
        ctx.fillText(`FPS: ${Math.round(1000 / 16)}`, this.canvas.width - 20, 30);
    }
    
    renderMinimap() {
        const ctx = this.ctx;
        const minimapSize = 150;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = 80;
        
        // Fond de la minimap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Bordure
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        if (!this.map) return;
        
        const scaleX = minimapSize / (this.map.width * this.config.tileSize);
        const scaleY = minimapSize / (this.map.height * this.config.tileSize);
        
        ctx.save();
        ctx.translate(minimapX, minimapY);
        ctx.scale(scaleX, scaleY);
        
        // Dessiner la carte en miniature
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 0, this.map.width * this.config.tileSize, this.map.height * this.config.tileSize);
        
        // Murs
        ctx.fillStyle = '#2d3748';
        for (const wall of this.map.walls) {
            const [x, y] = wall.split(',').map(Number);
            ctx.fillRect(x * this.config.tileSize, y * this.config.tileSize, this.config.tileSize, this.config.tileSize);
        }
        
        // Joueurs
        for (const [id, player] of this.players) {
            ctx.fillStyle = player.isLocal ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Méthodes d'interaction
    handleClick(x, y) {
        // Convertir les coordonnées écran en coordonnées monde
        const worldX = (x / this.camera.zoom) + this.camera.x;
        const worldY = (y / this.camera.zoom) + this.camera.y;
        
        console.log(`Clicked at world: ${worldX}, ${worldY}`);
    }
    
    handleKeyDown(key) {
        const localPlayer = Array.from(this.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        const speed = 5;
        
        switch (key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                localPlayer.velocity.y = -speed;
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                localPlayer.velocity.y = speed;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                localPlayer.velocity.x = -speed;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                localPlayer.velocity.x = speed;
                break;
        }
    }
    
    handleKeyUp(key) {
        const localPlayer = Array.from(this.players.values()).find(p => p.isLocal);
        if (!localPlayer) return;
        
        switch (key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
            case 's':
            case 'S':
            case 'ArrowDown':
                localPlayer.velocity.y = 0;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
            case 'd':
            case 'D':
            case 'ArrowRight':
                localPlayer.velocity.x = 0;
                break;
        }
    }
}

// Export
window.SimpleRenderer = SimpleRenderer;
