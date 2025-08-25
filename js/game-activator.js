// Script d'activation définitive du jeu graphique - Version robuste
console.log('🎮 Activating game graphics definitively...');

function activateGameGraphics() {
    console.log('🚀 Starting game graphics activation...');
    
    try {
        // S'assurer que le canvas de test est supprimé
        const testCanvas = document.getElementById('test-canvas') || document.getElementById('emergency-canvas');
        if (testCanvas) {
            testCanvas.remove();
            console.log('🗑️ Test canvas removed');
        }
        
        // Trouver ou créer le canvas de jeu principal
        let gameCanvas = document.getElementById('game-canvas');
        if (!gameCanvas) {
            gameCanvas = document.createElement('canvas');
            gameCanvas.id = 'game-canvas';
            document.body.appendChild(gameCanvas);
            console.log('📦 Game canvas created');
        }
        
        // Configuration finale du canvas
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
        gameCanvas.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0a0a0f !important;
            z-index: 5 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        console.log('✅ Game canvas configured');
        
        // Initialiser ou réinitialiser le SimpleRenderer avec gestion d'erreur
        const ctx = gameCanvas.getContext('2d');
        
        try {
            // Créer une instance propre du SimpleRenderer
            window.gameRenderer = new SimpleRenderer(gameCanvas, ctx);
            
            console.log('✅ SimpleRenderer initialized');
            
            // Créer un joueur local avec vérification
            if (window.gameRenderer.players && window.gameRenderer.players.size === 0) {
                try {
                    window.gameRenderer.createTestPlayer();
                    console.log('👤 Test player created');
                } catch (playerError) {
                    console.warn('⚠️ Failed to create test player, using manual creation:', playerError.message);
                    
                    // Création manuelle du joueur
                    if (!window.gameRenderer.players) {
                        window.gameRenderer.players = new Map();
                    }
                    
                    window.gameRenderer.players.set('player1', {
                        id: 'player1',
                        x: gameCanvas.width / 2,
                        y: gameCanvas.height / 2,
                        color: 'red',
                        name: 'Player',
                        isLocal: true,
                        velocity: { x: 0, y: 0 },
                        animation: 'idle',
                        animationFrame: 0,
                        animationTime: 0
                    });
                    
                    console.log('👤 Manual player created');
                }
            }
            
        } catch (rendererError) {
            console.error('❌ Failed to create SimpleRenderer:', rendererError.message);
            
            // Créer un renderer de secours
            createFallbackRenderer(gameCanvas, ctx);
        }
        
        // Démarrer la boucle de jeu
        startSafeGameLoop();
        
        // Configurer les contrôles de base
        setupBasicControls(gameCanvas);
        
        // Masquer les interfaces inutiles
        hideUnusedInterfaces();
        
        console.log('🎮 Game graphics fully activated!');
        
    } catch (error) {
        console.error('❌ Failed to activate game graphics:', error);
        console.log('🚨 Creating emergency fallback...');
        createEmergencyFallback();
    }
}

function createFallbackRenderer(canvas, ctx) {
    console.log('🔧 Creating fallback renderer...');
    
    window.gameRenderer = {
        canvas: canvas,
        ctx: ctx,
        players: new Map(),
        camera: { x: 0, y: 0, zoom: 1 },
        
        update: function(deltaTime) {
            // Mise à jour basique des joueurs
            for (const [id, player] of this.players) {
                if (player.velocity) {
                    player.x += player.velocity.x * deltaTime / 1000;
                    player.y += player.velocity.y * deltaTime / 1000;
                    
                    // Limites
                    player.x = Math.max(30, Math.min(player.x, this.canvas.width - 30));
                    player.y = Math.max(30, Math.min(player.y, this.canvas.height - 30));
                }
            }
        },
        
        render: function() {
            // Fond
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Grille de fond
            this.ctx.strokeStyle = '#1a1a2a';
            this.ctx.lineWidth = 1;
            for (let x = 0; x < this.canvas.width; x += 64) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            for (let y = 0; y < this.canvas.height; y += 64) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            // Joueurs
            for (const [id, player] of this.players) {
                this.renderPlayer(player);
            }
            
            // HUD
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('AMONG US V4 - FALLBACK MODE', this.canvas.width / 2, 40);
            
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Use WASD to move, Click to teleport', this.canvas.width / 2, this.canvas.height - 20);
        },
        
        renderPlayer: function(player) {
            const ctx = this.ctx;
            const x = player.x;
            const y = player.y;
            const size = 30;
            
            // Corps principal
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 1.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Visière
            ctx.fillStyle = '#87ceeb';
            ctx.beginPath();
            ctx.ellipse(x, y - size * 0.3, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Nom
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, x, y - size * 1.8);
        },
        
        createTestPlayer: function() {
            this.players.set('player1', {
                id: 'player1',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                color: 'red',
                name: 'Player',
                isLocal: true,
                velocity: { x: 0, y: 0 }
            });
        }
    };
    
    // Créer le joueur de test
    window.gameRenderer.createTestPlayer();
    
    console.log('✅ Fallback renderer created');
}

