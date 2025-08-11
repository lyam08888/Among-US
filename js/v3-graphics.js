// Among Us V3 - Advanced Graphics System
class AmongUsV3Graphics {
    constructor(engine) {
        this.engine = engine;
        this.canvas = engine.canvas;
        this.ctx = engine.ctx;
        
        // Graphics settings
        this.settings = {
            quality: 'high',
            antialiasing: true,
            shadows: true,
            lighting: true,
            particleEffects: true,
            postProcessing: true,
            vsync: true
        };
        
        // Rendering layers
        this.layers = {
            background: [],
            environment: [],
            objects: [],
            players: [],
            effects: [],
            ui: [],
            debug: []
        };
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            rotation: 0,
            target: null,
            smoothing: 0.1,
            bounds: null,
            shake: { x: 0, y: 0, intensity: 0, duration: 0 }
        };
        
        // Lighting system
        this.lighting = {
            enabled: true,
            ambientColor: { r: 0.3, g: 0.3, b: 0.4, a: 1 },
            lights: new Map(),
            shadowMap: null,
            lightMap: null
        };
        
        // Particle system
        this.particles = {
            systems: new Map(),
            maxParticles: 1000,
            activeParticles: 0
        };
        
        // Asset management
        this.assets = {
            textures: new Map(),
            sprites: new Map(),
            animations: new Map(),
            fonts: new Map()
        };
        
        // Post-processing effects
        this.postEffects = {
            enabled: true,
            bloom: false,
            blur: false,
            colorGrading: false,
            vignette: false
        };
        
        // Performance tracking
        this.performance = {
            drawCalls: 0,
            triangles: 0,
            lastFrameTime: 0
        };
        
