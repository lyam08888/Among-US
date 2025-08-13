// Among Us V4 - Optimisations Mobile
class MobileOptimizations {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.performanceSettings = this.getOptimalSettings();
        this.touchHandler = new TouchHandler();
        this.batteryOptimizer = new BatteryOptimizer();
        
        this.init();
    }
    
    init() {
        console.log('📱 Initializing mobile optimizations...');
        
        // Appliquer les optimisations de base
        this.applyBasicOptimizations();
        
        // Configurer la gestion tactile
        this.setupTouchHandling();
        
        // Optimiser pour la batterie
        this.setupBatteryOptimizations();
        
        // Gérer l'orientation
        this.setupOrientationHandling();
        
        // Optimiser les performances
        this.setupPerformanceOptimizations();
        
        console.log('✅ Mobile optimizations applied');
    }
    
    detectDevice() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        return {
            isIOS: /iPad|iPhone|iPod/.test(userAgent),
            isAndroid: /Android/.test(userAgent),
            isMobile: /Mobi|Android/i.test(userAgent),
            isTablet: /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
            screenSize: {
                width: window.screen.width,
                height: window.screen.height,
                ratio: window.devicePixelRatio || 1
            },
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection
        };
    }
    
    getOptimalSettings() {
        const device = this.deviceInfo;
        let settings = {
            renderScale: 1,
            maxFPS: 60,
            particlesEnabled: true,
            shadowsEnabled: true,
            lightingEnabled: true,
            audioQuality: 'high',
            textureQuality: 'high',
            animationQuality: 'high'
        };
        
        // Ajuster selon les performances du device
        if (device.memory < 4) {
            settings.renderScale = 0.8;
            settings.maxFPS = 30;
            settings.particlesEnabled = false;
            settings.shadowsEnabled = false;
            settings.audioQuality = 'medium';
            settings.textureQuality = 'medium';
        }
        
        if (device.cores < 4) {
            settings.maxFPS = 30;
            settings.lightingEnabled = false;
            settings.animationQuality = 'medium';
        }
        
        // Optimisations spécifiques iOS
        if (device.isIOS) {
            settings.audioQuality = 'high'; // iOS a un bon support audio
        }
        
        // Optimisations pour connexion lente
        if (device.connection && device.connection.effectiveType === 'slow-2g') {
            settings.textureQuality = 'low';
            settings.audioQuality = 'low';
        }
        
        return settings;
    }
    
    applyBasicOptimizations() {
        // Désactiver la sélection de texte
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        
        // Désactiver le zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
        
        // Désactiver le pull-to-refresh
        document.body.style.overscrollBehavior = 'none';
        
        // Optimiser le scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Désactiver les highlights tactiles
        document.body.style.webkitTapHighlightColor = 'transparent';
        
        // Forcer l'accélération matérielle
        document.body.style.transform = 'translateZ(0)';
        document.body.style.backfaceVisibility = 'hidden';
        
        // Optimiser les fonts
        if (this.deviceInfo.isIOS) {
            document.body.style.webkitFontSmoothing = 'antialiased';
        }
    }
    
    setupTouchHandling() {
        // Prévenir le comportement par défaut des touches
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Gérer les gestes
        this.touchHandler.setupGestureHandling();
    }
    
    setupBatteryOptimizations() {
        // Réduire la fréquence de rendu quand la batterie est faible
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                this.batteryOptimizer.monitor(battery);
            });
        }
        
        // Réduire les performances en arrière-plan
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.reduceBackgroundActivity();
            } else {
                this.restoreActivity();
            }
        });
    }
    
    setupOrientationHandling() {
        // Gérer les changements d'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Forcer l'orientation paysage pour une meilleure expérience
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                console.log('Orientation lock not supported');
            });
        }
    }
    
    setupPerformanceOptimizations() {
        // Limiter le FPS si nécessaire
        if (this.performanceSettings.maxFPS < 60) {
            this.setupFPSLimiter();
        }
        
        // Optimiser le garbage collection
        this.setupMemoryOptimizations();
        
        // Précharger les ressources critiques
        this.preloadCriticalAssets();
    }
    
    setupFPSLimiter() {
        const targetFrameTime = 1000 / this.performanceSettings.maxFPS;
        let lastFrameTime = 0;
        
        const originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = (callback) => {
            return originalRAF((currentTime) => {
                if (currentTime - lastFrameTime >= targetFrameTime) {
                    lastFrameTime = currentTime;
                    callback(currentTime);
                }
            });
        };
    }
    
    setupMemoryOptimizations() {
        // Nettoyer les ressources inutilisées périodiquement
        setInterval(() => {
            this.cleanupUnusedResources();
        }, 30000); // Toutes les 30 secondes
        
        // Forcer le garbage collection si disponible
        if (window.gc) {
            setInterval(() => {
                window.gc();
            }, 60000); // Toutes les minutes
        }
    }
    
    preloadCriticalAssets() {
        const criticalAssets = [
            'assets/characters/crew-red-sheet.png',
            'assets/decor/floor-metal.png',
            'assets/sounds/button-click.wav',
            'assets/sounds/footstep.wav'
        ];
        
        criticalAssets.forEach(asset => {
            if (asset.endsWith('.png')) {
                const img = new Image();
                img.src = asset;
            } else if (asset.endsWith('.wav')) {
                const audio = new Audio();
                audio.preload = 'metadata';
                audio.src = asset;
            }
        });
    }
    
    handleOrientationChange() {
        // Recalculer les dimensions
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Réajuster l'interface
        this.adjustUIForOrientation();
        
        // Notifier l'application
        if (window.amongUsApp) {
            window.amongUsApp.handleResize();
        }
    }
    
    adjustUIForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
    }
    
    reduceBackgroundActivity() {
        // Réduire le FPS en arrière-plan
        this.backgroundFPS = 10;
        
        // Suspendre les animations non critiques
        document.body.classList.add('background-mode');
        
        // Réduire la qualité audio
        if (window.amongUsApp && window.amongUsApp.audioSystem && window.amongUsApp.audioSystem.isReady && window.amongUsApp.audioSystem.isReady()) {
            window.amongUsApp.audioSystem.setMasterVolume(0.1);
        }
    }
    
    restoreActivity() {
        // Restaurer le FPS normal
        this.backgroundFPS = this.performanceSettings.maxFPS;
        
        // Restaurer les animations
        document.body.classList.remove('background-mode');
        
        // Restaurer la qualité audio
        if (window.amongUsApp && window.amongUsApp.audioSystem && window.amongUsApp.audioSystem.isReady && window.amongUsApp.audioSystem.isReady()) {
            window.amongUsApp.audioSystem.setMasterVolume(0.7);
        }
    }
    
    cleanupUnusedResources() {
        // Nettoyer les textures non utilisées
        // Nettoyer les sons non utilisés
        // Nettoyer les objets DOM temporaires
        
        console.log('🧹 Cleaning up unused resources');
    }
    
    getOptimalCanvasSize() {
        const scale = this.performanceSettings.renderScale;
        return {
            width: Math.floor(window.innerWidth * scale),
            height: Math.floor(window.innerHeight * scale)
        };
    }
    
    // Getters pour les autres systèmes
    getPerformanceSettings() {
        return this.performanceSettings;
    }
    
    getDeviceInfo() {
        return this.deviceInfo;
    }
}

