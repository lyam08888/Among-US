// Super-Renderer - Version ultra-robuste pour Among Us V4
console.log('🚀 Super-Renderer initializing...');

class SuperRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas || this.createCanvas();
        this.ctx = ctx || this.canvas.getContext('2d');
        this.players = new Map();
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.config = {
            tileSize: 64,
            playerSize: 48,
            viewDistance: 800
        };
        
        // Toujours créer une carte par défaut
        this.map = {
            width: 20,
            height: 15,
            tiles: [],
            walls: new Set()
        };
        
        this.init();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'super-game-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0a0a0f !important;
            z-index: 1000 !important;
            display: block !important;
        `;
        document.body.appendChild(canvas);
        return canvas;
    }
    
    init() {
        console.log('🎨 Initializing Super Renderer...');
        
        try {
            this.createMap();
            this.createPlayer();
            console.log('✅ Super Renderer initialized successfully');
        } catch (error) {
            console.error('❌ Super Renderer init failed:', error);
        }
    }
    
    createMap() {
        // Créer une carte simple
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
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * (this.map.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.map.height - 2)) + 1;
            this.map.walls.add(`${x},${y}`);
        }
        
        console.log('🗺️ Map created');
    }
    
    createPlayer() {
        const player = {
            id: 'player1',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            color: 'red',
            name: 'Player',
            isLocal: true,
            velocity: { x: 0, y: 0 },
            animation: 'idle',
            animationFrame: 0,
            animationTime: 0,
            size: 40
        };
        
        this.players.set('player1', player);
        
        // Centrer la caméra sur le joueur
        this.camera.x = player.x - this.canvas.width / 2;
        this.camera.y = player.y - this.canvas.height / 2;
        
        console.log('👤 Player created');
    }
    
    update(deltaTime) {
        try {
            // Mettre à jour les joueurs
            for (const [id, player] of this.players) {
                this.updatePlayer(player, deltaTime);
            }
            
            // Mettre à jour la caméra
            this.updateCamera();
        } catch (error) {
            console.warn('⚠️ Update error:', error.message);
        }
    }
    
    updatePlayer(player, deltaTime) {
        if (!player || !player.velocity) return;
        
        // Animation
        player.animationTime = (player.animationTime || 0) + deltaTime;
        if (player.animationTime > 200) {
            player.animationFrame = ((player.animationFrame || 0) + 1) % 4;
            player.animationTime = 0;
        }
        
        // Mouvement
        if (player.isLocal) {
            player.x += player.velocity.x * deltaTime / 1000;
            player.y += player.velocity.y * deltaTime / 1000;
            
            // Limites de l'écran
            player.x = Math.max(player.size, Math.min(player.x, this.canvas.width - player.size));
            player.y = Math.max(player.size, Math.min(player.y, this.canvas.height - player.size));
        }
    }
    
    updateCamera() {
        const localPlayer = Array.from(this.players.values()).find(p => p.isLocal);
        if (localPlayer) {
            // Caméra qui suit le joueur en douceur
            const targetX = localPlayer.x - this.canvas.width / 2;
            const targetY = localPlayer.y - this.canvas.height / 2;
            
            const smoothing = 0.1;
            this.camera.x += (targetX - this.camera.x) * smoothing;
            this.camera.y += (targetY - this.camera.y) * smoothing;
        }
    }
    
    render() {
        try {
            // Effacer l'écran
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Grille de fond
            this.renderGrid();
            
            // Éléments de la carte
            this.renderMapElements();
            
            // Joueurs
            this.renderPlayers();
            
            // Interface utilisateur
            this.renderUI();
            
        } catch (error) {
            console.warn('⚠️ Render error:', error.message);
        }
    }
    
    renderGrid() {
        const ctx = this.ctx;
        const gridSize = 64;
        
        ctx.strokeStyle = '#1a1a2a';
        ctx.lineWidth = 1;
        
        // Lignes verticales
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }
    
    renderMapElements() {
        const ctx = this.ctx;
        const tileSize = this.config.tileSize;
        
        // Éléments décoratifs
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            ctx.fillStyle = '#2a2a3a';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderPlayers() {
        for (const [id, player] of this.players) {
            this.renderPlayer(player);
        }
    }
    
    renderPlayer(player) {
        if (!player) return;
        
        const ctx = this.ctx;
        const x = player.x || 0;
        const y = player.y || 0;
        const size = player.size || 40;
        
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 3, y + size + 3, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corps principal
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Contour
        ctx.strokeStyle = '#cc2222';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Visière
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(x, y - size * 0.3, size * 0.85, size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet visière
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.3, y - size * 0.5, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sac à dos
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.ellipse(x + size * 0.7, y, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nom du joueur
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name || 'Player', x, y - size * 1.8);
        
        // Indicateur de mouvement
        if (player.velocity && (Math.abs(player.velocity.x) > 0 || Math.abs(player.velocity.y) > 0)) {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x + size, y - size, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderUI() {
        const ctx = this.ctx;
        
        // HUD de fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 80);
        ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
        
        // Titre
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('AMONG US V4 - SUPER RENDERER', 20, 35);
        
        // Informations
        ctx.font = '16px Arial';
        ctx.fillText('Status: ACTIVE', 20, 60);
        
        // Contrôles
        ctx.textAlign = 'center';
        ctx.fillText('WASD: Move | Click: Teleport | Working!', this.canvas.width / 2, this.canvas.height - 30);
        
        // Minimap
        this.renderMinimap();
        
        // FPS
        ctx.textAlign = 'right';
        ctx.fillText('FPS: 60', this.canvas.width - 20, 35);
    }
    
    renderMinimap() {
        const ctx = this.ctx;
        const minimapSize = 120;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = 100;
        
        // Fond minimap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Bordure
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Joueurs sur la minimap
        for (const [id, player] of this.players) {
            if (!player) continue;
            
            const mapX = minimapX + (player.x / this.canvas.width) * minimapSize;
            const mapY = minimapY + (player.y / this.canvas.height) * minimapSize;
            
            ctx.fillStyle = player.isLocal ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(mapX, mapY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Export global
window.SuperRenderer = SuperRenderer;

console.log('✅ Super-Renderer class loaded');
