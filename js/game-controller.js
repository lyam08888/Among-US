// Contrôleur de jeu robuste - s'assure que le jeu fonctionne toujours
console.log('🎮 Game Controller initializing...');

class GameController {
    constructor() {
        this.isRunning = false;
        this.canvas = null;
        this.ctx = null;
        this.renderer = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.setupComplete = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 GameController starting...');
        
        // Attendre que la page soit prête
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        // Nettoyer d'abord
        this.cleanup();
        
        // Setup du canvas
        this.setupCanvas();
        
        // Setup du renderer
        this.setupRenderer();
        
        // Setup des contrôles
        this.setupControls();
        
        // Démarrer le jeu
        this.start();
        
        console.log('✅ GameController initialized');
    }
    
    cleanup() {
        console.log('🧹 Cleaning up previous instances...');
        
        // Supprimer les anciens canvas de test
        const oldCanvases = document.querySelectorAll('canvas[id*="test"], canvas[id*="emergency"]');
        oldCanvases.forEach(canvas => canvas.remove());
        
        // Masquer les interfaces
        const interfaces = document.querySelectorAll('.v4-loading-screen, .v4-main-menu, .v4-mobile-interface');
        interfaces.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        });
    }
    
    setupCanvas() {
        console.log('📺 Setting up canvas...');
        
        // Trouver ou créer le canvas principal
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            document.body.appendChild(this.canvas);
        }
        
        // Configuration du canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.canvas.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0a0a0f !important;
            z-index: 100 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            touch-action: none;
            user-select: none;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            if (this.renderer && this.renderer.camera) {
                this.renderer.camera.x = 0;
                this.renderer.camera.y = 0;
            }
        });
        
        console.log('✅ Canvas setup complete');
    }
    
    setupRenderer() {
        console.log('🎨 Setting up renderer...');
        
        try {
            this.renderer = new SimpleRenderer(this.canvas, this.ctx);
            
            // S'assurer qu'il y a un joueur
            if (this.renderer.players && this.renderer.players.size === 0) {
                try {
                    this.renderer.createTestPlayer();
                } catch (playerError) {
                    console.warn('⚠️ Failed to create test player:', playerError.message);
                }
            }
            
            console.log('✅ Renderer setup complete');
        } catch (error) {
            console.error('❌ Failed to setup renderer:', error);
            this.createFallbackRenderer();
        }
    }
    
    createFallbackRenderer() {
        console.log('🔧 Creating fallback renderer...');
        
        this.renderer = {
            update: (deltaTime) => {
                // Mise à jour basique
            },
            render: () => {
                // Rendu de secours
                this.ctx.fillStyle = '#0a0a0f';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Crewmate simple au centre
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                
                // Corps
                this.ctx.fillStyle = '#ff4444';
                this.ctx.beginPath();
                this.ctx.ellipse(centerX, centerY, 30, 40, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Visière
                this.ctx.fillStyle = '#87ceeb';
                this.ctx.beginPath();
                this.ctx.ellipse(centerX, centerY - 15, 25, 20, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Texte
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('AMONG US V4', centerX, centerY + 80);
                this.ctx.fillText('Fallback Renderer Active', centerX, centerY + 110);
                
                this.ctx.font = '16px Arial';
                this.ctx.fillText(`Frame: ${this.frameCount}`, centerX, centerY + 140);
            }
        };
        
        console.log('✅ Fallback renderer created');
    }
    
    setupControls() {
        console.log('🎮 Setting up controls...');
        
        // Contrôles clavier
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Contrôles souris/tactile
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        console.log('✅ Controls setup complete');
    }
    
    handleKeyDown(e) {
        if (!this.renderer || !this.renderer.players) return;
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        const speed = 200;
        
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                player.velocity.y = -speed;
                break;
            case 's':
            case 'arrowdown':
                player.velocity.y = speed;
                break;
            case 'a':
            case 'arrowleft':
                player.velocity.x = -speed;
                break;
            case 'd':
            case 'arrowright':
                player.velocity.x = speed;
                break;
        }
        
        e.preventDefault();
    }
    
    handleKeyUp(e) {
        if (!this.renderer || !this.renderer.players) return;
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
            case 's':
            case 'arrowdown':
                player.velocity.y = 0;
                break;
            case 'a':
            case 'arrowleft':
            case 'd':
            case 'arrowright':
                player.velocity.x = 0;
                break;
        }
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`🖱️ Click at: ${x}, ${y}`);
        
        // Téléportation en mode debug
        if (this.renderer && this.renderer.players) {
            const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
            if (player) {
                player.x = x;
                player.y = y;
            }
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.touchStart) return;
        
        const deltaX = e.touches[0].clientX - this.touchStart.x;
        const deltaY = e.touches[0].clientY - this.touchStart.y;
        
        if (this.renderer && this.renderer.players) {
            const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
            if (player) {
                const speed = 150;
                player.velocity.x = Math.sign(deltaX) * Math.min(Math.abs(deltaX) * 2, speed);
                player.velocity.y = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 2, speed);
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchStart = null;
        
        if (this.renderer && this.renderer.players) {
            const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
            if (player) {
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
        }
    }
    
    start() {
        console.log('🚀 Starting game loop...');
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        // Afficher les instructions
        setTimeout(() => {
            console.log('🎮 GAME CONTROLS:');
            console.log('🎮 WASD or Arrow keys: Move');
            console.log('🎮 Click: Teleport (debug)');
            console.log('🎮 Touch: Move on mobile');
        }, 1000);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        try {
            // Mise à jour
            if (this.renderer && this.renderer.update) {
                this.renderer.update(deltaTime);
            }
            
            // Rendu
            if (this.renderer && this.renderer.render) {
                this.renderer.render();
            }
            
        } catch (error) {
            console.error('❌ Game loop error:', error);
            // Continuer quand même
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    stop() {
        console.log('⏹️ Stopping game...');
        this.isRunning = false;
    }
}

// Créer le contrôleur global
window.gameController = new GameController();

// Export
window.GameController = GameController;
