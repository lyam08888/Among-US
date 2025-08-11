// Among Us V3 - Animation System
class AmongUsV3Animations {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Animation state
        this.animations = new Map();
        this.activeAnimations = new Map();
        this.animationQueue = [];
        
        // Animation types
        this.animationTypes = {
            MOVEMENT: 'movement',
            ROTATION: 'rotation',
            SCALE: 'scale',
            OPACITY: 'opacity',
            COLOR: 'color',
            SPRITE: 'sprite',
            PARTICLE: 'particle',
            UI: 'ui'
        };
        
        // Easing functions
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
            easeOutSine: t => Math.sin(t * Math.PI / 2),
            easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
            easeInBounce: t => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: t => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            },
            easeInOutBounce: t => t < 0.5 ? 
                this.easingFunctions.easeInBounce(t * 2) * 0.5 : 
                this.easingFunctions.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
        };
        
        // Predefined animations
        this.presetAnimations = new Map();
        
        console.log('🎬 Animation system created');
    }
    
    async initialize() {
        try {
            // Initialize preset animations
            this.initializePresetAnimations();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('🎬 Animation system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize animations:', error);
        }
    }
    
    initializePresetAnimations() {
        // Player movement animations
        this.presetAnimations.set('playerWalk', {
            type: this.animationTypes.SPRITE,
            duration: 800,
            frames: [0, 1, 2, 1],
            loop: true,
            easing: 'linear'
        });
        
        this.presetAnimations.set('playerIdle', {
            type: this.animationTypes.SPRITE,
            duration: 2000,
            frames: [0],
            loop: true,
            easing: 'linear'
        });
        
        this.presetAnimations.set('playerDeath', {
            type: this.animationTypes.SPRITE,
            duration: 1000,
            frames: [3, 4, 5],
            loop: false,
            easing: 'easeOutQuad'
        });
        
        // Task animations
        this.presetAnimations.set('taskComplete', {
            type: this.animationTypes.SCALE,
            duration: 500,
            from: { scale: 1.0 },
            to: { scale: 1.2 },
            loop: false,
            easing: 'easeOutBounce',
            yoyo: true
        });
        
        this.presetAnimations.set('taskProgress', {
            type: this.animationTypes.OPACITY,
            duration: 300,
            from: { opacity: 0.5 },
            to: { opacity: 1.0 },
            loop: false,
            easing: 'easeInOutQuad'
        });
        
        // UI animations
        this.presetAnimations.set('buttonHover', {
            type: this.animationTypes.SCALE,
            duration: 200,
            from: { scale: 1.0 },
            to: { scale: 1.05 },
            loop: false,
            easing: 'easeOutQuad'
        });
        
        this.presetAnimations.set('buttonClick', {
            type: this.animationTypes.SCALE,
            duration: 150,
            from: { scale: 1.0 },
            to: { scale: 0.95 },
            loop: false,
            easing: 'easeInQuad',
            yoyo: true
        });
        
        this.presetAnimations.set('fadeIn', {
            type: this.animationTypes.OPACITY,
            duration: 500,
            from: { opacity: 0 },
            to: { opacity: 1 },
            loop: false,
            easing: 'easeOutQuad'
        });
        
        this.presetAnimations.set('fadeOut', {
            type: this.animationTypes.OPACITY,
            duration: 300,
            from: { opacity: 1 },
            to: { opacity: 0 },
            loop: false,
            easing: 'easeInQuad'
        });
        
        this.presetAnimations.set('slideInLeft', {
            type: this.animationTypes.MOVEMENT,
            duration: 400,
            from: { x: -100 },
            to: { x: 0 },
            loop: false,
            easing: 'easeOutCubic'
        });
        
        this.presetAnimations.set('slideInRight', {
            type: this.animationTypes.MOVEMENT,
            duration: 400,
            from: { x: 100 },
            to: { x: 0 },
            loop: false,
            easing: 'easeOutCubic'
        });
        
        // Game-specific animations
        this.presetAnimations.set('emergencyMeeting', {
            type: this.animationTypes.SCALE,
            duration: 1000,
            from: { scale: 0 },
            to: { scale: 1 },
            loop: false,
            easing: 'easeOutBounce'
        });
        
        this.presetAnimations.set('playerKill', {
            type: this.animationTypes.ROTATION,
            duration: 800,
            from: { rotation: 0 },
            to: { rotation: 360 },
            loop: false,
            easing: 'easeInQuart'
        });
        
        this.presetAnimations.set('sabotageAlert', {
            type: this.animationTypes.COLOR,
            duration: 500,
            from: { color: '#ffffff' },
            to: { color: '#ff0000' },
            loop: true,
            easing: 'easeInOutSine',
            yoyo: true
        });
        
        // Particle animations
        this.presetAnimations.set('sparkle', {
            type: this.animationTypes.PARTICLE,
            duration: 1500,
            particleCount: 20,
            spread: 45,
            velocity: { min: 50, max: 150 },
            gravity: 200,
            loop: false,
            easing: 'easeOutQuad'
        });
        
        this.presetAnimations.set('explosion', {
            type: this.animationTypes.PARTICLE,
            duration: 1000,
            particleCount: 50,
            spread: 360,
            velocity: { min: 100, max: 300 },
            gravity: 150,
            loop: false,
            easing: 'easeOutCubic'
        });
    }
    
    setupEventHandlers() {
        // Listen to game events for automatic animations
        this.engine.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.engine.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.engine.on('playerKilled', this.handlePlayerKilled.bind(this));
        this.engine.on('emergencyMeeting', this.handleEmergencyMeeting.bind(this));
        this.engine.on('sabotageTriggered', this.handleSabotageTriggered.bind(this));
        this.engine.on('gameStarted', this.handleGameStarted.bind(this));
        this.engine.on('gameEnded', this.handleGameEnded.bind(this));
    }
    
    // Animation creation and management
    createAnimation(target, animationData) {
        const animationId = this.generateAnimationId();
        
        const animation = {
            id: animationId,
            target: target,
            type: animationData.type || this.animationTypes.MOVEMENT,
            duration: animationData.duration || 1000,
            startTime: Date.now(),
            currentTime: 0,
            progress: 0,
            from: animationData.from || {},
            to: animationData.to || {},
            easing: animationData.easing || 'linear',
            loop: animationData.loop || false,
            yoyo: animationData.yoyo || false,
            delay: animationData.delay || 0,
            onStart: animationData.onStart || null,
            onUpdate: animationData.onUpdate || null,
            onComplete: animationData.onComplete || null,
            isActive: false,
            isReversed: false,
            loopCount: 0,
            maxLoops: animationData.maxLoops || Infinity
        };
        
        // Handle sprite animations
        if (animation.type === this.animationTypes.SPRITE) {
            animation.frames = animationData.frames || [0];
            animation.currentFrame = 0;
            animation.frameTime = animation.duration / animation.frames.length;
            animation.lastFrameTime = 0;
        }
        
        // Handle particle animations
        if (animation.type === this.animationTypes.PARTICLE) {
            animation.particles = this.createParticles(animationData);
        }
        
        this.animations.set(animationId, animation);
        
        // Add to queue if there's a delay
        if (animation.delay > 0) {
            setTimeout(() => {
                this.startAnimation(animationId);
            }, animation.delay);
        } else {
            this.startAnimation(animationId);
        }
        
        return animationId;
    }
    
    startAnimation(animationId) {
        const animation = this.animations.get(animationId);
        if (!animation) return;
        
        animation.isActive = true;
        animation.startTime = Date.now();
        this.activeAnimations.set(animationId, animation);
        
        if (animation.onStart) {
            animation.onStart(animation);
        }
        
        console.log(`🎬 Started animation: ${animationId}`);
    }
    
    stopAnimation(animationId) {
        const animation = this.animations.get(animationId);
        if (!animation) return;
        
        animation.isActive = false;
        this.activeAnimations.delete(animationId);
        
        if (animation.onComplete) {
            animation.onComplete(animation);
        }
        
        console.log(`🎬 Stopped animation: ${animationId}`);
    }
    
    pauseAnimation(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.isActive = false;
        }
    }
    
    resumeAnimation(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.isActive = true;
            animation.startTime = Date.now() - animation.currentTime;
        }
    }
    
    // Preset animation shortcuts
    playPresetAnimation(target, presetName, options = {}) {
        const preset = this.presetAnimations.get(presetName);
        if (!preset) {
            console.warn(`Unknown preset animation: ${presetName}`);
            return null;
        }
        
        const animationData = { ...preset, ...options };
        return this.createAnimation(target, animationData);
    }
    
    // Animation update loop
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        const currentTime = Date.now();
        
        // Update all active animations
        for (let [id, animation] of this.activeAnimations) {
            if (!animation.isActive) continue;
            
            animation.currentTime = currentTime - animation.startTime;
            animation.progress = Math.min(animation.currentTime / animation.duration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(animation.progress, animation.easing);
            
            // Update animation based on type
            this.updateAnimationByType(animation, easedProgress);
            
            // Call update callback
            if (animation.onUpdate) {
                animation.onUpdate(animation, easedProgress);
            }
            
            // Check if animation is complete
            if (animation.progress >= 1) {
                this.handleAnimationComplete(animation);
            }
        }
    }
    
    updateAnimationByType(animation, progress) {
        switch (animation.type) {
            case this.animationTypes.MOVEMENT:
                this.updateMovementAnimation(animation, progress);
                break;
            case this.animationTypes.ROTATION:
                this.updateRotationAnimation(animation, progress);
                break;
            case this.animationTypes.SCALE:
                this.updateScaleAnimation(animation, progress);
                break;
            case this.animationTypes.OPACITY:
                this.updateOpacityAnimation(animation, progress);
                break;
            case this.animationTypes.COLOR:
                this.updateColorAnimation(animation, progress);
                break;
            case this.animationTypes.SPRITE:
                this.updateSpriteAnimation(animation, progress);
                break;
            case this.animationTypes.PARTICLE:
                this.updateParticleAnimation(animation, progress);
                break;
            case this.animationTypes.UI:
                this.updateUIAnimation(animation, progress);
                break;
        }
    }
    
    updateMovementAnimation(animation, progress) {
        const target = animation.target;
        const from = animation.from;
        const to = animation.to;
        
        if (target && target.position) {
            if (from.x !== undefined && to.x !== undefined) {
                target.position.x = this.lerp(from.x, to.x, progress);
            }
            if (from.y !== undefined && to.y !== undefined) {
                target.position.y = this.lerp(from.y, to.y, progress);
            }
        }
    }
    
    updateRotationAnimation(animation, progress) {
        const target = animation.target;
        const from = animation.from;
        const to = animation.to;
        
        if (target && from.rotation !== undefined && to.rotation !== undefined) {
            target.rotation = this.lerp(from.rotation, to.rotation, progress);
        }
    }
    
    updateScaleAnimation(animation, progress) {
        const target = animation.target;
        const from = animation.from;
        const to = animation.to;
        
        if (target && from.scale !== undefined && to.scale !== undefined) {
            target.scale = this.lerp(from.scale, to.scale, progress);
        }
    }
    
    updateOpacityAnimation(animation, progress) {
        const target = animation.target;
        const from = animation.from;
        const to = animation.to;
        
        if (target && from.opacity !== undefined && to.opacity !== undefined) {
            target.opacity = this.lerp(from.opacity, to.opacity, progress);
        }
    }
    
    updateColorAnimation(animation, progress) {
        const target = animation.target;
        const from = animation.from;
        const to = animation.to;
        
        if (target && from.color && to.color) {
            target.color = this.lerpColor(from.color, to.color, progress);
        }
    }
    
    updateSpriteAnimation(animation, progress) {
        const target = animation.target;
        const currentTime = Date.now();
        
        if (currentTime - animation.lastFrameTime >= animation.frameTime) {
            animation.currentFrame = (animation.currentFrame + 1) % animation.frames.length;
            animation.lastFrameTime = currentTime;
            
            if (target && target.setFrame) {
                target.setFrame(animation.frames[animation.currentFrame]);
            }
        }
    }
    
    updateParticleAnimation(animation, progress) {
        if (!animation.particles) return;
        
        animation.particles.forEach(particle => {
            // Update particle position
            particle.x += particle.velocityX * (1/60); // Assuming 60 FPS
            particle.y += particle.velocityY * (1/60);
            
            // Apply gravity
            particle.velocityY += animation.gravity || 0;
            
            // Update opacity
            particle.opacity = 1 - progress;
            
            // Update scale
            particle.scale = 1 - (progress * 0.5);
        });
    }
    
    updateUIAnimation(animation, progress) {
        const target = animation.target;
        
        if (target && target.style) {
            // Update CSS properties
            Object.keys(animation.to).forEach(property => {
                const fromValue = animation.from[property] || 0;
                const toValue = animation.to[property];
                const currentValue = this.lerp(fromValue, toValue, progress);
                
                switch (property) {
                    case 'opacity':
                        target.style.opacity = currentValue;
                        break;
                    case 'scale':
                        target.style.transform = `scale(${currentValue})`;
                        break;
                    case 'x':
                        target.style.transform = `translateX(${currentValue}px)`;
                        break;
                    case 'y':
                        target.style.transform = `translateY(${currentValue}px)`;
                        break;
                    case 'rotation':
                        target.style.transform = `rotate(${currentValue}deg)`;
                        break;
                }
            });
        }
    }
    
    handleAnimationComplete(animation) {
        if (animation.yoyo && !animation.isReversed) {
            // Reverse the animation
            const temp = animation.from;
            animation.from = animation.to;
            animation.to = temp;
            animation.isReversed = true;
            animation.startTime = Date.now();
            animation.currentTime = 0;
            animation.progress = 0;
            return;
        }
        
        if (animation.loop && animation.loopCount < animation.maxLoops) {
            // Restart the animation
            animation.loopCount++;
            animation.startTime = Date.now();
            animation.currentTime = 0;
            animation.progress = 0;
            
            if (animation.yoyo && animation.isReversed) {
                // Reset yoyo state
                const temp = animation.from;
                animation.from = animation.to;
                animation.to = temp;
                animation.isReversed = false;
            }
            return;
        }
        
        // Animation is complete
        this.stopAnimation(animation.id);
    }
    
    // Event handlers
    handlePlayerMoved(data) {
        const { player } = data;
        // Automatically play walk animation when player moves
        this.playPresetAnimation(player, 'playerWalk');
    }
    
    handleTaskCompleted(data) {
        const { player, task } = data;
        // Play task completion animation
        this.playPresetAnimation(task, 'taskComplete');
        this.playPresetAnimation(task, 'sparkle');
    }
    
    handlePlayerKilled(data) {
        const { victim } = data;
        // Play death animation
        this.playPresetAnimation(victim, 'playerDeath');
        this.playPresetAnimation(victim, 'explosion');
    }
    
    handleEmergencyMeeting(data) {
        // Play emergency meeting animation
        const meetingButton = document.getElementById('emergency-button');
        if (meetingButton) {
            this.playPresetAnimation(meetingButton, 'emergencyMeeting');
        }
    }
    
    handleSabotageTriggered(data) {
        // Play sabotage alert animation
        const alertElements = document.querySelectorAll('.sabotage-alert');
        alertElements.forEach(element => {
            this.playPresetAnimation(element, 'sabotageAlert');
        });
    }
    
    handleGameStarted(data) {
        // Play game start animations
        const gameElements = document.querySelectorAll('.game-ui-element');
        gameElements.forEach((element, index) => {
            setTimeout(() => {
                this.playPresetAnimation(element, 'fadeIn');
            }, index * 100);
        });
    }
    
    handleGameEnded(data) {
        // Play game end animations
        const gameElements = document.querySelectorAll('.game-ui-element');
        gameElements.forEach((element, index) => {
            setTimeout(() => {
                this.playPresetAnimation(element, 'fadeOut');
            }, index * 50);
        });
    }
    
    // Utility methods
    applyEasing(t, easingName) {
        const easingFunction = this.easingFunctions[easingName];
        return easingFunction ? easingFunction(t) : t;
    }
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    lerpColor(startColor, endColor, t) {
        // Simple color interpolation (assumes hex colors)
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        
        if (!start || !end) return startColor;
        
        const r = Math.round(this.lerp(start.r, end.r, t));
        const g = Math.round(this.lerp(start.g, end.g, t));
        const b = Math.round(this.lerp(start.b, end.b, t));
        
        return this.rgbToHex(r, g, b);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    createParticles(animationData) {
        const particles = [];
        const count = animationData.particleCount || 10;
        
        for (let i = 0; i < count; i++) {
            const angle = (animationData.spread || 360) * (i / count) * (Math.PI / 180);
            const velocity = animationData.velocity || { min: 50, max: 100 };
            const speed = velocity.min + Math.random() * (velocity.max - velocity.min);
            
            particles.push({
                x: 0,
                y: 0,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                opacity: 1,
                scale: 1,
                color: animationData.particleColor || '#ffffff'
            });
        }
        
        return particles;
    }
    
    generateAnimationId() {
        return 'anim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public API methods
    fadeIn(target, duration = 500, easing = 'easeOutQuad') {
        return this.createAnimation(target, {
            type: this.animationTypes.OPACITY,
            duration,
            from: { opacity: 0 },
            to: { opacity: 1 },
            easing
        });
    }
    
    fadeOut(target, duration = 300, easing = 'easeInQuad') {
        return this.createAnimation(target, {
            type: this.animationTypes.OPACITY,
            duration,
            from: { opacity: 1 },
            to: { opacity: 0 },
            easing
        });
    }
    
    moveTo(target, x, y, duration = 1000, easing = 'easeInOutQuad') {
        const currentX = target.position ? target.position.x : 0;
        const currentY = target.position ? target.position.y : 0;
        
        return this.createAnimation(target, {
            type: this.animationTypes.MOVEMENT,
            duration,
            from: { x: currentX, y: currentY },
            to: { x, y },
            easing
        });
    }
    
    scaleTo(target, scale, duration = 500, easing = 'easeOutBounce') {
        const currentScale = target.scale || 1;
        
        return this.createAnimation(target, {
            type: this.animationTypes.SCALE,
            duration,
            from: { scale: currentScale },
            to: { scale },
            easing
        });
    }
    
    rotateTo(target, rotation, duration = 1000, easing = 'easeInOutQuad') {
        const currentRotation = target.rotation || 0;
        
        return this.createAnimation(target, {
            type: this.animationTypes.ROTATION,
            duration,
            from: { rotation: currentRotation },
            to: { rotation },
            easing
        });
    }
    
    // Cleanup
    destroy() {
        // Stop all animations
        for (let [id, animation] of this.activeAnimations) {
            this.stopAnimation(id);
        }
        
        this.animations.clear();
        this.activeAnimations.clear();
        this.animationQueue = [];
        this.presetAnimations.clear();
        
        this.isInitialized = false;
        console.log('🎬 Animation system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Animations = AmongUsV3Animations;