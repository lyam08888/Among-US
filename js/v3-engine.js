// Among Us V3 - Game Engine
class AmongUsV3Engine {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
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
        
        // Initialize subsystems
        this.audio = new AmongUsV3Audio(this);
        this.graphics = new AmongUsV3Graphics(this);
        this.physics = new AmongUsV3Physics(this);
        this.networking = new AmongUsV3Networking(this);
        
        this.isInitialized = true;
        console.log('✅ AmongUsV3Engine initialized');
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

// Placeholder classes for subsystems
class AmongUsV3Graphics {
    constructor(engine) {
        this.engine = engine;
        this.canvas = null;
        this.ctx = null;
        this.layers = {
            background: [],
            environment: [],
            objects: [],
            players: []
        };
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            target: { x: 0, y: 0 }
        };
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            console.log('🎨 Graphics system initialized');
        }
    }
    
    update(deltaTime) {
        // Update camera position
        if (this.camera.target) {
            this.camera.x = this.camera.target.x;
            this.camera.y = this.camera.target.y;
        }
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render layers
        this.renderLayer(this.layers.background);
        this.renderLayer(this.layers.environment);
        this.renderLayer(this.layers.objects);
        this.renderLayer(this.layers.players);
    }
    
    renderLayer(layer) {
        if (!layer || !this.ctx) return;
        
        layer.forEach(obj => {
            this.renderObject(obj);
        });
    }
    
    renderObject(obj) {
        // Basic rendering for different object types
        switch(obj.type) {
            case 'background':
                this.ctx.fillStyle = obj.color || '#1a1a2e';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
                
            case 'room':
                this.ctx.fillStyle = obj.color || '#4a5568';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                break;
                
            case 'player':
                this.ctx.fillStyle = obj.color || '#ff3838';
                this.ctx.beginPath();
                this.ctx.arc(obj.x, obj.y, 25, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Player name
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(obj.name, obj.x, obj.y - 35);
                break;
                
            case 'task':
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
                break;
                
            case 'vent':
                this.ctx.fillStyle = '#6b7280';
                this.ctx.beginPath();
                this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.camera.x - this.canvas.width / 2,
            y: screenY + this.camera.y - this.canvas.height / 2
        };
    }
    
    applySetting(key, value) {
        // Apply graphics settings
        console.log(`Graphics setting updated: ${key} = ${value}`);
    }
    
    destroy() {
        console.log('🎨 Graphics system destroyed');
    }
}

class AmongUsV3Physics {
    constructor(engine) {
        this.engine = engine;
        this.collisionBodies = new Map();
        this.gravity = { x: 0, y: 0 };
    }
    
    update(deltaTime) {
        // Update physics simulation
        this.collisionBodies.forEach((body, id) => {
            if (body.type === 'dynamic') {
                // Simple physics update
                body.position.x += body.velocity.x * deltaTime / 1000;
                body.position.y += body.velocity.y * deltaTime / 1000;
            }
        });
    }
    
    createBody(id, config) {
        this.collisionBodies.set(id, {
            id,
            position: { x: config.x || 0, y: config.y || 0 },
            velocity: { x: 0, y: 0 },
            width: config.width || 50,
            height: config.height || 50,
            type: config.type || 'static',
            mass: config.mass || 1,
            friction: config.friction || 0.8,
            restitution: config.restitution || 0
        });
    }
    
    destroy() {
        this.collisionBodies.clear();
        console.log('⚙️ Physics system destroyed');
    }
}

class AmongUsV3Networking {
    constructor(engine) {
        this.engine = engine;
        this.isConnected = false;
    }
    
    async initialize() {
        console.log('🌐 Networking system initialized');
        this.isConnected = true;
    }
    
    destroy() {
        this.isConnected = false;
        console.log('🌐 Networking system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Engine = AmongUsV3Engine;