function startSafeGameLoop() {
    console.log('🔄 Starting safe game loop...');
    
    let lastTime = performance.now();
    
    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        try {
            // Mise à jour du jeu
            if (window.gameRenderer && window.gameRenderer.update) {
                window.gameRenderer.update(deltaTime);
            }
            
            // Rendu
            if (window.gameRenderer && window.gameRenderer.render) {
                window.gameRenderer.render();
            }
            
            // Gestion des contrôles
            if (window.gameControls && window.gameControls.update) {
                window.gameControls.update(deltaTime);
            }
            
        } catch (error) {
            console.error('❌ Game loop error:', error);
            // Continuer quand même
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Démarrer la boucle
    requestAnimationFrame(gameLoop);
    console.log('🔄 Game loop started');
}

function createEmergencyFallback() {
    console.log('🚨 Creating emergency fallback...');
    
    // Nettoyer la page
    document.body.innerHTML = '';
    
    // Créer un canvas d'urgence simple
    const emergencyCanvas = document.createElement('canvas');
    emergencyCanvas.width = window.innerWidth;
    emergencyCanvas.height = window.innerHeight;
    emergencyCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #0a0a0f;
        z-index: 10000;
    `;
    
    document.body.appendChild(emergencyCanvas);
    
    const ctx = emergencyCanvas.getContext('2d');
    
    // Affichage d'urgence
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, emergencyCanvas.width, emergencyCanvas.height);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AMONG US V4', emergencyCanvas.width / 2, emergencyCanvas.height / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Emergency Mode - Game Loading...', emergencyCanvas.width / 2, emergencyCanvas.height / 2 + 20);
    
    console.log('🚨 Emergency fallback created');
}

function setupBasicControls(canvas) {
    console.log('🎮 Setting up basic controls...');
    
    // Contrôles clavier
    let keys = {};
    
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        const player = Array.from(window.gameRenderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        const speed = 200; // pixels par seconde
        
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
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        
        const player = Array.from(window.gameRenderer.players.values()).find(p => p.isLocal);
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
        
        e.preventDefault();
    });
    
    // Contrôles tactiles basiques pour mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouching = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isTouching) return;
        
        const player = Array.from(window.gameRenderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        
        const speed = 150;
        player.velocity.x = Math.sign(deltaX) * Math.min(Math.abs(deltaX) * 2, speed);
        player.velocity.y = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * 2, speed);
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isTouching = false;
        
        const player = Array.from(window.gameRenderer.players.values()).find(p => p.isLocal);
        if (player) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });
    
    // Clic pour téléportation (mode debug)
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convertir en coordonnées monde
        const worldX = (x / window.gameRenderer.camera.zoom) + window.gameRenderer.camera.x;
        const worldY = (y / window.gameRenderer.camera.zoom) + window.gameRenderer.camera.y;
        
        const player = Array.from(window.gameRenderer.players.values()).find(p => p.isLocal);
        if (player) {
            player.x = worldX;
            player.y = worldY;
            console.log(`🎯 Player teleported to: ${worldX}, ${worldY}`);
        }
    });
    
    console.log('✅ Basic controls configured');
}

function hideUnusedInterfaces() {
    console.log('👁️ Hiding unused interfaces...');
    
    const interfacesToHide = [
        '.v4-loading-screen',
        '.v4-main-menu',
        '.v4-mobile-interface',
        '#loading-screen',
        '#main-menu'
    ];
    
    interfacesToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
        });
    });
    
    // S'assurer que le game-screen est visible
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.style.display = 'block';
        gameScreen.style.visibility = 'visible';
        gameScreen.style.opacity = '1';
    }
    
    console.log('✅ Interfaces cleaned up');
}

// Attendre que tout soit chargé puis activer
setTimeout(() => {
    console.log('⏰ Activating game graphics after systems load...');
    activateGameGraphics();
}, 3000);

// Activation immédiate si tout est déjà prêt
if (document.readyState === 'complete') {
    setTimeout(activateGameGraphics, 1000);
}