// Gestionnaire tactile avancé
class TouchHandler {
    constructor() {
        this.touches = new Map();
        this.gestures = {
            tap: { threshold: 10, maxDuration: 300 },
            longPress: { threshold: 10, minDuration: 500 },
            swipe: { minDistance: 50, maxDuration: 1000 },
            pinch: { minDistance: 10 }
        };
    }
    
    setupGestureHandling() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }
    
    handleTouchStart(e) {
        for (let touch of e.touches) {
            this.touches.set(touch.identifier, {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now(),
                currentX: touch.clientX,
                currentY: touch.clientY
            });
        }
    }
    
    handleTouchMove(e) {
        for (let touch of e.touches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
            }
        }
    }
    
    handleTouchEnd(e) {
        for (let touch of e.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                this.processGesture(touchData, touch);
                this.touches.delete(touch.identifier);
            }
        }
    }
    
    processGesture(touchData, touch) {
        const duration = Date.now() - touchData.startTime;
        const deltaX = touchData.currentX - touchData.startX;
        const deltaY = touchData.currentY - touchData.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Détecter le type de geste
        if (distance < this.gestures.tap.threshold && duration < this.gestures.tap.maxDuration) {
            this.dispatchGesture('tap', { x: touch.clientX, y: touch.clientY });
        } else if (distance < this.gestures.longPress.threshold && duration > this.gestures.longPress.minDuration) {
            this.dispatchGesture('longpress', { x: touch.clientX, y: touch.clientY });
        } else if (distance > this.gestures.swipe.minDistance && duration < this.gestures.swipe.maxDuration) {
            const direction = this.getSwipeDirection(deltaX, deltaY);
            this.dispatchGesture('swipe', { direction, distance, deltaX, deltaY });
        }
    }
    
    getSwipeDirection(deltaX, deltaY) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        if (absDeltaX > absDeltaY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }
    
    dispatchGesture(type, data) {
        const event = new CustomEvent(`gesture-${type}`, { detail: data });
        document.dispatchEvent(event);
    }
}

