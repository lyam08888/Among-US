// Among Us V3 - Performance Optimization System
class AmongUsV3Performance {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Performance metrics
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            drawCalls: 0,
            particleCount: 0,
            entityCount: 0
        };
        
        // Performance settings
        this.settings = {
            targetFPS: 60,
            maxParticles: 1000,
            maxEntities: 100,
            enableVSync: true,
            enableCulling: true,
            enableLOD: true,
            qualityLevel: 'high' // low, medium, high, ultra
        };
        
        // Optimization state
        this.frameHistory = [];
        this.lastFrameTime = 0;
        this.adaptiveQuality = true;
        this.performanceMode = false;
        
        // Culling system
        this.cullingBounds = {
            left: -100,
            right: 2020,
            top: -100,
            bottom: 1180
        };
        
        // LOD (Level of Detail) system
        this.lodLevels = {
            high: { distance: 200, quality: 1.0 },
            medium: { distance: 500, quality: 0.7 },
            low: { distance: 1000, quality: 0.4 },
            minimal: { distance: Infinity, quality: 0.2 }
        };
        
        console.log('⚡ Performance system created');
    }
    
    async initialize() {
        try {
            // Detect device capabilities
            this.detectDeviceCapabilities();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Apply initial optimizations
            this.applyOptimizations();
            
            // Setup adaptive quality
            if (this.adaptiveQuality) {
                this.setupAdaptiveQuality();
            }
            
            this.isInitialized = true;
            console.log('⚡ Performance system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize performance system:', error);
        }
    }
    
    detectDeviceCapabilities() {
        // Detect GPU capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        this.capabilities = {
            webgl: !!gl,
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
            maxViewportDims: gl ? gl.getParameter(gl.MAX_VIEWPORT_DIMS) : [1920, 1080],
            devicePixelRatio: window.devicePixelRatio || 1,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4
        };
        
        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Auto-adjust quality based on device
        if (this.isMobile || this.capabilities.memory < 4) {
            this.settings.qualityLevel = 'medium';
            this.settings.maxParticles = 500;
            this.settings.maxEntities = 50;
        }
        
        console.log('📱 Device capabilities detected:', this.capabilities);
    }
    
    setupPerformanceMonitoring() {
        // FPS monitoring
        this.fpsCounter = {
            frames: 0,
            lastTime: performance.now(),
            fps: 0
        };
        
        // Memory monitoring (if available)
        if (performance.memory) {
            this.memoryMonitor = {
                used: 0,
                total: 0,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        
        // Frame time monitoring
        this.frameTimeMonitor = {
            times: [],
            average: 0,
            max: 0,
            min: Infinity
        };
    }
    
    setupAdaptiveQuality() {
        // Monitor performance and adjust quality automatically
        setInterval(() => {
            this.updateAdaptiveQuality();
        }, 2000); // Check every 2 seconds
    }
    
    updateAdaptiveQuality() {
        const avgFPS = this.metrics.fps;
        const targetFPS = this.settings.targetFPS;
        
        // If FPS is consistently low, reduce quality
        if (avgFPS < targetFPS * 0.8) {
            this.reduceQuality();
        }
        // If FPS is consistently high, increase quality
        else if (avgFPS > targetFPS * 0.95 && !this.performanceMode) {
            this.increaseQuality();
        }
    }
    
    reduceQuality() {
        const currentLevel = this.settings.qualityLevel;
        
        switch (currentLevel) {
            case 'ultra':
                this.settings.qualityLevel = 'high';
                break;
            case 'high':
                this.settings.qualityLevel = 'medium';
                this.settings.maxParticles = Math.floor(this.settings.maxParticles * 0.7);
                break;
            case 'medium':
                this.settings.qualityLevel = 'low';
                this.settings.maxParticles = Math.floor(this.settings.maxParticles * 0.5);
                this.performanceMode = true;
                break;
        }
        
        this.applyOptimizations();
        console.log('📉 Quality reduced to:', this.settings.qualityLevel);
    }
    
    increaseQuality() {
        const currentLevel = this.settings.qualityLevel;
        
        switch (currentLevel) {
            case 'low':
                this.settings.qualityLevel = 'medium';
                this.settings.maxParticles = Math.floor(this.settings.maxParticles * 1.5);
                this.performanceMode = false;
                break;
            case 'medium':
                this.settings.qualityLevel = 'high';
                this.settings.maxParticles = Math.floor(this.settings.maxParticles * 1.3);
                break;
            case 'high':
                if (!this.isMobile && this.capabilities.memory >= 8) {
                    this.settings.qualityLevel = 'ultra';
                }
                break;
        }
        
        this.applyOptimizations();
        console.log('📈 Quality increased to:', this.settings.qualityLevel);
    }
    
    applyOptimizations() {
        // Apply quality-based optimizations
        switch (this.settings.qualityLevel) {
            case 'low':
                this.applyLowQualitySettings();
                break;
            case 'medium':
                this.applyMediumQualitySettings();
                break;
            case 'high':
                this.applyHighQualitySettings();
                break;
            case 'ultra':
                this.applyUltraQualitySettings();
                break;
        }
        
        // Notify other systems of quality change
        this.engine.emit('qualityChanged', {
            level: this.settings.qualityLevel,
            settings: this.settings
        });
    }
    
    applyLowQualitySettings() {
        this.settings.maxParticles = 200;
        this.settings.enableCulling = true;
        this.settings.enableLOD = true;
        
        // Reduce visual effects
        document.documentElement.style.setProperty('--animation-quality', '0.5');
        document.documentElement.style.setProperty('--particle-quality', '0.3');
        document.documentElement.style.setProperty('--shadow-quality', '0.2');
    }
    
    applyMediumQualitySettings() {
        this.settings.maxParticles = 500;
        this.settings.enableCulling = true;
        this.settings.enableLOD = true;
        
        document.documentElement.style.setProperty('--animation-quality', '0.7');
        document.documentElement.style.setProperty('--particle-quality', '0.6');
        document.documentElement.style.setProperty('--shadow-quality', '0.5');
    }
    
    applyHighQualitySettings() {
        this.settings.maxParticles = 1000;
        this.settings.enableCulling = true;
        this.settings.enableLOD = false;
        
        document.documentElement.style.setProperty('--animation-quality', '1.0');
        document.documentElement.style.setProperty('--particle-quality', '0.8');
        document.documentElement.style.setProperty('--shadow-quality', '0.8');
    }
    
    applyUltraQualitySettings() {
        this.settings.maxParticles = 2000;
        this.settings.enableCulling = false;
        this.settings.enableLOD = false;
        
        document.documentElement.style.setProperty('--animation-quality', '1.0');
        document.documentElement.style.setProperty('--particle-quality', '1.0');
        document.documentElement.style.setProperty('--shadow-quality', '1.0');
    }
    
    // Culling system
    isInViewport(object) {
        if (!this.settings.enableCulling) return true;
        
        const bounds = this.cullingBounds;
        const pos = object.position || { x: 0, y: 0 };
        const size = object.size || 50;
        
        return (
            pos.x + size >= bounds.left &&
            pos.x - size <= bounds.right &&
            pos.y + size >= bounds.top &&
            pos.y - size <= bounds.bottom
        );
    }
    
    // LOD system
    getLODLevel(object, cameraPosition) {
        if (!this.settings.enableLOD) return 'high';
        
        const distance = this.calculateDistance(object.position, cameraPosition);
        
        for (const [level, config] of Object.entries(this.lodLevels)) {
            if (distance <= config.distance) {
                return level;
            }
        }
        
        return 'minimal';
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Performance monitoring
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.updateFPSCounter();
        this.updateFrameTime(deltaTime);
        this.updateMemoryUsage();
        this.updateMetrics();
    }
    
    updateFPSCounter() {
        const now = performance.now();
        this.fpsCounter.frames++;
        
        if (now - this.fpsCounter.lastTime >= 1000) {
            this.metrics.fps = Math.round(
                (this.fpsCounter.frames * 1000) / (now - this.fpsCounter.lastTime)
            );
            
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = now;
        }
    }
    
    updateFrameTime(deltaTime) {
        this.metrics.frameTime = deltaTime;
        
        // Keep frame time history
        this.frameTimeMonitor.times.push(deltaTime);
        if (this.frameTimeMonitor.times.length > 60) {
            this.frameTimeMonitor.times.shift();
        }
        
        // Calculate statistics
        const times = this.frameTimeMonitor.times;
        this.frameTimeMonitor.average = times.reduce((a, b) => a + b, 0) / times.length;
        this.frameTimeMonitor.max = Math.max(...times);
        this.frameTimeMonitor.min = Math.min(...times);
    }
    
    updateMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(
                performance.memory.usedJSHeapSize / 1024 / 1024
            );
        }
    }
    
    updateMetrics() {
        // Update particle count from particle system
        if (this.engine.particles) {
            this.metrics.particleCount = this.engine.particles.getActiveParticleCount();
        }
        
        // Update entity count from game logic
        if (this.engine.gameLogic) {
            this.metrics.entityCount = this.engine.gameLogic.getEntityCount();
        }
    }
    
    // Performance profiling
    startProfile(name) {
        if (this.performanceMode) return;
        performance.mark(`${name}-start`);
    }
    
    endProfile(name) {
        if (this.performanceMode) return;
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
    }
    
    getProfileResults() {
        const measures = performance.getEntriesByType('measure');
        return measures.map(measure => ({
            name: measure.name,
            duration: measure.duration,
            startTime: measure.startTime
        }));
    }
    
    // Memory management
    cleanupMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear performance entries
        performance.clearMarks();
        performance.clearMeasures();
        
        // Notify systems to cleanup
        this.engine.emit('memoryCleanup');
    }
    
    // Performance warnings
    checkPerformanceWarnings() {
        const warnings = [];
        
        if (this.metrics.fps < 30) {
            warnings.push('Low FPS detected. Consider reducing quality settings.');
        }
        
        if (this.metrics.memoryUsage > 500) {
            warnings.push('High memory usage detected. Consider restarting the game.');
        }
        
        if (this.metrics.particleCount > this.settings.maxParticles) {
            warnings.push('Too many particles. Some effects may be disabled.');
        }
        
        return warnings;
    }
    
    // Debug information
    getDebugInfo() {
        return {
            metrics: this.metrics,
            settings: this.settings,
            capabilities: this.capabilities,
            frameTimeStats: this.frameTimeMonitor,
            isMobile: this.isMobile,
            performanceMode: this.performanceMode,
            warnings: this.checkPerformanceWarnings()
        };
    }
    
    // Performance overlay
    createPerformanceOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'performance-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // Update overlay every second
        setInterval(() => {
            this.updatePerformanceOverlay(overlay);
        }, 1000);
        
        return overlay;
    }
    
    updatePerformanceOverlay(overlay) {
        const info = this.getDebugInfo();
        overlay.innerHTML = `
            <div>FPS: ${info.metrics.fps}</div>
            <div>Frame Time: ${info.metrics.frameTime.toFixed(2)}ms</div>
            <div>Memory: ${info.metrics.memoryUsage}MB</div>
            <div>Particles: ${info.metrics.particleCount}</div>
            <div>Quality: ${info.settings.qualityLevel}</div>
            ${info.performanceMode ? '<div style="color: orange;">Performance Mode</div>' : ''}
            ${info.warnings.length > 0 ? `<div style="color: red;">⚠️ ${info.warnings.length} warnings</div>` : ''}
        `;
    }
    
    // Public API
    setQualityLevel(level) {
        this.settings.qualityLevel = level;
        this.applyOptimizations();
    }
    
    enablePerformanceMode() {
        this.performanceMode = true;
        this.setQualityLevel('low');
    }
    
    disablePerformanceMode() {
        this.performanceMode = false;
        this.setQualityLevel('high');
    }
    
    toggleAdaptiveQuality() {
        this.adaptiveQuality = !this.adaptiveQuality;
        if (this.adaptiveQuality) {
            this.setupAdaptiveQuality();
        }
    }
    
    // Cleanup
    destroy() {
        // Remove performance overlay
        const overlay = document.getElementById('performance-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Clear performance data
        performance.clearMarks();
        performance.clearMeasures();
        
        this.isInitialized = false;
        console.log('⚡ Performance system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Performance = AmongUsV3Performance;