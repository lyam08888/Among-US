// Script d'activation définitive du jeu graphique
console.log('🎮 Activating game graphics definitively...');

function activateGameGraphics() {
    console.log('🚀 Starting game graphics activation...');
    
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
    
    // Initialiser ou réinitialiser le SimpleRenderer
    const ctx = gameCanvas.getContext('2d');
    
    // Créer une instance propre du SimpleRenderer
    window.gameRenderer = new SimpleRenderer(gameCanvas, ctx);
    
    console.log('✅ SimpleRenderer initialized');
    
    // Créer un joueur local
    if (window.gameRenderer.players.size === 0) {
        window.gameRenderer.createTestPlayer();
        console.log('👤 Test player created');
    }
    
    // Démarrer la boucle de jeu
    let lastTime = performance.now();
    
    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        try {
            // Mise à jour du jeu
            window.gameRenderer.update(deltaTime);
            
            // Rendu
            window.gameRenderer.render();
            
            // Gestion des contrôles
            if (window.gameControls) {
                window.gameControls.update(deltaTime);
            }
            
        } catch (error) {
            console.error('❌ Game loop error:', error);
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Démarrer la boucle
    requestAnimationFrame(gameLoop);
    console.log('🔄 Game loop started');
    
    // Configurer les contrôles de base
    setupBasicControls(gameCanvas);
    
    // Masquer les interfaces inutiles
    hideUnusedInterfaces();
    
    console.log('🎮 Game graphics fully activated!');
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