// Optimiseur de batterie
class BatteryOptimizer {
    constructor() {
        this.battery = null;
        this.lowBatteryThreshold = 0.2; // 20%
        this.criticalBatteryThreshold = 0.1; // 10%
    }
    
    monitor(battery) {
        this.battery = battery;
        
        battery.addEventListener('levelchange', () => {
            this.handleBatteryLevelChange();
        });
        
        battery.addEventListener('chargingchange', () => {
            this.handleChargingChange();
        });
        
        // Vérification initiale
        this.handleBatteryLevelChange();
    }
    
    handleBatteryLevelChange() {
        if (!this.battery) return;
        
        const level = this.battery.level;
        
        if (level <= this.criticalBatteryThreshold) {
            this.applyCriticalBatteryMode();
        } else if (level <= this.lowBatteryThreshold) {
            this.applyLowBatteryMode();
        } else {
            this.applyNormalMode();
        }
    }
    
    handleChargingChange() {
        if (!this.battery) return;
        
        if (this.battery.charging) {
            // En charge, on peut être moins restrictif
            this.applyNormalMode();
        } else {
            // Sur batterie, appliquer les optimisations
            this.handleBatteryLevelChange();
        }
    }
    
    applyCriticalBatteryMode() {
        console.log('🔋 Critical battery mode activated');
        
        // Réduire drastiquement les performances
        if (window.amongUsApp) {
            const app = window.amongUsApp;
            
            // Réduire le FPS
            app.maxFPS = 15;
            
            // Désactiver les effets
            if (app.mappingSystem) {
                app.mappingSystem.config.lightingEnabled = false;
                app.mappingSystem.config.shadowsEnabled = false;
                app.mappingSystem.config.particlesEnabled = false;
            }
            
            // Réduire la qualité audio
            if (app.audioSystem && app.audioSystem.isReady && app.audioSystem.isReady()) {
                app.audioSystem.setMasterVolume(0.3);
            }
        }
    }
    
    applyLowBatteryMode() {
        console.log('🔋 Low battery mode activated');
        
        // Réduire modérément les performances
        if (window.amongUsApp) {
            const app = window.amongUsApp;
            
            // Réduire le FPS
            app.maxFPS = 30;
            
            // Désactiver certains effets
            if (app.mappingSystem) {
                app.mappingSystem.config.particlesEnabled = false;
            }
            
            // Réduire la qualité audio
            if (app.audioSystem && app.audioSystem.isReady && app.audioSystem.isReady()) {
                app.audioSystem.setMasterVolume(0.5);
            }
        }
    }
    
    applyNormalMode() {
        console.log('🔋 Normal battery mode');
        
        // Restaurer les performances normales
        if (window.amongUsApp) {
            const app = window.amongUsApp;
            
            // Restaurer le FPS
            app.maxFPS = 60;
            
            // Restaurer les effets
            if (app.mappingSystem) {
                app.mappingSystem.config.lightingEnabled = true;
                app.mappingSystem.config.shadowsEnabled = true;
                app.mappingSystem.config.particlesEnabled = true;
            }
            
            // Restaurer la qualité audio
            if (app.audioSystem && app.audioSystem.isReady && app.audioSystem.isReady()) {
                app.audioSystem.setMasterVolume(0.7);
            }
        }
    }
}

// Initialiser les optimisations mobiles
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizations = new MobileOptimizations();
});

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileOptimizations, TouchHandler, BatteryOptimizer };
} else if (typeof window !== 'undefined') {
    window.MobileOptimizations = MobileOptimizations;
    window.TouchHandler = TouchHandler;
    window.BatteryOptimizer = BatteryOptimizer;
}