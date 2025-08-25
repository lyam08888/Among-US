// Script de debug pour vérifier les graphiques
console.log('🔍 Debug script loading...');

// Attendre 2 secondes puis vérifier l'état
setTimeout(() => {
    console.log('🔍 Checking game state...');
    
    // Vérifier le canvas
    const canvas = document.getElementById('game-canvas');
    console.log('Canvas found:', !!canvas);
    if (canvas) {
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Canvas style:', canvas.style.width, 'x', canvas.style.height);
    }
    
    // Vérifier le game starter
    if (window.gameStarter) {
        console.log('Game starter found:', !!window.gameStarter);
        console.log('Renderer available:', !!window.gameStarter.renderer);
        console.log('Game controls available:', !!window.gameStarter.gameControls);
        
        if (window.gameStarter.renderer) {
            console.log('Map available:', !!window.gameStarter.renderer.map);
            console.log('Players count:', window.gameStarter.renderer.players.size);
            
            // Forcer un rendu
            console.log('🎨 Forcing render...');
            try {
                window.gameStarter.renderer.render();
                console.log('✅ Render successful');
            } catch (error) {
                console.error('❌ Render failed:', error);
            }
        }
    } else {
        console.log('❌ Game starter not found');
    }
    
}, 2000);

// Créer un bouton de test
setTimeout(() => {
    const testButton = document.createElement('button');
    testButton.innerText = 'Test Graphics';
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        padding: 10px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    
    testButton.onclick = () => {
        console.log('🧪 Testing graphics...');
        
        if (window.gameStarter && window.gameStarter.renderer) {
            const renderer = window.gameStarter.renderer;
            
            // Test de rendu direct
            const ctx = renderer.ctx;
            
            // Effacer et dessiner un test
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(100, 100, 200, 200);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.fillText('GRAPHICS TEST', 110, 130);
            
            console.log('✅ Graphics test drawn');
        } else {
            console.log('❌ No renderer available for test');
        }
    };
    
    document.body.appendChild(testButton);
}, 3000);
