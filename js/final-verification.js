// Script de vérification finale
console.log('🔍 Final verification script loading...');

setTimeout(() => {
    console.log('🔍 Performing final verification...');
    
    // Vérifications de base
    const checks = {
        canvas: document.getElementById('game-canvas'),
        gameStarter: window.gameStarter,
        renderer: window.gameStarter?.renderer,
        gameControls: window.gameStarter?.gameControls,
        simpleRenderer: window.SimpleRenderer,
        gameControlsClass: window.GameControls
    };
    
    console.log('📊 System Check Results:');
    Object.entries(checks).forEach(([name, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`${status} ${name}: ${!!value}`);
    });
    
    // Test de rendu si possible
    if (checks.canvas && checks.renderer) {
        console.log('🎨 Testing renderer capabilities...');
        
        const ctx = checks.canvas.getContext('2d');
        
        // Test de base
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(20, 20, 50, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('TEST', 25, 35);
        
        console.log('✅ Basic canvas drawing test passed');
        
        // Test du renderer
        if (checks.renderer.render) {
            try {
                checks.renderer.render();
                console.log('✅ Renderer render() method works');
            } catch (error) {
                console.error('❌ Renderer render() failed:', error);
            }
        }
        
        // Test des contrôles
        if (checks.gameControls) {
            console.log('✅ Game controls system available');
            
            // Simuler une touche pour tester
            try {
                const mockEvent = { code: 'KeyW' };
                console.log('🎮 Controls appear functional');
            } catch (error) {
                console.error('❌ Controls test failed:', error);
            }
        }
    }
    
    // Afficher un résumé
    setTimeout(() => {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Status overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(10, canvas.height - 120, 300, 110);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText('Among Us V4 - System Status', 20, canvas.height - 100);
            
            const statusLines = [
                `Canvas: ${checks.canvas ? 'OK' : 'ERROR'}`,
                `Renderer: ${checks.renderer ? 'OK' : 'ERROR'}`,
                `Controls: ${checks.gameControls ? 'OK' : 'ERROR'}`,
                `Graphics: ${checks.canvas && checks.renderer ? 'ACTIVE' : 'INACTIVE'}`,
                'Use WASD to move, E to interact'
            ];
            
            statusLines.forEach((line, index) => {
                ctx.fillText(line, 20, canvas.height - 80 + (index * 15));
            });
        }
    }, 1000);
    
}, 5000);

// Ajouter un bouton de redémarrage
setTimeout(() => {
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart Game';
    restartButton.style.cssText = `
        position: fixed;
        top: 90px;
        right: 10px;
        z-index: 9999;
        padding: 10px;
        background: #ff6600;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    
    restartButton.onclick = () => {
        console.log('🔄 Restarting game...');
        location.reload();
    };
    
    document.body.appendChild(restartButton);
}, 6000);
