// Among Us V3 - Particle System
class AmongUsV3Particles {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Particle system state
        this.particleSystems = new Map();
        this.activeParticles = [];
        this.particlePool = [];
        this.maxParticles = 1000;
        
        // Particle types
        this.particleTypes = {
            SPARK: 'spark',
            SMOKE: 'smoke',
            EXPLOSION: 'explosion',
            BLOOD: 'blood',
            DUST: 'dust',
            ENERGY: 'energy',
            STAR: 'star',
            BUBBLE: 'bubble',
            FIRE: 'fire',
            SNOW: 'snow',
            RAIN: 'rain',
            MAGIC: 'magic'
        };
        
        // Preset particle configurations
        this.presetConfigs = new Map();
        
        // Performance settings
        this.performanceSettings = {
            maxParticlesPerSystem: 100,
            cullDistance: 1500,
            updateFrequency: 60, // FPS
            enablePooling: true,
            enableCulling: true
        };
        
        console.log('✨ Particle system created');
    }
    
    async initialize() {
        try {
            // Initialize particle pool
            this.initializeParticlePool();
            
            // Setup preset configurations
            this.initializePresetConfigs();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('✨ Particle system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize particle system:', error);
        }
    }
    
    initializeParticlePool() {
        // Pre-create particles for better performance
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createParticleObject());
        }
    }
    
    createParticleObject() {
        return {
            id: null,
            active: false,
            type: null,
            
            // Position and movement
            x: 0,
            y: 0,
            z: 0,
            velocityX: 0,
            velocityY: 0,
            velocityZ: 0,
            accelerationX: 0,
            accelerationY: 0,
            accelerationZ: 0,
            
            // Visual properties
            size: 1,
            scale: 1,
            rotation: 0,
            rotationSpeed: 0,
            opacity: 1,
            color: { r: 255, g: 255, b: 255, a: 1 },
            
            // Animation properties
            life: 1,
            maxLife: 1,
            age: 0,
            fadeIn: 0,
            fadeOut: 0,
            
            // Physics properties
            gravity: 0,
            friction: 0,
            bounce: 0,
            mass: 1,
            
            // Behavior properties
            followTarget: null,
            attractionForce: 0,
            repulsionForce: 0,
            
            // Rendering properties
            texture: null,
            blendMode: 'normal',
            zIndex: 0,
            
            // Custom properties
            customData: {}
        };
    }
    
    initializePresetConfigs() {
        // Task completion sparkles
        this.presetConfigs.set('taskComplete', {
            type: this.particleTypes.SPARK,
            count: 15,
            duration: 1500,
            position: { x: 0, y: 0, spread: 20 },
            velocity: { 
                x: { min: -50, max: 50 },
                y: { min: -100, max: -20 },
                z: { min: -10, max: 10 }
            },
            size: { min: 2, max: 6 },
            color: { r: 255, g: 215, b: 0, a: 1 },
            gravity: 200,
            friction: 0.98,
            fadeOut: 0.3,
            rotationSpeed: { min: -180, max: 180 }
        });
        
        // Player death explosion
        this.presetConfigs.set('playerDeath', {
            type: this.particleTypes.EXPLOSION,
            count: 25,
            duration: 2000,
            position: { x: 0, y: 0, spread: 10 },
            velocity: {
                x: { min: -150, max: 150 },
                y: { min: -150, max: 150 },
                z: { min: -50, max: 50 }
            },
            size: { min: 3, max: 8 },
            color: { r: 255, g: 0, b: 0, a: 1 },
            gravity: 100,
            friction: 0.95,
            fadeOut: 0.4,
            bounce: 0.3
        });
        
        // Emergency meeting effect
        this.presetConfigs.set('emergencyMeeting', {
            type: this.particleTypes.ENERGY,
            count: 30,
            duration: 3000,
            position: { x: 0, y: 0, spread: 50 },
            velocity: {
                x: { min: -30, max: 30 },
                y: { min: -30, max: 30 },
                z: { min: -20, max: 20 }
            },
            size: { min: 4, max: 10 },
            color: { r: 255, g: 255, b: 0, a: 0.8 },
            gravity: -50, // Negative gravity for upward movement
            friction: 0.99,
            fadeIn: 0.2,
            fadeOut: 0.5,
            rotationSpeed: { min: -90, max: 90 }
        });
        
        // Sabotage warning particles
        this.presetConfigs.set('sabotageWarning', {
            type: this.particleTypes.FIRE,
            count: 20,
            duration: 2500,
            position: { x: 0, y: 0, spread: 30 },
            velocity: {
                x: { min: -20, max: 20 },
                y: { min: -50, max: -10 },
                z: { min: -10, max: 10 }
            },
            size: { min: 3, max: 7 },
            color: { r: 255, g: 100, b: 0, a: 0.9 },
            gravity: -30,
            friction: 0.97,
            fadeOut: 0.6,
            rotationSpeed: { min: -45, max: 45 }
        });
        
        // Vent particles
        this.presetConfigs.set('ventSmoke', {
            type: this.particleTypes.SMOKE,
            count: 12,
            duration: 3000,
            position: { x: 0, y: 0, spread: 15 },
            velocity: {
                x: { min: -10, max: 10 },
                y: { min: -30, max: -5 },
                z: { min: -5, max: 5 }
            },
            size: { min: 5, max: 12 },
            color: { r: 100, g: 100, b: 100, a: 0.6 },
            gravity: -20,
            friction: 0.99,
            fadeIn: 0.3,
            fadeOut: 0.7,
            rotationSpeed: { min: -30, max: 30 }
        });
        
        // Walking dust
        this.presetConfigs.set('walkingDust', {
            type: this.particleTypes.DUST,
            count: 3,
            duration: 800,
            position: { x: 0, y: 0, spread: 8 },
            velocity: {
                x: { min: -20, max: 20 },
                y: { min: 5, max: 15 },
                z: { min: -2, max: 2 }
            },
            size: { min: 1, max: 3 },
            color: { r: 150, g: 150, b: 150, a: 0.4 },
            gravity: 50,
            friction: 0.95,
            fadeOut: 0.8
        });
        
        // Button click effect
        this.presetConfigs.set('buttonClick', {
            type: this.particleTypes.STAR,
            count: 8,
            duration: 600,
            position: { x: 0, y: 0, spread: 25 },
            velocity: {
                x: { min: -40, max: 40 },
                y: { min: -40, max: 40 },
                z: { min: -10, max: 10 }
            },
            size: { min: 2, max: 5 },
            color: { r: 0, g: 150, b: 255, a: 0.8 },
            gravity: 0,
            friction: 0.96,
            fadeOut: 0.5,
            rotationSpeed: { min: -180, max: 180 }
        });
        
        // Ambient space particles
        this.presetConfigs.set('spaceAmbient', {
            type: this.particleTypes.STAR,
            count: 50,
            duration: 10000,
            position: { x: 0, y: 0, spread: 500 },
            velocity: {
                x: { min: -5, max: 5 },
                y: { min: -5, max: 5 },
                z: { min: -2, max: 2 }
            },
            size: { min: 1, max: 3 },
            color: { r: 255, g: 255, b: 255, a: 0.6 },
            gravity: 0,
            friction: 1,
            fadeIn: 2,
            fadeOut: 2,
            rotationSpeed: { min: -10, max: 10 }
        });
    }
    
    setupEventHandlers() {
        // Listen to game events for automatic particle effects
        this.engine.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.engine.on('playerKilled', this.handlePlayerKilled.bind(this));
        this.engine.on('emergencyMeeting', this.handleEmergencyMeeting.bind(this));
        this.engine.on('sabotageTriggered', this.handleSabotageTriggered.bind(this));
        this.engine.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.engine.on('buttonClicked', this.handleButtonClicked.bind(this));
        this.engine.on('ventUsed', this.handleVentUsed.bind(this));
    }
    
    // Particle system creation and management
    createParticleSystem(name, config, position = { x: 0, y: 0, z: 0 }) {
        const systemId = this.generateSystemId();
        
        const system = {
            id: systemId,
            name: name,
            config: config,
            position: { ...position },
            particles: [],
            isActive: true,
            startTime: Date.now(),
            duration: config.duration || 1000,
            emissionRate: config.emissionRate || 0, // 0 means burst emission
            lastEmissionTime: 0,
            particlesEmitted: 0,
            maxParticles: config.count || 10
        };
        
        this.particleSystems.set(systemId, system);
        
        // Emit particles immediately if burst mode
        if (system.emissionRate === 0) {
            this.emitParticles(system, system.maxParticles);
        }
        
        console.log(`✨ Created particle system: ${name} (${systemId})`);
        return systemId;
    }
    
    createParticleEffect(presetName, position = { x: 0, y: 0, z: 0 }) {
        const config = this.presetConfigs.get(presetName);
        if (!config) {
            console.warn(`Unknown particle preset: ${presetName}`);
            return null;
        }
        
        return this.createParticleSystem(presetName, config, position);
    }
    
    emitParticles(system, count) {
        for (let i = 0; i < count && system.particles.length < system.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            this.initializeParticle(particle, system);
            system.particles.push(particle);
            this.activeParticles.push(particle);
        }
        
        system.particlesEmitted += count;
    }
    
    getParticleFromPool() {
        if (!this.performanceSettings.enablePooling) {
            return this.createParticleObject();
        }
        
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        
        // Pool is full, create new particle if under limit
        if (this.activeParticles.length < this.maxParticles) {
            const newParticle = this.createParticleObject();
            this.particlePool.push(newParticle);
            newParticle.active = true;
            return newParticle;
        }
        
        return null;
    }
    
    returnParticleToPool(particle) {
        particle.active = false;
        particle.id = null;
        particle.customData = {};
        
        // Remove from active particles
        const index = this.activeParticles.indexOf(particle);
        if (index > -1) {
            this.activeParticles.splice(index, 1);
        }
    }
    
    initializeParticle(particle, system) {
        const config = system.config;
        
        // Generate unique ID
        particle.id = this.generateParticleId();
        particle.type = config.type;
        
        // Set position with spread
        const spread = config.position.spread || 0;
        particle.x = system.position.x + (Math.random() - 0.5) * spread;
        particle.y = system.position.y + (Math.random() - 0.5) * spread;
        particle.z = system.position.z + (Math.random() - 0.5) * (spread * 0.5);
        
        // Set velocity
        if (config.velocity) {
            particle.velocityX = this.randomBetween(config.velocity.x.min, config.velocity.x.max);
            particle.velocityY = this.randomBetween(config.velocity.y.min, config.velocity.y.max);
            particle.velocityZ = config.velocity.z ? 
                this.randomBetween(config.velocity.z.min, config.velocity.z.max) : 0;
        }
        
        // Set size
        if (config.size) {
            particle.size = typeof config.size === 'object' ? 
                this.randomBetween(config.size.min, config.size.max) : config.size;
        }
        
        // Set color
        if (config.color) {
            particle.color = { ...config.color };
        }
        
        // Set physics properties
        particle.gravity = config.gravity || 0;
        particle.friction = config.friction || 1;
        particle.bounce = config.bounce || 0;
        particle.mass = config.mass || 1;
        
        // Set life properties
        particle.maxLife = config.duration || 1000;
        particle.life = particle.maxLife;
        particle.age = 0;
        particle.fadeIn = config.fadeIn || 0;
        particle.fadeOut = config.fadeOut || 0;
        
        // Set rotation
        particle.rotation = Math.random() * 360;
        if (config.rotationSpeed) {
            particle.rotationSpeed = typeof config.rotationSpeed === 'object' ?
                this.randomBetween(config.rotationSpeed.min, config.rotationSpeed.max) : 
                config.rotationSpeed;
        }
        
        // Set rendering properties
        particle.blendMode = config.blendMode || 'normal';
        particle.zIndex = config.zIndex || 0;
        
        // Initialize opacity
        particle.opacity = 1;
        if (particle.fadeIn > 0) {
            particle.opacity = 0;
        }
    }
    
    // Update loop
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        const currentTime = Date.now();
        
        // Update particle systems
        for (let [id, system] of this.particleSystems) {
            this.updateParticleSystem(system, deltaTime, currentTime);
        }
        
        // Update individual particles
        this.updateParticles(deltaTime);
        
        // Clean up dead particles and systems
        this.cleanupDeadParticles();
        this.cleanupDeadSystems(currentTime);
        
        // Performance culling
        if (this.performanceSettings.enableCulling) {
            this.cullDistantParticles();
        }
    }
    
    updateParticleSystem(system, deltaTime, currentTime) {
        if (!system.isActive) return;
        
        // Check if system should emit more particles
        if (system.emissionRate > 0) {
            const timeSinceLastEmission = currentTime - system.lastEmissionTime;
            const emissionInterval = 1000 / system.emissionRate;
            
            if (timeSinceLastEmission >= emissionInterval && 
                system.particlesEmitted < system.maxParticles) {
                
                this.emitParticles(system, 1);
                system.lastEmissionTime = currentTime;
            }
        }
        
        // Check if system duration has expired
        if (currentTime - system.startTime >= system.duration) {
            system.isActive = false;
        }
    }
    
    updateParticles(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        for (let particle of this.activeParticles) {
            if (!particle.active) continue;
            
            // Update age and life
            particle.age += deltaTime;
            particle.life = particle.maxLife - particle.age;
            
            // Check if particle is dead
            if (particle.life <= 0) {
                this.returnParticleToPool(particle);
                continue;
            }
            
            // Update position
            particle.x += particle.velocityX * dt;
            particle.y += particle.velocityY * dt;
            particle.z += particle.velocityZ * dt;
            
            // Apply gravity
            particle.velocityY += particle.gravity * dt;
            
            // Apply friction
            particle.velocityX *= particle.friction;
            particle.velocityY *= particle.friction;
            particle.velocityZ *= particle.friction;
            
            // Update rotation
            particle.rotation += particle.rotationSpeed * dt;
            
            // Update opacity based on fade settings
            this.updateParticleOpacity(particle);
            
            // Update scale based on life
            this.updateParticleScale(particle);
            
            // Apply custom behaviors
            this.applyParticleBehaviors(particle, dt);
        }
    }
    
    updateParticleOpacity(particle) {
        const lifeRatio = particle.life / particle.maxLife;
        const ageRatio = particle.age / particle.maxLife;
        
        let opacity = 1;
        
        // Fade in
        if (particle.fadeIn > 0 && ageRatio < particle.fadeIn) {
            opacity = ageRatio / particle.fadeIn;
        }
        
        // Fade out
        if (particle.fadeOut > 0 && lifeRatio < particle.fadeOut) {
            opacity = Math.min(opacity, lifeRatio / particle.fadeOut);
        }
        
        particle.opacity = Math.max(0, Math.min(1, opacity));
    }
    
    updateParticleScale(particle) {
        const lifeRatio = particle.life / particle.maxLife;
        
        // Scale based on particle type
        switch (particle.type) {
            case this.particleTypes.EXPLOSION:
                particle.scale = 1 + (1 - lifeRatio) * 0.5;
                break;
            case this.particleTypes.SMOKE:
                particle.scale = 1 + (1 - lifeRatio) * 2;
                break;
            case this.particleTypes.SPARK:
                particle.scale = lifeRatio;
                break;
            default:
                particle.scale = 1;
        }
    }
    
    applyParticleBehaviors(particle, dt) {
        // Follow target behavior
        if (particle.followTarget) {
            const dx = particle.followTarget.x - particle.x;
            const dy = particle.followTarget.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const force = particle.attractionForce / distance;
                particle.velocityX += (dx / distance) * force * dt;
                particle.velocityY += (dy / distance) * force * dt;
            }
        }
        
        // Boundary collision
        this.handleParticleBoundaryCollision(particle);
    }
    
    handleParticleBoundaryCollision(particle) {
        // Simple boundary bouncing (assuming screen bounds)
        const bounds = {
            left: 0,
            right: 1920,
            top: 0,
            bottom: 1080
        };
        
        if (particle.bounce > 0) {
            if (particle.x < bounds.left || particle.x > bounds.right) {
                particle.velocityX *= -particle.bounce;
                particle.x = Math.max(bounds.left, Math.min(bounds.right, particle.x));
            }
            
            if (particle.y < bounds.top || particle.y > bounds.bottom) {
                particle.velocityY *= -particle.bounce;
                particle.y = Math.max(bounds.top, Math.min(bounds.bottom, particle.y));
            }
        }
    }
    
    cleanupDeadParticles() {
        // Remove dead particles from systems
        for (let [id, system] of this.particleSystems) {
            system.particles = system.particles.filter(particle => particle.active);
        }
    }
    
    cleanupDeadSystems(currentTime) {
        const systemsToRemove = [];
        
        for (let [id, system] of this.particleSystems) {
            // Remove system if it's inactive and has no particles
            if (!system.isActive && system.particles.length === 0) {
                systemsToRemove.push(id);
            }
        }
        
        systemsToRemove.forEach(id => {
            this.particleSystems.delete(id);
            console.log(`✨ Removed particle system: ${id}`);
        });
    }
    
    cullDistantParticles() {
        // Remove particles that are too far from the camera/view
        const viewCenter = { x: 960, y: 540 }; // Assuming center of screen
        const cullDistance = this.performanceSettings.cullDistance;
        
        for (let particle of this.activeParticles) {
            if (!particle.active) continue;
            
            const dx = particle.x - viewCenter.x;
            const dy = particle.y - viewCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > cullDistance) {
                this.returnParticleToPool(particle);
            }
        }
    }
    
    // Rendering
    render(ctx) {
        if (!this.isInitialized) return;
        
        // Sort particles by z-index for proper layering
        const sortedParticles = [...this.activeParticles].sort((a, b) => a.zIndex - b.zIndex);
        
        for (let particle of sortedParticles) {
            if (!particle.active || particle.opacity <= 0) continue;
            
            this.renderParticle(ctx, particle);
        }
    }
    
    renderParticle(ctx, particle) {
        ctx.save();
        
        // Set global alpha
        ctx.globalAlpha = particle.opacity;
        
        // Set blend mode
        ctx.globalCompositeOperation = particle.blendMode;
        
        // Transform to particle position
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.scale(particle.scale, particle.scale);
        
        // Set color
        const color = particle.color;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        
        // Render based on particle type
        this.renderParticleByType(ctx, particle);
        
        ctx.restore();
    }
    
    renderParticleByType(ctx, particle) {
        const size = particle.size;
        
        switch (particle.type) {
            case this.particleTypes.SPARK:
                this.renderSpark(ctx, size);
                break;
            case this.particleTypes.SMOKE:
                this.renderSmoke(ctx, size);
                break;
            case this.particleTypes.EXPLOSION:
                this.renderExplosion(ctx, size);
                break;
            case this.particleTypes.BLOOD:
                this.renderBlood(ctx, size);
                break;
            case this.particleTypes.DUST:
                this.renderDust(ctx, size);
                break;
            case this.particleTypes.ENERGY:
                this.renderEnergy(ctx, size);
                break;
            case this.particleTypes.STAR:
                this.renderStar(ctx, size);
                break;
            case this.particleTypes.BUBBLE:
                this.renderBubble(ctx, size);
                break;
            case this.particleTypes.FIRE:
                this.renderFire(ctx, size);
                break;
            default:
                this.renderDefault(ctx, size);
        }
    }
    
    renderSpark(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = size * 2;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
    }
    
    renderSmoke(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderExplosion(ctx, size) {
        // Draw multiple overlapping circles for explosion effect
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, size * (1 - i * 0.3), 0, Math.PI * 2);
            ctx.globalAlpha *= 0.7;
            ctx.fill();
        }
    }
    
    renderBlood(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderDust(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderEnergy(ctx, size) {
        // Draw energy particle with inner glow
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.globalAlpha *= 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    
    renderStar(ctx, size) {
        // Draw 5-pointed star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 144 - 90) * Math.PI / 180;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    renderBubble(ctx, size) {
        // Draw bubble with highlight
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.beginPath();
        ctx.arc(-size * 0.3, -size * 0.3, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }
    
    renderFire(ctx, size) {
        // Draw flame-like shape
        ctx.beginPath();
        ctx.arc(0, size * 0.3, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderDefault(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Event handlers
    handleTaskCompleted(data) {
        const { player, task } = data;
        if (player && player.position) {
            this.createParticleEffect('taskComplete', player.position);
        }
    }
    
    handlePlayerKilled(data) {
        const { victim } = data;
        if (victim && victim.position) {
            this.createParticleEffect('playerDeath', victim.position);
        }
    }
    
    handleEmergencyMeeting(data) {
        // Create effect at emergency button location
        const buttonPosition = { x: 960, y: 540, z: 0 }; // Center of screen
        this.createParticleEffect('emergencyMeeting', buttonPosition);
    }
    
    handleSabotageTriggered(data) {
        const { location } = data;
        if (location) {
            this.createParticleEffect('sabotageWarning', location);
        }
    }
    
    handlePlayerMoved(data) {
        const { player } = data;
        if (player && player.position && player.isMoving) {
            // Create subtle dust particles when walking
            this.createParticleEffect('walkingDust', {
                x: player.position.x,
                y: player.position.y + 20, // Slightly below player
                z: 0
            });
        }
    }
    
    handleButtonClicked(data) {
        const { position } = data;
        if (position) {
            this.createParticleEffect('buttonClick', position);
        }
    }
    
    handleVentUsed(data) {
        const { position } = data;
        if (position) {
            this.createParticleEffect('ventSmoke', position);
        }
    }
    
    // Utility methods
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
    
    generateSystemId() {
        return 'psys_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateParticleId() {
        return 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public API methods
    stopParticleSystem(systemId) {
        const system = this.particleSystems.get(systemId);
        if (system) {
            system.isActive = false;
        }
    }
    
    removeParticleSystem(systemId) {
        const system = this.particleSystems.get(systemId);
        if (system) {
            // Return all particles to pool
            system.particles.forEach(particle => {
                this.returnParticleToPool(particle);
            });
            
            this.particleSystems.delete(systemId);
        }
    }
    
    setPerformanceSettings(settings) {
        Object.assign(this.performanceSettings, settings);
    }
    
    getActiveParticleCount() {
        return this.activeParticles.filter(p => p.active).length;
    }
    
    getSystemCount() {
        return this.particleSystems.size;
    }
    
    // Cleanup
    destroy() {
        // Stop all particle systems
        for (let [id, system] of this.particleSystems) {
            this.removeParticleSystem(id);
        }
        
        this.particleSystems.clear();
        this.activeParticles = [];
        this.particlePool = [];
        this.presetConfigs.clear();
        
        this.isInitialized = false;
        console.log('✨ Particle system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Particles = AmongUsV3Particles;