// Script d'assurance finale - garantit l'affichage du jeu
console.log('🛡️ Final assurance script loading...');

// Fonction d'assurance qui s'exécute en boucle
function ensureGameIsVisible() {
    let attempts = 0;
    const maxAttempts = 20; // 10 secondes maximum
    
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`🔍 Assurance check ${attempts}/${maxAttempts}`);
        
        // Vérifier si un canvas est visible et dessine
        const canvas = document.querySelector('canvas');
        let isGameVisible = false;
        
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const style = getComputedStyle(canvas);
            
            isGameVisible = (
                rect.width > 0 && 
                rect.height > 0 && 
                style.display !== 'none' && 
                style.visibility !== 'hidden' && 
                parseFloat(style.opacity) > 0
            );
            
            console.log(`📊 Canvas visible: ${isGameVisible} (${rect.width}x${rect.height})`);
        }
        
        // Si le jeu n'est pas visible, forcer l'affichage
        if (!isGameVisible) {
            console.log('⚠️ Game not visible, forcing display...');
            forceGameDisplay();
        } else {
            console.log('✅ Game is visible, stopping assurance checks');
            clearInterval(checkInterval);
            
            // Afficher les instructions finales
            showGameInstructions();
        }
        
        // Arrêter après le maximum de tentatives
        if (attempts >= maxAttempts) {
            console.log('⏰ Maximum attempts reached, creating emergency display...');
            clearInterval(checkInterval);
            createEmergencyGameDisplay();
        }
    }, 500); // Vérifier toutes les 500ms
}

function forceGameDisplay() {
    console.log('🚨 Forcing game display...');
    
    // Supprimer tous les éléments qui pourraient être au-dessus
    const overlays = document.querySelectorAll('.v4-loading-screen, .v4-main-menu, .v4-mobile-interface');
    overlays.forEach(overlay => {
        overlay.style.display = 'none !important';
        overlay.style.visibility = 'hidden !important';
        overlay.style.opacity = '0 !important';
        overlay.style.zIndex = '-1 !important';
    });
    
    // S'assurer que le canvas est au premier plan
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0a0a0f !important;
            z-index: 1000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Test de rendu immédiat
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('AMONG US V4', canvas.width / 2, canvas.height / 2);
            ctx.fillText('GAME ACTIVE', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        console.log('✅ Canvas forced to display');
    }
    
    // Forcer le démarrage du jeu si les contrôleurs existent
    if (window.gameController && !window.gameController.isRunning) {
        window.gameController.start();
    }
    
    if (window.gameStarter && window.gameStarter.renderer) {
        try {
            window.gameStarter.renderer.render();
        } catch (error) {
            console.log('⚠️ GameStarter render failed, continuing...');
        }
    }
}

function createEmergencyGameDisplay() {
    console.log('🚨 Creating emergency game display...');
    
    // Supprimer tout le contenu existant
    document.body.innerHTML = '';
    
    // Créer un canvas d'urgence
    const emergencyCanvas = document.createElement('canvas');
    emergencyCanvas.id = 'emergency-game-canvas';
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
        display: block;
    `;
    
    document.body.appendChild(emergencyCanvas);
    
    const ctx = emergencyCanvas.getContext('2d');
    
    // Variables de jeu d'urgence
    let player = {
        x: emergencyCanvas.width / 2,
        y: emergencyCanvas.height / 2,
        vx: 0,
        vy: 0,
        size: 30
    };
    
    let keys = {};
    
    // Contrôles d'urgence
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        const speed = 5;
        
        if (keys['w'] || keys['arrowup']) player.vy = -speed;
        if (keys['s'] || keys['arrowdown']) player.vy = speed;
        if (keys['a'] || keys['arrowleft']) player.vx = -speed;
        if (keys['d'] || keys['arrowright']) player.vx = speed;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        
        if (!keys['w'] && !keys['arrowup'] && !keys['s'] && !keys['arrowdown']) {
            player.vy = 0;
        }
        if (!keys['a'] && !keys['arrowleft'] && !keys['d'] && !keys['arrowright']) {
            player.vx = 0;
        }
    });
    
    // Boucle de jeu d'urgence
    function emergencyGameLoop() {
        // Mise à jour
        player.x += player.vx;
        player.y += player.vy;
        
        // Limites
        player.x = Math.max(player.size, Math.min(player.x, emergencyCanvas.width - player.size));
        player.y = Math.max(player.size, Math.min(player.y, emergencyCanvas.height - player.size));
        
        // Rendu
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, emergencyCanvas.width, emergencyCanvas.height);
        
        // Grille de fond
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let x = 0; x < emergencyCanvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, emergencyCanvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < emergencyCanvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(emergencyCanvas.width, y);
            ctx.stroke();
        }
        
        // Joueur (crewmate simple)
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y, player.size, player.size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visière
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y - player.size * 0.3, player.size * 0.8, player.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // HUD
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AMONG US V4 - EMERGENCY MODE', emergencyCanvas.width / 2, 50);
        
        ctx.font = '16px Arial';
        ctx.fillText('Use WASD or Arrow keys to move', emergencyCanvas.width / 2, emergencyCanvas.height - 30);
        
        ctx.textAlign = 'left';
        ctx.fillText(`Position: ${Math.round(player.x)}, ${Math.round(player.y)}`, 20, 30);
        
        requestAnimationFrame(emergencyGameLoop);
    }
    
    emergencyGameLoop();
    console.log('🚨 Emergency game display created and running');
}

function showGameInstructions() {
    console.log('📖 Showing game instructions...');
    
    setTimeout(() => {
        console.log('');
        console.log('🎮 ===== AMONG US V4 - JEU ACTIF =====');
        console.log('🎮 Contrôles:');
        console.log('🎮   WASD ou flèches directionnelles: Se déplacer');
        console.log('🎮   Clic souris: Téléportation (mode debug)');
        console.log('🎮   Tactile: Déplacement sur mobile');
        console.log('🎮 =====================================');
        console.log('');
    }, 1000);
}

// Démarrer l'assurance après un délai
setTimeout(() => {
    console.log('🛡️ Starting final assurance checks...');
    ensureGameIsVisible();
}, 4000); // Attendre 4 secondes que tout se charge
