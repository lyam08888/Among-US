// Script de débogage temporaire pour forcer l'affichage du menu
console.log('🔧 Debug script loaded');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM loaded, applying debug fixes...');
    
    // Forcer l'affichage du menu principal après un délai
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const mainMenu = document.getElementById('main-menu');
        
        console.log('🔧 Loading screen:', loadingScreen);
        console.log('🔧 Main menu:', mainMenu);
        
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
            console.log('🔧 Loading screen hidden');
        }
        
        if (mainMenu) {
            mainMenu.classList.add('active');
            console.log('🔧 Main menu shown');
        }
        
        // Vérifier si l'app V4 existe
        if (window.amongUsApp) {
            console.log('🔧 AmongUs App found:', window.amongUsApp);
        } else {
            console.log('🔧 AmongUs App not found, creating fallback...');
            
            // Créer un objet de base pour éviter les erreurs
            window.amongUsApp = {
                audioSystem: {
                    playButtonClick: () => console.log('🔊 Button click (fallback)'),
                    isReady: () => false
                },
                showMainMenu: () => {
                    if (mainMenu) mainMenu.classList.add('active');
                },
                hideLoadingScreen: () => {
                    if (loadingScreen) loadingScreen.classList.remove('active');
                }
            };
        }
        
    }, 2000);
    
    // Ajouter des gestionnaires d'événements de base pour les boutons
    setTimeout(() => {
        const buttons = document.querySelectorAll('[data-action]');
        console.log('🔧 Found buttons:', buttons.length);
        
        buttons.forEach(button => {
            const action = button.getAttribute('data-action');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔧 Button clicked:', action);
                
                // Actions de base
                switch(action) {
                    case 'quick-play':
                        alert('Fonction en cours de développement - Jeu rapide');
                        break;
                    case 'create-room':
                        alert('Fonction en cours de développement - Créer une partie');
                        break;
                    case 'join-room':
                        alert('Fonction en cours de développement - Rejoindre une partie');
                        break;
                    case 'settings':
                        const settingsPanel = document.getElementById('settings-panel');
                        if (settingsPanel) {
                            settingsPanel.classList.add('active');
                        }
                        break;
                    case 'close-settings':
                        const settingsPanel2 = document.getElementById('settings-panel');
                        if (settingsPanel2) {
                            settingsPanel2.classList.remove('active');
                        }
                        break;
                    case 'toggle-secondary':
                        const secondaryMenu = document.getElementById('secondary-menu');
                        if (secondaryMenu) {
                            secondaryMenu.classList.toggle('active');
                        }
                        break;
                    default:
                        console.log('🔧 Action not implemented:', action);
                }
            });
        });
    }, 3000);
});

// Capturer les erreurs pour le débogage
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

console.log('🔧 Debug script initialized');