        this.init();
    }
    
    init() {
        // Initialize off-screen canvases for effects
        this.initOffscreenCanvases();
        
        // Load default assets
        this.loadDefaultAssets();
        
        // Setup rendering pipeline
        this.setupRenderingPipeline();
        
        console.log('🎨 Graphics system initialized');
    }
    
    initOffscreenCanvases() {
        // Shadow map canvas
        this.shadowCanvas = document.createElement('canvas');
        this.shadowCanvas.width = this.canvas.width / 2;
        this.shadowCanvas.height = this.canvas.height / 2;
        this.shadowCtx = this.shadowCanvas.getContext('2d');
        
        // Light map canvas
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = this.canvas.width;
        this.lightCanvas.height = this.canvas.height;
        this.lightCtx = this.lightCanvas.getContext('2d');
        
        // Post-processing canvas
        this.postCanvas = document.createElement('canvas');
        this.postCanvas.width = this.canvas.width;
        this.postCanvas.height = this.canvas.height;
        this.postCtx = this.postCanvas.getContext('2d');
    }
    
    loadDefaultAssets() {
        // Create default textures programmatically
        this.createDefaultTextures();
        
        // Load sprite sheets
        this.loadSpriteSheets();
        
        // Create animations
        this.createAnimations();
    }
    
    createDefaultTextures() {
        // Crewmate body texture
        const crewmateTexture = this.createCrewmateTexture();
        this.assets.textures.set('crewmate', crewmateTexture);
        
        // Wall texture
        const wallTexture = this.createWallTexture();
        this.assets.textures.set('wall', wallTexture);
        
        // Floor texture
        const floorTexture = this.createFloorTexture();
        this.assets.textures.set('floor', floorTexture);
        
        // Task panel texture
        const taskTexture = this.createTaskTexture();
        this.assets.textures.set('task', taskTexture);
        
        // Vent texture
        const ventTexture = this.createVentTexture();
        this.assets.textures.set('vent', ventTexture);
    }
    
    createCrewmateTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Body
        ctx.fillStyle = '#ff3838';
        ctx.beginPath();
        ctx.ellipse(50, 60, 35, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add gradient shading
        const gradient = ctx.createRadialGradient(35, 45, 0, 50, 60, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Visor
        ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(50, 45, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visor reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(42, 38, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Backpack
        ctx.fillStyle = '#cc2020';
        ctx.fillRect(70, 45, 15, 25);
        ctx.beginPath();
        ctx.arc(77.5, 45, 7.5, Math.PI, 0);
        ctx.fill();
        
        return canvas;
    }
    
    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 0, 64, 64);
        
        // Add metallic pattern
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        
        // Vertical lines
        for (let x = 0; x < 64; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 64);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < 64; y += 16) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(64, y);
            ctx.stroke();
        }
        
        // Add rivets
        ctx.fillStyle = '#718096';
        for (let x = 8; x < 64; x += 16) {
            for (let y = 8; y < 64; y += 16) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        return canvas;
    }
    
    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, 64, 64);
        
        // Add grid pattern
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1;
        
        // Grid lines
        for (let x = 0; x <= 64; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 64);
            ctx.stroke();
        }
        
        for (let y = 0; y <= 64; y += 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(64, y);
            ctx.stroke();
        }
        
        return canvas;
    }
    
    createTaskTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Panel background
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(0, 0, 80, 60);
        
        // Screen
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(10, 10, 60, 40);
        
        // Screen glow
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(10, 10, 60, 40);
        ctx.shadowBlur = 0;
        
        // Buttons
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(5, 52, 12, 6);
        ctx.fillRect(20, 52, 12, 6);
        ctx.fillRect(35, 52, 12, 6);
        
        return canvas;
    }
    
    createVentTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        
        // Vent base
        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.arc(30, 30, 28, 0, Math.PI * 2);
        ctx.fill();
        
        // Vent grille
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = 30 + Math.cos(angle) * 10;
            const y1 = 30 + Math.sin(angle) * 10;
            const x2 = 30 + Math.cos(angle) * 25;
            const y2 = 30 + Math.sin(angle) * 25;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Center circle
        ctx.fillStyle = '#1a202c';
        ctx.beginPath();
        ctx.arc(30, 30, 8, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    loadSpriteSheets() {
        // This would load actual sprite sheets in a real implementation
        // For now, we'll create them programmatically
        
        const crewmateSheet = this.createCrewmateSpriteSheet();
        this.assets.sprites.set('crewmate', crewmateSheet);
    }
    
    createCrewmateSpriteSheet() {
        const colors = [
            '#ff3838', '#132ed1', '#117f2d', '#ed54ba',
            '#f07613', '#f5f557', '#3f474e', '#d6e0f0',
            '#6b2fbb', '#71491e', '#38fedc', '#50ef39'
        ];
        
        const sprites = new Map();
        
        colors.forEach((color, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Draw crewmate with specific color
            this.drawCrewmate(ctx, 50, 50, color, 1);
            
            sprites.set(index, canvas);
        });
        
        return sprites;
    }
    
    drawCrewmate(ctx, x, y, color, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 10, 35, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add gradient shading
        const gradient = ctx.createRadialGradient(-15, -15, 0, 0, 10, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Visor
        ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(0, -5, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visor reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-8, -12, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Backpack
        const backpackColor = this.darkenColor(color, 0.2);
        ctx.fillStyle = backpackColor;
        ctx.fillRect(20, -5, 15, 25);
        ctx.beginPath();
        ctx.arc(27.5, -5, 7.5, Math.PI, 0);
        ctx.fill();
        
        ctx.restore();
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    createAnimations() {
        // Walking animation
        this.assets.animations.set('walk', {
            frames: [
                { offsetY: 0, duration: 200 },
                { offsetY: -2, duration: 200 },
                { offsetY: 0, duration: 200 },
                { offsetY: 2, duration: 200 }
            ],
            loop: true
        });
        
        // Idle animation
        this.assets.animations.set('idle', {
            frames: [
                { offsetY: 0, duration: 1000 },
                { offsetY: -1, duration: 1000 },
                { offsetY: 0, duration: 1000 }
            ],
            loop: true
        });
        
        // Task animation
        this.assets.animations.set('task', {
            frames: [
                { scale: 1, duration: 300 },
                { scale: 1.05, duration: 300 },
                { scale: 1, duration: 300 }
            ],
            loop: true
        });
    }
    
    setupRenderingPipeline() {
        // Setup render order
        this.renderOrder = [
            'background',
            'environment',
            'objects',
            'players',
            'effects',
            'ui',
            'debug'
        ];
    }
    
    render(ctx) {
        this.performance.drawCalls = 0;
        this.performance.triangles = 0;
        
        const startTime = performance.now();
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update camera
        this.updateCamera();
        
        // Apply camera transform
        ctx.save();
        this.applyCameraTransform(ctx);
        
        // Render lighting if enabled
        if (this.lighting.enabled && this.settings.lighting) {
            this.renderLighting();
        }
        
        // Render all layers in order
        for (let layerName of this.renderOrder) {
            this.renderLayer(ctx, layerName);
        }
        
        ctx.restore();
        
        // Apply post-processing effects
        if (this.postEffects.enabled && this.settings.postProcessing) {
            this.applyPostProcessing(ctx);
        }
        
        // Update performance metrics
        this.performance.lastFrameTime = performance.now() - startTime;
    }
    
    updateCamera() {
        // Camera shake
        if (this.camera.shake.duration > 0) {
            this.camera.shake.x = (Math.random() - 0.5) * this.camera.shake.intensity;
            this.camera.shake.y = (Math.random() - 0.5) * this.camera.shake.intensity;
            this.camera.shake.duration -= this.engine.deltaTime;
            
            if (this.camera.shake.duration <= 0) {
                this.camera.shake.x = 0;
                this.camera.shake.y = 0;
            }
        }
        
        // Follow target
        if (this.camera.target) {
            const targetX = this.camera.target.x - this.canvas.width / 2;
            const targetY = this.camera.target.y - this.canvas.height / 2;
            
            this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
            this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
        }
        
        // Apply camera bounds
        if (this.camera.bounds) {
            this.camera.x = Math.max(this.camera.bounds.left, 
                           Math.min(this.camera.x, this.camera.bounds.right - this.canvas.width));
            this.camera.y = Math.max(this.camera.bounds.top, 
                           Math.min(this.camera.y, this.camera.bounds.bottom - this.canvas.height));
        }
    }
    
    applyCameraTransform(ctx) {
        ctx.translate(
            -this.camera.x + this.camera.shake.x,
            -this.camera.y + this.camera.shake.y
        );
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.rotate(this.camera.rotation);
    }
    
    renderLighting() {
        // Clear light canvas
        this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        
        // Set ambient lighting
        this.lightCtx.fillStyle = `rgba(${this.lighting.ambientColor.r * 255}, ${this.lighting.ambientColor.g * 255}, ${this.lighting.ambientColor.b * 255}, ${this.lighting.ambientColor.a})`;
        this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        
        // Render each light
        this.lightCtx.globalCompositeOperation = 'lighter';
        
        for (let [id, light] of this.lighting.lights) {
            this.renderLight(this.lightCtx, light);
        }
        
        this.lightCtx.globalCompositeOperation = 'source-over';
    }
    
    renderLight(ctx, light) {
        const gradient = ctx.createRadialGradient(
            light.x, light.y, 0,
            light.x, light.y, light.radius
        );
        
        gradient.addColorStop(0, `rgba(${light.color.r * 255}, ${light.color.g * 255}, ${light.color.b * 255}, ${light.intensity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderLayer(ctx, layerName) {
        const layer = this.layers[layerName];
        if (!layer || layer.length === 0) return;
        
        for (let renderable of layer) {
            if (renderable.visible !== false) {
                this.renderObject(ctx, renderable);
            }
        }
    }
    
    renderObject(ctx, obj) {
        if (!this.isInView(obj)) return;
        
        ctx.save();
        
        // Apply object transform
        if (obj.x !== undefined && obj.y !== undefined) {
            ctx.translate(obj.x, obj.y);
        }
        
        if (obj.rotation) {
            ctx.rotate(obj.rotation);
        }
        
        if (obj.scaleX !== undefined || obj.scaleY !== undefined) {
            ctx.scale(obj.scaleX || 1, obj.scaleY || 1);
        }
        
        if (obj.alpha !== undefined) {
            ctx.globalAlpha = obj.alpha;
        }
        
        // Render based on type
        switch (obj.type) {
            case 'sprite':
                this.renderSprite(ctx, obj);
                break;
            case 'text':
                this.renderText(ctx, obj);
                break;
            case 'shape':
                this.renderShape(ctx, obj);
                break;
            case 'particle':
                this.renderParticle(ctx, obj);
                break;
            case 'custom':
                if (obj.render) {
                    obj.render(ctx);
                }
                break;
        }
        
        ctx.restore();
        this.performance.drawCalls++;
    }
    
    renderSprite(ctx, sprite) {
        const texture = this.assets.textures.get(sprite.texture);
        if (!texture) return;
        
        const width = sprite.width || texture.width;
        const height = sprite.height || texture.height;
        
        ctx.drawImage(
            texture,
            sprite.sourceX || 0,
            sprite.sourceY || 0,
            sprite.sourceWidth || texture.width,
            sprite.sourceHeight || texture.height,
            -width / 2,
            -height / 2,
            width,
            height
        );
    }
    
    renderText(ctx, text) {
        ctx.font = text.font || '16px Arial';
        ctx.fillStyle = text.color || '#ffffff';
        ctx.textAlign = text.align || 'center';
        ctx.textBaseline = text.baseline || 'middle';
        
        if (text.stroke) {
            ctx.strokeStyle = text.strokeColor || '#000000';
            ctx.lineWidth = text.strokeWidth || 2;
            ctx.strokeText(text.text, 0, 0);
        }
        
        ctx.fillText(text.text, 0, 0);
    }
    
    renderShape(ctx, shape) {
        ctx.fillStyle = shape.fillColor || '#ffffff';
        ctx.strokeStyle = shape.strokeColor || '#000000';
        ctx.lineWidth = shape.lineWidth || 1;
        
        switch (shape.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
                if (shape.fill) ctx.fill();
                if (shape.stroke) ctx.stroke();
                break;
                
            case 'rectangle':
                if (shape.fill) {
                    ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                }
                if (shape.stroke) {
                    ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                }
                break;
                
            case 'polygon':
                if (shape.points && shape.points.length > 2) {
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    ctx.closePath();
                    if (shape.fill) ctx.fill();
                    if (shape.stroke) ctx.stroke();
                }
                break;
        }
    }
    
    renderParticle(ctx, particle) {
        ctx.globalAlpha = particle.alpha || 1;
        ctx.fillStyle = particle.color || '#ffffff';
        
        ctx.beginPath();
        ctx.arc(0, 0, particle.size || 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    isInView(obj) {
        if (!obj.x || !obj.y) return true;
        
        const margin = 100; // Render objects slightly outside view
        const viewLeft = this.camera.x - margin;
        const viewRight = this.camera.x + this.canvas.width + margin;
        const viewTop = this.camera.y - margin;
        const viewBottom = this.camera.y + this.canvas.height + margin;
        
        const objSize = Math.max(obj.width || 0, obj.height || 0, obj.radius || 0);
        
        return obj.x + objSize >= viewLeft &&
               obj.x - objSize <= viewRight &&
               obj.y + objSize >= viewTop &&
               obj.y - objSize <= viewBottom;
    }
    
    applyPostProcessing(ctx) {
        // Copy main canvas to post-processing canvas
        this.postCtx.clearRect(0, 0, this.postCanvas.width, this.postCanvas.height);
        this.postCtx.drawImage(this.canvas, 0, 0);
        
        // Apply effects
        if (this.postEffects.bloom) {
            this.applyBloom();
        }
        
        if (this.postEffects.blur) {
            this.applyBlur();
        }
        
        if (this.postEffects.vignette) {
            this.applyVignette();
        }
        
        // Copy back to main canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.postCanvas, 0, 0);
    }
    
    applyBloom() {
        // Simplified bloom effect
        this.postCtx.globalCompositeOperation = 'screen';
        this.postCtx.filter = 'blur(5px) brightness(1.5)';
        this.postCtx.drawImage(this.postCanvas, 0, 0);
        this.postCtx.filter = 'none';
        this.postCtx.globalCompositeOperation = 'source-over';
    }
    
    applyBlur() {
        this.postCtx.filter = 'blur(2px)';
        this.postCtx.drawImage(this.postCanvas, 0, 0);
        this.postCtx.filter = 'none';
    }
    
    applyVignette() {
        const gradient = this.postCtx.createRadialGradient(
            this.postCanvas.width / 2, this.postCanvas.height / 2, 0,
            this.postCanvas.width / 2, this.postCanvas.height / 2, 
            Math.max(this.postCanvas.width, this.postCanvas.height) / 2
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.postCtx.fillStyle = gradient;
        this.postCtx.fillRect(0, 0, this.postCanvas.width, this.postCanvas.height);
    }
    
    // Public API
    addToLayer(layerName, renderable) {
        if (!this.layers[layerName]) {
            this.layers[layerName] = [];
        }
        this.layers[layerName].push(renderable);
    }
    
    removeFromLayer(layerName, renderable) {
        if (this.layers[layerName]) {
            const index = this.layers[layerName].indexOf(renderable);
            if (index > -1) {
                this.layers[layerName].splice(index, 1);
            }
        }
    }
    
    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName] = [];
        }
    }
    
    setCamera(x, y, zoom = 1, rotation = 0) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.zoom = zoom;
        this.camera.rotation = rotation;
    }
    
    setCameraTarget(target) {
        this.camera.target = target;
    }
    
    setCameraBounds(left, top, right, bottom) {
        this.camera.bounds = { left, top, right, bottom };
    }
    
    shakeCamera(intensity, duration) {
        this.camera.shake.intensity = intensity;
        this.camera.shake.duration = duration;
    }
    
    addLight(id, x, y, radius, color, intensity = 1) {
        this.lighting.lights.set(id, {
            x, y, radius, color, intensity
        });
    }
    
    removeLight(id) {
        this.lighting.lights.delete(id);
    }
    
    updateLight(id, properties) {
        const light = this.lighting.lights.get(id);
        if (light) {
            Object.assign(light, properties);
        }
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX + this.camera.x) / this.camera.zoom,
            y: (screenY + this.camera.y) / this.camera.zoom
        };
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX * this.camera.zoom) - this.camera.x,
            y: (worldY * this.camera.zoom) - this.camera.y
        };
    }
    
    applySetting(key, value) {
        this.settings[key] = value;
        
        // Apply setting-specific changes
        switch (key) {
            case 'quality':
                this.updateQuality(value);
                break;
            case 'antialiasing':
                this.ctx.imageSmoothingEnabled = value;
                break;
            case 'lighting':
                this.lighting.enabled = value;
                break;
            case 'particleEffects':
                this.settings.particleEffects = value;
                break;
        }
    }
    
    updateQuality(quality) {
        switch (quality) {
            case 'low':
                this.settings.shadows = false;
                this.settings.lighting = false;
                this.settings.particleEffects = false;
                this.settings.postProcessing = false;
                break;
            case 'medium':
                this.settings.shadows = true;
                this.settings.lighting = false;
                this.settings.particleEffects = true;
                this.settings.postProcessing = false;
                break;
            case 'high':
                this.settings.shadows = true;
                this.settings.lighting = true;
                this.settings.particleEffects = true;
                this.settings.postProcessing = true;
                break;
        }
    }
    
    onResize(width, height) {
        // Update off-screen canvases
        this.shadowCanvas.width = width / 2;
        this.shadowCanvas.height = height / 2;
        this.lightCanvas.width = width;
        this.lightCanvas.height = height;
        this.postCanvas.width = width;
        this.postCanvas.height = height;
    }
    
    getPerformanceInfo() {
        return {
            drawCalls: this.performance.drawCalls,
            triangles: this.performance.triangles,
            frameTime: this.performance.lastFrameTime.toFixed(2) + 'ms'
        };
    }
    
    destroy() {
        // Clear all layers
        for (let layerName in this.layers) {
            this.layers[layerName] = [];
        }
        
        // Clear assets
        this.assets.textures.clear();
        this.assets.sprites.clear();
        this.assets.animations.clear();
        
        // Clear lighting
        this.lighting.lights.clear();
        
        console.log('🎨 Graphics system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Graphics = AmongUsV3Graphics;