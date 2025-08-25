// Script pour forcer l'affichage des graphiques
console.log('🎨 Graphics visibility fix loading...');

setTimeout(() => {
    console.log('🎨 Applying graphics visibility fixes...');
    
    // S'assurer que le canvas est au premier plan
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.style.display = 'block';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '10';
        canvas.style.pointerEvents = 'auto';
        console.log('✅ Canvas visibility fixed');
    }
    
    // Cacher/déplacer les éléments qui pourraient gêner
    const elementsToHide = [
        '.v4-mobile-interface',
        '.v4-loading-screen',
        '.v4-main-menu'
    ];
    
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el) {
                el.style.display = 'none';
                console.log(`✅ Hidden element: ${selector}`);
            }
        });
    });
    
    // Garder seulement le game-screen visible
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.style.display = 'block';
        gameScreen.style.zIndex = '5';
        console.log('✅ Game screen visible');
    }
    
    // Vérifier si le renderer fonctionne
    if (window.gameStarter && window.gameStarter.renderer) {
        console.log('🎮 Renderer found, testing...');
        
        const renderer = window.gameStarter.renderer;
        
        // Tester le rendu
        setTimeout(() => {
            try {
                renderer.render();
                console.log('✅ Renderer test successful');
                
                // Ajouter un indicateur visuel
                const ctx = renderer.ctx;
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(10, 10, 100, 30);
                ctx.fillStyle = '#000000';
                ctx.font = '14px Arial';
                ctx.fillText('GRAPHICS OK', 15, 30);
                
            } catch (error) {
                console.error('❌ Renderer test failed:', error);
            }
        }, 500);
    }
    
}, 3000);

// Créer un bouton pour basculer la visibilité
setTimeout(() => {
    const toggleButton = document.createElement('button');
    toggleButton.innerText = 'Toggle Graphics';
    toggleButton.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        z-index: 9999;
        padding: 10px;
        background: #00ff00;
        color: black;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    
    let graphicsVisible = true;
    
    toggleButton.onclick = () => {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            graphicsVisible = !graphicsVisible;
            canvas.style.display = graphicsVisible ? 'block' : 'none';
            toggleButton.innerText = graphicsVisible ? 'Hide Graphics' : 'Show Graphics';
            console.log(`🎨 Graphics ${graphicsVisible ? 'shown' : 'hidden'}`);
        }
    };
    
    document.body.appendChild(toggleButton);
}, 4000);
