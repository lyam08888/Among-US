// Among Us - Script de démarrage avec graphiques
class GameStarter {
    constructor() {
        this.isInitialized = false;
        this.engine = null;
        this.app = null;
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Starting Among Us Game...');
        
        try {
            // Attendre que le DOM soit chargé
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialiser le canvas
            this.initCanvas();
            
            // Initialiser le moteur de rendu simple
            this.renderer = new SimpleRenderer(this.canvas, this.ctx);
            
            // Attendre que le renderer soit initialisé
            if (this.renderer.init) {
                await this.renderer.init();
            }
            
            // Initialiser les contrôles de jeu si disponibles
            if (typeof GameControls !== 'undefined') {
                this.gameControls = new GameControls(this.renderer);
            }
            
            // Démarrer la boucle de rendu
            this.startRenderLoop();
            
            // Ajouter les contrôles
            this.setupControls();
            
            // Essayer d'initialiser les systèmes avancés
            setTimeout(() => {
                this.initAdvancedSystems();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to start game:', error);
            this.showError(error);
        }
    }
    
    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.warn('⚠️ Canvas not found, creating one...');
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #0a0a0f;
                touch-action: none;
                user-select: none;
                z-index: 1;
            `;
            document.body.appendChild(this.canvas);
        }
        
        // Configurer le canvas
        this.canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        this.canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        
        console.log('🖼️ Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
    }
    
    startTestRenderer() {
        console.log('🎨 Starting test renderer...');
        
        // Dessiner un écran de test simple
        this.renderTestScreen();
        
        // Animation simple
        this.testAnimationLoop();
    }
    
    renderTestScreen() {
        const ctx = this.ctx;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Fond dégradé
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Logo centré
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AMONG US V4', width/2, height/2 - 100);
        
        // Sous-titre
        ctx.fillStyle = '#667eea';
        ctx.font = '24px Inter, Arial';
        ctx.fillText('Game Engine Loading...', width/2, height/2 - 50);
        
        // Crewmate simple
        this.drawSimpleCrewmate(width/2, height/2 + 50);
        
        // Barre de progression
        this.drawProgressBar(width/2 - 150, height/2 + 150, 300, 8, 0.7);
        
        // Status text
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter, Arial';
        ctx.fillText('Initializing graphics system...', width/2, height/2 + 200);
    }
    
    drawSimpleCrewmate(x, y) {
        const ctx = this.ctx;
        
        // Corps principal
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(x, y, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visière
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(x, y - 15, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet visière
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x - 8, y - 20, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sac à dos
        ctx.fillStyle = '#c53030';
        ctx.beginPath();
        ctx.ellipse(x + 25, y, 15, 25, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawProgressBar(x, y, width, height, progress) {
        const ctx = this.ctx;
        
        // Fond
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);
        
        // Progression
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width * progress, height);
        
        // Bordure
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
    
    testAnimationLoop() {
        let frame = 0;
        
        const animate = () => {
            frame++;
            
            // Petit effet de pulsation sur le crewmate
            const ctx = this.ctx;
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Redessiner partiellement
            ctx.clearRect(width/2 - 50, height/2 + 20, 100, 80);
            
            // Fond local
            const gradient = ctx.createRadialGradient(width/2, height/2 + 50, 0, width/2, height/2 + 50, 100);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#0a0a0f');
            ctx.fillStyle = gradient;
            ctx.fillRect(width/2 - 50, height/2 + 20, 100, 80);
            
            // Crewmate avec animation
            const pulse = Math.sin(frame * 0.05) * 2;
            this.drawSimpleCrewmate(width/2, height/2 + 50 + pulse);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    async initAdvancedSystems() {
        console.log('🔧 Initializing advanced systems...');
        
        try {
            // Vérifier si les classes existent
            if (typeof AmongUsV3Engine !== 'undefined') {
                console.log('🔧 Starting V3 Engine...');
                this.engine = new AmongUsV3Engine();
                
                // Attendre l'initialisation
                if (this.engine.isInitialized) {
                    console.log('✅ V3 Engine ready');
                    // Le render loop est déjà démarré
                }
            }
            
            // Essayer V4 App
            if (typeof AmongUsV4App !== 'undefined') {
                console.log('🔧 Starting V4 App...');
                this.app = new AmongUsV4App();
                
                if (this.app.appReady) {
                    console.log('✅ V4 App ready');
                    this.showMainMenu();
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize advanced systems:', error);
            // Ne pas passer en mode basique, continuer avec le renderer
            console.log('🎮 Continuing with graphics renderer...');
        }
    }
    
    startRenderLoop() {
        console.log('🎮 Starting render loop...');
        
        let lastTime = performance.now();
        
        const renderLoop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            try {
                // Mettre à jour le renderer
                if (this.renderer) {
                    this.renderer.update(deltaTime);
                    this.renderer.render();
                }
                
                // Mettre à jour les contrôles de jeu
                if (this.gameControls) {
                    this.gameControls.update(deltaTime);
                }
                
                // Mettre à jour les systèmes avancés si disponibles
                if (this.engine && this.engine.isRunning) {
                    this.engine.update(deltaTime);
                }
                
                if (this.app && this.app.appReady) {
                    this.app.update(deltaTime);
                }
                
            } catch (error) {
                console.error('❌ Render loop error:', error);
            }
            
            requestAnimationFrame(renderLoop);
        };
        
        requestAnimationFrame(renderLoop);
    }
    
    setupControls() {
        // Les contrôles sont gérés par GameControls, ne pas dupliquer
        console.log('🎮 Controls managed by GameControls system');
    }
    
    showMainMenu() {
        console.log('🎯 Showing main menu...');
        
        // Cacher l'écran de chargement
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
        
        // Montrer le menu principal
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('active');
        }
    }
    
    showBasicMenu() {
        console.log('🎯 Graphics mode active - renderer taking over...');
        // Ne pas interférer avec le renderer graphique
        // Le renderer prend le contrôle
    }
    
    startBasicGame() {
        console.log('🎮 Using graphics renderer...');
        // Le renderer graphique gère tout
    }
    
    renderBasicGame() {
        console.log('🎨 Graphics renderer active...');
        // Le renderer graphique gère tout
    }
    
    showError(error) {
        console.error('💥 Game Error:', error);
        
        const ctx = this.ctx;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#1a0000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 24px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Error', width/2, height/2 - 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter, Arial';
        ctx.fillText(error.message, width/2, height/2);
        
        ctx.fillStyle = '#888888';
        ctx.font = '14px Inter, Arial';
        ctx.fillText('Check console for details', width/2, height/2 + 50);
    }
    
    // Redimensionnement
    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
            this.canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            
            if (this.ctx) {
                this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            }
        }
    }
}

// Démarrer le jeu quand c'est prêt
let gameStarter;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameStarter = new GameStarter();
    });
} else {
    gameStarter = new GameStarter();
}

// Redimensionnement
window.addEventListener('resize', () => {
    if (gameStarter) {
        gameStarter.resize();
    }
});

// Export global
window.gameStarter = gameStarter;
