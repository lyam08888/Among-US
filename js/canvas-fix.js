// Script de correction forcée du canvas
console.log('🔧 Canvas Fix Script loading...');

function forceCanvasDisplay() {
    console.log('🔧 Forcing canvas display...');
    
    // Trouver tous les canvas
    const canvases = document.querySelectorAll('canvas');
    console.log(`Found ${canvases.length} canvas elements`);
    
    canvases.forEach((canvas, index) => {
        console.log(`📐 Canvas ${index}:`, {
            width: canvas.width,
            height: canvas.height,
            display: canvas.style.display,
            visibility: canvas.style.visibility,
            opacity: canvas.style.opacity,
            zIndex: canvas.style.zIndex
        });
        
        // Force visible styles
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        canvas.style.opacity = '1';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '10';
        canvas.style.background = '#0a0a0f';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        
        // Resize canvas to full window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        console.log(`✅ Canvas ${index} fixed`);
    });
    
    // Test de rendu direct sur tous les canvas
    canvases.forEach((canvas, index) => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Test pattern
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(50 + index * 100, 50, 100, 100);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText(`Canvas ${index}`, 60 + index * 100, 120);
            
            console.log(`🎨 Test pattern drawn on canvas ${index}`);
        }
    });
}

function forcedGameRender() {
    console.log('🎮 Attempting forced game render...');
    
    // Essayer de forcer le rendu via gameStarter
    if (window.gameStarter && window.gameStarter.renderer) {
        try {
            console.log('🔧 Forcing gameStarter render...');
            window.gameStarter.renderer.render();
            
            // Force une mise à jour aussi
            if (window.gameStarter.renderer.update) {
                window.gameStarter.renderer.update(16); // 60fps frame
            }
            
            console.log('✅ GameStarter render forced');
        } catch (error) {
            console.error('❌ GameStarter render failed:', error);
        }
    }
    
    // Essayer simpleRenderer
    if (window.simpleRenderer) {
        try {
            console.log('🔧 Forcing simpleRenderer render...');
            window.simpleRenderer.render();
            
            if (window.simpleRenderer.update) {
                window.simpleRenderer.update(16);
            }
            
            console.log('✅ SimpleRenderer render forced');
        } catch (error) {
            console.error('❌ SimpleRenderer render failed:', error);
        }
    }
    
    // Essayer les moteurs avancés
    if (window.amongUsV4App && window.amongUsV4App.render) {
        try {
            console.log('🔧 Forcing V4 App render...');
            window.amongUsV4App.render();
            console.log('✅ V4 App render forced');
        } catch (error) {
            console.error('❌ V4 App render failed:', error);
        }
    }
    
    if (window.amongUsV3Engine && window.amongUsV3Engine.render) {
        try {
            console.log('🔧 Forcing V3 Engine render...');
            window.amongUsV3Engine.render();
            console.log('✅ V3 Engine render forced');
        } catch (error) {
            console.error('❌ V3 Engine render failed:', error);
        }
    }
}

function createTestCanvas() {
    console.log('🧪 Creating test canvas...');
    
    // Supprimer tout canvas existant
    const existingCanvases = document.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
        console.log('🗑️ Removing existing canvas');
        canvas.remove();
    });
    
    // Créer un nouveau canvas de test
    const testCanvas = document.createElement('canvas');
    testCanvas.id = 'test-canvas';
    testCanvas.width = window.innerWidth;
    testCanvas.height = window.innerHeight;
    testCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #0a0a0f;
        z-index: 9999;
        display: block;
    `;
    
    document.body.appendChild(testCanvas);
    
    const ctx = testCanvas.getContext('2d');
    
    // Dessiner un pattern de test
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, testCanvas.width, testCanvas.height);
    
    // Grille
    ctx.strokeStyle = '#333344';
    ctx.lineWidth = 1;
    for (let x = 0; x < testCanvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, testCanvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < testCanvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(testCanvas.width, y);
        ctx.stroke();
    }
    
    // Crewmate de test
    const centerX = testCanvas.width / 2;
    const centerY = testCanvas.height / 2;
    
    // Corps
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 40, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Visière
    ctx.fillStyle = '#87ceeb';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 20, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Texte
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AMONG US V4 - TEST CANVAS', centerX, centerY + 100);
    ctx.fillText('Canvas de test actif', centerX, centerY + 130);
    
    // Informations de debug
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Resolution: ${testCanvas.width}x${testCanvas.height}`, 20, 30);
    ctx.fillText(`Viewport: ${window.innerWidth}x${window.innerHeight}`, 20, 50);
    ctx.fillText('Canvas forcé - Si vous voyez ceci, le canvas fonctionne', 20, 70);
    
    console.log('✅ Test canvas created and rendered');
    
    // Animation de test
    let animFrame = 0;
    function animateTest() {
        animFrame++;
        
        // Petit cercle qui pulse
        const pulseX = centerX + 150;
        const pulseY = centerY;
        const pulseRadius = 20 + Math.sin(animFrame * 0.1) * 10;
        
        // Clear old circle
        ctx.fillStyle = '#000011';
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // New circle
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        if (animFrame < 600) { // 10 secondes
            requestAnimationFrame(animateTest);
        }
    }
    
    animateTest();
    
    return testCanvas;
}

// Exécuter les corrections
setTimeout(() => {
    console.log('🚀 Starting canvas corrections...');
    
    // Première tentative : correction des canvas existants
    forceCanvasDisplay();
    
    setTimeout(() => {
        // Forcer le rendu du jeu
        forcedGameRender();
    }, 1000);
    
    setTimeout(() => {
        // Si toujours rien, créer un canvas de test
        const existingCanvases = document.querySelectorAll('canvas');
        let hasVisibleCanvas = false;
        
        existingCanvases.forEach(canvas => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && 
                canvas.style.display !== 'none' && 
                canvas.style.visibility !== 'hidden') {
                hasVisibleCanvas = true;
            }
        });
        
        if (!hasVisibleCanvas) {
            console.log('⚠️ No visible canvas found, creating test canvas...');
            createTestCanvas();
        } else {
            console.log('✅ Visible canvas found, no test canvas needed');
        }
    }, 3000);
    
}, 2000);
