// Among Us V3 - Game Engine
class AmongUsV3Engine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.targetFrameTime = 1000 / this.fps;
        
        // Engine systems
        this.physics = null;
        this.graphics = null;
        this.audio = null;
        this.input = null;
        this.networking = null;
        
        // Game state
        this.gameState = {
            currentScene: 'menu',
            isLoading: false,
            isPaused: false,
            players: new Map(),
            gameObjects: new Map(),
            currentMap: null,
            gameMode: 'classic',
            settings: this.getDefaultSettings()
        };
        
        // Performance monitoring
        this.performance = {
            frameCount: 0,
            lastFpsUpdate: 0,
            currentFps: 0,
            averageFrameTime: 0,
            frameTimeHistory: []
        };
        
        // Event system
        this.eventListeners = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Among Us V3 Engine...');
        
        // Initialize canvas
        this.initCanvas();
        
        // Initialize input system
        this.initInput();
        
        // Initialize engine systems
        this.initSystems();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Engine initialized successfully');
    }
    
    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            powerPreference: 'high-performance'
        });
        
        // Set canvas size
        this.resizeCanvas();
        
        // Enable image smoothing
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        console.log('🎨 Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
    }
    
    initSystems() {
        // Initialize physics engine
        this.physics = new AmongUsV3Physics(this);
        
        // Initialize graphics renderer
        this.graphics = new AmongUsV3Graphics(this);
        
        // Initialize audio system
        this.audio = new AmongUsV3Audio(this);
        
        // Initialize networking
        this.networking = new AmongUsV3Networking(this);
        
        console.log('🔧 Engine systems initialized');
    }
    
    initInput() {
        this.input = {
            keys: new Set(),
            mouse: {
                x: 0,
                y: 0,
                buttons: new Set(),
                wheel: 0
            },
            touch: {
                touches: new Map(),
                isActive: false
            }
        };
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.input.keys.add(e.code);
            this.emit('keydown', { code: e.code, key: e.key });
        });
        
        document.addEventListener('keyup', (e) => {
            this.input.keys.delete(e.code);
            this.emit('keyup', { code: e.code, key: e.key });
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.input.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.emit('mousemove', this.input.mouse);
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.input.mouse.buttons.add(e.button);
            this.emit('mousedown', { button: e.button, ...this.input.mouse });
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.input.mouse.buttons.delete(e.button);
            this.emit('mouseup', { button: e.button, ...this.input.mouse });
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            this.input.mouse.wheel = e.deltaY;
            this.emit('wheel', { delta: e.deltaY, ...this.input.mouse });
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.touch.isActive = true;
            for (let touch of e.changedTouches) {
                const rect = this.canvas.getBoundingClientRect();
                this.input.touch.touches.set(touch.identifier, {
                    x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
                    y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
                });
            }
            this.emit('touchstart', { touches: Array.from(this.input.touch.touches.values()) });
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                const rect = this.canvas.getBoundingClientRect();
                this.input.touch.touches.set(touch.identifier, {
                    x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
                    y: (touch.clientY - rect.top) * (this.canvas.height / rect.height)
                });
            }
            this.emit('touchmove', { touches: Array.from(this.input.touch.touches.values()) });
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                this.input.touch.touches.delete(touch.identifier);
            }
            if (this.input.touch.touches.size === 0) {
                this.input.touch.isActive = false;
            }
            this.emit('touchend', { touches: Array.from(this.input.touch.touches.values()) });
        });
        
        console.log('🎮 Input system initialized');
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Focus events
        window.addEventListener('blur', () => {
            this.pause();
        });
        
        window.addEventListener('focus', () => {
            this.resume();
        });
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // Get viewport dimensions for mobile
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Use viewport dimensions on mobile, container on desktop
        const isMobile = window.innerWidth <= 768;
        const width = isMobile ? viewportWidth : container.clientWidth;
        const height = isMobile ? viewportHeight : container.clientHeight;
        
        // Set canvas size to match viewport/container
        const pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        
        // Set CSS size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Scale context to match device pixel ratio
        this.ctx.scale(pixelRatio, pixelRatio);
        
        // Update graphics system
        if (this.graphics) {
            this.graphics.onResize(this.canvas.width, this.canvas.height);
        }
        
        console.log(`📱 Canvas resized: ${width}x${height} (${this.canvas.width}x${this.canvas.height})`);
        this.emit('resize', { width: this.canvas.width, height: this.canvas.height });
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('🎮 Game engine started');
        this.emit('start');
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ Game engine stopped');
        this.emit('stop');
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.gameState.isPaused = true;
        console.log('⏸️ Game engine paused');
        this.emit('pause');
    }
    
    resume() {
        if (!this.isRunning || !this.gameState.isPaused) return;
        
        this.gameState.isPaused = false;
        this.lastTime = performance.now();
        console.log('▶️ Game engine resumed');
        this.emit('resume');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics(currentTime);
        
        // Skip frame if paused
        if (!this.gameState.isPaused) {
            // Update game systems
            this.update(this.deltaTime);
            
            // Render frame
            this.render();
        }
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update physics
        if (this.physics) {
            this.physics.update(deltaTime);
        }
        
        // Update game objects
        for (let [id, gameObject] of this.gameState.gameObjects) {
            if (gameObject.update) {
                gameObject.update(deltaTime);
            }
        }
        
        // Update players
        for (let [id, player] of this.gameState.players) {
            if (player.update) {
                player.update(deltaTime);
            }
        }
        
        // Update networking
        if (this.networking) {
            this.networking.update(deltaTime);
        }
        
        this.emit('update', { deltaTime });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render with graphics system
        if (this.graphics) {
            this.graphics.render(this.ctx);
        }
        
        this.emit('render', { ctx: this.ctx });
    }
    
    updatePerformanceMetrics(currentTime) {
        this.performance.frameCount++;
        this.performance.frameTimeHistory.push(this.deltaTime);
        
        // Keep only last 60 frame times
        if (this.performance.frameTimeHistory.length > 60) {
            this.performance.frameTimeHistory.shift();
        }
        
        // Update FPS every second
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.currentFps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            // Calculate average frame time
            const sum = this.performance.frameTimeHistory.reduce((a, b) => a + b, 0);
            this.performance.averageFrameTime = sum / this.performance.frameTimeHistory.length;
            
            this.emit('performance', this.performance);
        }
    }
    
    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    emit(event, data = {}) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        for (let callback of listeners) {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
            }
        }
    }
    
    // Game object management
    addGameObject(id, gameObject) {
        this.gameState.gameObjects.set(id, gameObject);
        gameObject.engine = this;
        
        if (gameObject.init) {
            gameObject.init();
        }
        
        this.emit('gameObjectAdded', { id, gameObject });
    }
    
    removeGameObject(id) {
        const gameObject = this.gameState.gameObjects.get(id);
        if (gameObject) {
            if (gameObject.destroy) {
                gameObject.destroy();
            }
            this.gameState.gameObjects.delete(id);
            this.emit('gameObjectRemoved', { id, gameObject });
        }
    }
    
    getGameObject(id) {
        return this.gameState.gameObjects.get(id);
    }
    
    // Player management
    addPlayer(id, player) {
        this.gameState.players.set(id, player);
        player.engine = this;
        
        if (player.init) {
            player.init();
        }
        
        this.emit('playerAdded', { id, player });
    }
    
    removePlayer(id) {
        const player = this.gameState.players.get(id);
        if (player) {
            if (player.destroy) {
                player.destroy();
            }
            this.gameState.players.delete(id);
            this.emit('playerRemoved', { id, player });
        }
    }
    
    getPlayer(id) {
        return this.gameState.players.get(id);
    }
    
    // Scene management
    changeScene(sceneName) {
        const oldScene = this.gameState.currentScene;
        this.gameState.currentScene = sceneName;
        
        this.emit('sceneChanged', { oldScene, newScene: sceneName });
        console.log(`🎬 Scene changed: ${oldScene} → ${sceneName}`);
    }
    
    // Settings management
    getDefaultSettings() {
        return {
            graphics: {
                quality: 'high',
                vsync: true,
                antialiasing: true,
                particleEffects: true,
                shadows: true,
                lighting: true
            },
            audio: {
                masterVolume: 0.8,
                musicVolume: 0.6,
                sfxVolume: 0.8,
                voiceVolume: 0.9
            },
            controls: {
                moveUp: 'KeyW',
                moveDown: 'KeyS',
                moveLeft: 'KeyA',
                moveRight: 'KeyD',
                interact: 'KeyE',
                map: 'Tab',
                report: 'KeyR',
                kill: 'KeyQ',
                sabotage: 'KeyF'
            },
            gameplay: {
                colorBlindSupport: false,
                chatFilter: true,
                quickChat: true,
                streamerMode: false
            }
        };
    }
    
    updateSetting(category, key, value) {
        if (this.gameState.settings[category]) {
            this.gameState.settings[category][key] = value;
            this.emit('settingChanged', { category, key, value });
            
            // Apply setting immediately
            this.applySetting(category, key, value);
        }
    }
    
    applySetting(category, key, value) {
        switch (category) {
            case 'graphics':
                if (this.graphics) {
                    this.graphics.applySetting(key, value);
                }
                break;
            case 'audio':
                if (this.audio) {
                    this.audio.applySetting(key, value);
                }
                break;
            case 'controls':
                // Update input mappings
                break;
        }
    }
    
    // Utility methods
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    getMousePosition() {
        return {
            x: this.input.mouse.x,
            y: this.input.mouse.y
        };
    }
    
    isKeyPressed(keyCode) {
        return this.input.keys.has(keyCode);
    }
    
    isMouseButtonPressed(button) {
        return this.input.mouse.buttons.has(button);
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            fps: this.performance.currentFps,
            frameTime: this.performance.averageFrameTime.toFixed(2) + 'ms',
            gameObjects: this.gameState.gameObjects.size,
            players: this.gameState.players.size,
            scene: this.gameState.currentScene,
            isRunning: this.isRunning,
            isPaused: this.gameState.isPaused
        };
    }
    
    enableDebugMode() {
        // Add debug overlay
        const debugOverlay = document.createElement('div');
        debugOverlay.id = 'debug-overlay';
        debugOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border-radius: 5px;
        `;
        document.body.appendChild(debugOverlay);
        
        // Update debug info
        const updateDebugInfo = () => {
            const info = this.getDebugInfo();
            debugOverlay.innerHTML = Object.entries(info)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
        };
        
        setInterval(updateDebugInfo, 100);
        console.log('🐛 Debug mode enabled');
    }
    
    // Game loop control
    start() {
        if (this.isRunning) {
            console.warn('⚠️ Engine is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('▶️ Engine started');
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ Engine stopped');
    }
    
    pause() {
        this.gameState.isPaused = true;
        console.log('⏸️ Engine paused');
    }
    
    resume() {
        this.gameState.isPaused = false;
        console.log('▶️ Engine resumed');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Skip frame if paused
        if (!this.gameState.isPaused) {
            // Update game systems
            this.update();
            
            // Render frame
            this.render();
        }
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update physics
        if (this.physics) {
            this.physics.update(this.deltaTime);
        }
        
        // Update game objects
        for (let [id, gameObject] of this.gameState.gameObjects) {
            if (gameObject.update) {
                gameObject.update(this.deltaTime);
            }
        }
        
        // Update players
        for (let [id, player] of this.gameState.players) {
            if (player.update) {
                player.update(this.deltaTime);
            }
        }
        
        // Emit update event
        this.emit('update', { deltaTime: this.deltaTime });
    }
    
    render() {
        if (this.graphics && this.ctx) {
            this.graphics.render(this.ctx);
        }
        
        // Emit render event
        this.emit('render', { ctx: this.ctx });
    }
    
    updatePerformanceMetrics() {
        this.performance.frameCount++;
        
        // Calculate FPS
        const now = performance.now();
        if (now - this.performance.lastFpsUpdate >= 1000) {
            this.performance.currentFps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = now;
        }
        
        // Track frame time
        this.performance.frameTimeHistory.push(this.deltaTime);
        if (this.performance.frameTimeHistory.length > 60) {
            this.performance.frameTimeHistory.shift();
        }
        
        // Calculate average frame time
        this.performance.averageFrameTime = 
            this.performance.frameTimeHistory.reduce((a, b) => a + b, 0) / 
            this.performance.frameTimeHistory.length;
    }
    
    // Cleanup
    destroy() {
        this.stop();
        
        // Cleanup systems
        if (this.physics) this.physics.destroy();
        if (this.graphics) this.graphics.destroy();
        if (this.audio) this.audio.destroy();
        if (this.networking) this.networking.destroy();
        
        // Clear event listeners
        this.eventListeners.clear();
        
        // Clear game state
        this.gameState.gameObjects.clear();
        this.gameState.players.clear();
        
        console.log('🧹 Engine destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Engine = AmongUsV3Engine;