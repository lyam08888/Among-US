// Script de debug pour le rendu graphique
console.log('🔍 Starting render debug...');

// Attendre que tout soit chargé
setTimeout(() => {
    console.log('🔍 Testing canvas rendering...');
    
    // Trouver le canvas
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        console.error('❌ No canvas found!');
        return;
    }
    
    console.log('✅ Canvas found:', canvas);
    console.log('📏 Canvas size:', canvas.width, 'x', canvas.height);
    console.log('📏 Canvas style:', canvas.style.width, 'x', canvas.style.height);
    console.log('👁️ Canvas visible:', canvas.style.display !== 'none');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ No 2D context!');
        return;
    }
    
    console.log('✅ Context found');
    
    // Test de rendu direct
    console.log('🎨 Testing direct rendering...');
    
    // Fond noir
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rectangle rouge
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(100, 100, 200, 150);
    
    // Texte blanc
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('TEST RENDER', 150, 200);
    
    // Cercle vert
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(400, 300, 50, 0, Math.PI * 2);
    ctx.fill();
    
    console.log('✅ Direct render test completed');
    
    // Vérifier les systèmes de rendu existants
    console.log('🔍 Checking render systems...');
    
    if (window.gameStarter) {
        console.log('✅ GameStarter found');
        if (window.gameStarter.renderer) {
            console.log('✅ Renderer found in GameStarter');
            
            // Forcer un rendu
            try {
                window.gameStarter.renderer.render();
                console.log('✅ Forced renderer.render() successful');
            } catch (error) {
                console.error('❌ Forced render failed:', error);
            }
        }
    }
    
    if (window.simpleRenderer) {
        console.log('✅ SimpleRenderer found');
        try {
            window.simpleRenderer.render();
            console.log('✅ Forced simpleRenderer.render() successful');
        } catch (error) {
            console.error('❌ Forced simpleRenderer render failed:', error);
        }
    }
    
    // Test des événements de souris pour vérifier l'interactivité
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log('🖱️ Canvas clicked at:', x, y);
        
        // Dessiner un point au clic
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
    
    console.log('✅ Click handler added');
    
    // Test d'animation
    let animFrame = 0;
    function testAnimation() {
        animFrame++;
        
        // Petit carré animé
        const x = 50 + Math.sin(animFrame * 0.1) * 30;
        const y = 50 + Math.cos(animFrame * 0.1) * 30;
        
        // Effacer la zone précédente
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 10, 120, 120);
        
        // Nouveau carré
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x, y, 20, 20);
        
        if (animFrame < 300) { // 5 secondes d'animation
            requestAnimationFrame(testAnimation);
        }
    }
    
    console.log('🎬 Starting test animation...');
    testAnimation();
    
}, 2000); // Attendre 2 secondes
