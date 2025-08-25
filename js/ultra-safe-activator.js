// Script d'activation ultra-simple et robuste
console.log('🛡️ Ultra-Safe Game Activator starting...');

class UltraSafeGame {
    constructor() {
        this.isRunning = false;
        this.renderer = null;
        this.frameCount = 0;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Ultra-Safe Game...');
        
        // Nettoyer d'abord
        this.cleanup();
        
        // Attendre que tout soit prêt
        setTimeout(() => {
            this.start();
        }, 1000);
    }
    
    cleanup() {
        console.log('🧹 Cleaning up...');
        
        // Masquer les interfaces
        const interfaces = [
            '.v4-loading-screen',
            '.v4-main-menu', 
            '.v4-mobile-interface',
            '#loading-screen',
            '#main-menu'
        ];
        
        interfaces.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.zIndex = '-1';
            });
        });
        
        // Supprimer les anciens canvas de test
        const testCanvases = document.querySelectorAll('canvas[id*="test"], canvas[id*="emergency"]');
        testCanvases.forEach(canvas => canvas.remove());
    }
    
    start() {
        console.log('🎮 Starting Ultra-Safe Game...');
        
        try {
            // Créer le super renderer
            this.renderer = new SuperRenderer();
            
            // Setup des contrôles
            this.setupControls();
            
            // Démarrer la boucle de jeu
            this.startGameLoop();
            
            console.log('✅ Ultra-Safe Game started successfully!');
            
            // Afficher les instructions
            setTimeout(() => {
                this.showInstructions();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            this.createEmergencyMode();
        }
    }
    
    setupControls() {
        console.log('🎮 Setting up controls...');
        
        // Variables de contrôle
        this.keys = {};
        this.touchStart = null;
        
        // Contrôles clavier
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Contrôles souris/tactile
        if (this.renderer && this.renderer.canvas) {
            this.renderer.canvas.addEventListener('click', (e) => this.handleClick(e));
            this.renderer.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            this.renderer.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            this.renderer.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
        
        console.log('✅ Controls setup complete');
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (!this.renderer || !this.renderer.players) return;
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player || !player.velocity) return;
        
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
        this.keys[e.key.toLowerCase()] = false;
        
        if (!this.renderer || !this.renderer.players) return;
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player || !player.velocity) return;
        
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
        if (!this.renderer || !this.renderer.canvas) return;
        
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`🖱️ Teleport to: ${x}, ${y}`);
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (player) {
            player.x = x;
            player.y = y;
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
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (player && player.velocity) {
            const speed = 150;
            player.velocity.x = Math.sign(deltaX) * Math.min(Math.abs(deltaX) * 2, speed);
            player.velocity.y = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 2, speed);
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchStart = null;
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (player && player.velocity) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    }
    
    startGameLoop() {
        console.log('🔄 Starting game loop...');
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
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
            console.warn('⚠️ Game loop error:', error.message);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    showInstructions() {
        console.log('');
        console.log('🎮 ==========================================');
        console.log('🎮 AMONG US V4 - ULTRA-SAFE MODE ACTIVE');
        console.log('🎮 ==========================================');
        console.log('🎮 Contrôles:');
        console.log('🎮   WASD ou flèches: Se déplacer');
        console.log('🎮   Clic souris: Téléportation');
        console.log('🎮   Tactile: Contrôle mobile');
        console.log('🎮 ==========================================');
        console.log('');
    }
    
    createEmergencyMode() {
        console.log('🚨 Creating emergency mode...');
        
        document.body.innerHTML = `
            <canvas id="emergency-canvas" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #0a0a0f;
                z-index: 10000;
            "></canvas>
        `;
        
        const canvas = document.getElementById('emergency-canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Affichage d'urgence simple
        function renderEmergency() {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('AMONG US V4', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.fillText('Emergency Mode - System Recovery', canvas.width / 2, canvas.height / 2 + 20);
            
            requestAnimationFrame(renderEmergency);
        }
        
        renderEmergency();
    }
}

// Démarrer le jeu ultra-sûr
window.ultraSafeGame = new UltraSafeGame();

console.log('✅ Ultra-Safe Game Activator loaded');
