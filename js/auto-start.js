// Auto-start game script
console.log('🚀 Auto-starting game...');

// Attendre que tout soit chargé
setTimeout(() => {
    // Cacher les écrans de menu et montrer le jeu
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('active');
        loadingScreen.style.display = 'none';
    }
    
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.classList.remove('active');
        mainMenu.style.display = 'none';
    }
    
    // Activer l'écran de jeu
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.classList.add('active');
        gameScreen.style.display = 'block';
    }
    
    // S'assurer que le canvas est visible
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.style.display = 'block';
        canvas.style.zIndex = '1';
    }
    
    console.log('🎮 Game screen activated');
    
    // Démarrer le audio context si nécessaire
    if (window.AudioContext || window.webkitAudioContext) {
        // Simuler un clic pour activer l'audio
        if (canvas) {
            canvas.click();
        }
    }
    
}, 1000);

// Cacher l'interface V4 qui peut gêner
setTimeout(() => {
    const v4Interface = document.querySelector('.v4-mobile-interface');
    if (v4Interface) {
        v4Interface.style.zIndex = '0';
        console.log('🎨 V4 interface moved to background');
    }
    
    // S'assurer que le HUD n'interfère pas
    const gameHud = document.querySelector('.v4-game-hud');
    if (gameHud) {
        gameHud.style.background = 'transparent';
        gameHud.style.pointerEvents = 'none';
    }
}, 1500);
