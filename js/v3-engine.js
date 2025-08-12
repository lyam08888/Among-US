// Among Us V3 - Game Engine
class AmongUsV3Engine {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Canvas setup
        this.canvas = null;
        this.ctx = null;
        
        // Subsystems
        this.audio = null;
        this.graphics = null;
        this.physics = null;
        this.networking = null;
        
        // Event system
        this.events = new Map();
        
        // Game state
        this.gameState = {
            isPaused: false,
            currentScreen: 'loading',
            settings: {}
        };
        
        this.init();
    }
    
    init() {
        console.log('🔧 Initializing AmongUsV3Engine...');
        
        // Initialize canvas
        this.initCanvas();
        
        // Initialize subsystems
        this.audio = new AmongUsV3Audio(this);
        this.graphics = new AmongUsV3Graphics(this);
        this.physics = new AmongUsV3Physics(this);
        this.networking = new AmongUsV3Networking(this);
        
        this.isInitialized = true;
        console.log('✅ AmongUsV3Engine initialized');
    }
    
    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            console.log('🖼️ Canvas initialized');
        } else {
            console.warn('⚠️ Game canvas not found, creating temporary canvas');
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1920;
            this.canvas.height = 1080;
            this.ctx = this.canvas.getContext('2d');
        }
    }
    
    // Event system
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
    }
    
    off(eventName, callback) {
        if (this.events.has(eventName)) {
            const callbacks = this.events.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(eventName, data) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }
    
    // Game loop
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
        console.log('🎮 Game engine started');
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ Game engine stopped');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (!this.gameState.isPaused) {
            this.update(this.deltaTime);
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update physics
        if (this.physics) {
            this.physics.update(deltaTime);
        }
        
        // Update audio
        if (this.audio) {
            this.audio.update(deltaTime);
        }
        
        // Update graphics
        if (this.graphics) {
            this.graphics.update(deltaTime);
        }
        
        // Emit update event
        this.emit('update', { deltaTime });
    }
    
    render() {
        if (this.graphics) {
            this.graphics.render();
        }
    }
    
    // Settings management
    updateSetting(category, key, value) {
        if (!this.gameState.settings[category]) {
            this.gameState.settings[category] = {};
        }
        this.gameState.settings[category][key] = value;
        
        // Notify subsystems
        if (this.audio) {
            this.audio.applySetting(key, value);
        }
        if (this.graphics) {
            this.graphics.applySetting(key, value);
        }
    }
    
    getSetting(category, key) {
        return this.gameState.settings[category]?.[key];
    }
    
    // Utility methods
    pause() {
        this.gameState.isPaused = true;
        this.emit('paused');
    }
    
    resume() {
        this.gameState.isPaused = false;
        this.emit('resumed');
    }
    
    destroy() {
        this.stop();
        
        // Cleanup subsystems
        if (this.audio) {
            this.audio.destroy();
        }
        if (this.graphics) {
            this.graphics.destroy();
        }
        if (this.physics) {
            this.physics.destroy();
        }
        if (this.networking) {
            this.networking.destroy();
        }
        
        this.events.clear();
        console.log('🗑️ Game engine destroyed');
    }
}

// Note: AmongUsV3Graphics class is defined in v3-graphics.js

// Note: AmongUsV3Physics class is defined in v3-physics.js
// Note: AmongUsV3Networking class is defined in v3-networking.js

// Export for use in other modules
window.AmongUsV3Engine = AmongUsV3Engine;
