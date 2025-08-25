// Among Us V4 - Système d'Animations Avancé
console.log('🎬 Initializing Among Us Animation System...');

class AmongUsAnimations {
    constructor(renderer) {
        this.renderer = renderer;
        this.animations = new Map();
        this.effects = [];
        this.particleSystems = [];
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        console.log('🎬 Setting up animation system...');
        
        this.createPlayerAnimations();
        this.createEffectAnimations();
        this.createParticleSystems();
        
        console.log('✅ Animation system initialized');
    }
    
    createPlayerAnimations() {
        console.log('👤 Creating player animations...');
        
        // Animations de marche pour chaque couleur
        const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'cyan', 'lime', 'purple', 'black'];
        
        for (const color of colors) {
            this.animations.set(`walk_${color}`, {
                type: 'walk',
                color: color,
                frames: this.generateWalkFrames(color),
                duration: 800,
                loop: true,
                currentFrame: 0,
                lastUpdate: 0
            });
            
            this.animations.set(`idle_${color}`, {
                type: 'idle',
                color: color,
                frames: this.generateIdleFrames(color),
                duration: 2000,
                loop: true,
                currentFrame: 0,
                lastUpdate: 0
            });
            
            this.animations.set(`kill_${color}`, {
                type: 'kill',
                color: color,
                frames: this.generateKillFrames(color),
                duration: 1500,
                loop: false,
                currentFrame: 0,
                lastUpdate: 0
            });
            
            this.animations.set(`vent_${color}`, {
                type: 'vent',
                color: color,
                frames: this.generateVentFrames(color),
                duration: 1000,
                loop: false,
                currentFrame: 0,
                lastUpdate: 0
            });
        }
    }
    
    generateWalkFrames(color) {
        const baseColor = this.getPlayerColorHex(color);
        const frames = [];
        
        // 4 frames de marche
        for (let i = 0; i < 4; i++) {
            const offsetY = Math.sin(i * Math.PI / 2) * 3;
            const legOffset = Math.sin(i * Math.PI) * 2;
            
            frames.push({
                body: {
                    color: baseColor,
                    offsetY: offsetY,
                    scale: 1 + Math.sin(i * Math.PI / 4) * 0.05
                },
                legs: {
                    leftOffset: -legOffset,
                    rightOffset: legOffset
                },
                visor: {
                    reflection: 0.3 + Math.sin(i * Math.PI / 3) * 0.1
                }
            });
        }
        
        return frames;
    }
    
    generateIdleFrames(color) {
        const baseColor = this.getPlayerColorHex(color);
        const frames = [];
        
        // 6 frames d'idle avec respiration
        for (let i = 0; i < 6; i++) {
            const breathe = Math.sin(i * Math.PI / 3) * 2;
            
            frames.push({
                body: {
                    color: baseColor,
                    offsetY: breathe,
                    scale: 1 + breathe * 0.01
                },
                visor: {
                    reflection: 0.4 + Math.sin(i * Math.PI / 6) * 0.1
                },
                backpack: {
                    offsetY: breathe * 0.5
                }
            });
        }
        
        return frames;
    }
    
    generateKillFrames(color) {
        const baseColor = this.getPlayerColorHex(color);
        const frames = [];
        
        // Animation de kill/attaque
        for (let i = 0; i < 8; i++) {
            const progress = i / 7;
            const attackPhase = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;
            
            frames.push({
                body: {
                    color: baseColor,
                    scale: 1 + attackPhase * 0.3,
                    rotation: Math.sin(progress * Math.PI) * 15
                },
                arms: {
                    extended: attackPhase > 0.3,
                    angle: attackPhase * 45
                },
                eyes: {
                    angry: true,
                    glow: attackPhase * 0.5
                }
            });
        }
        
        return frames;
    }
    
    generateVentFrames(color) {
        const baseColor = this.getPlayerColorHex(color);
        const frames = [];
        
        // Animation d'entrée/sortie de vent
        for (let i = 0; i < 6; i++) {
            const progress = i / 5;
            const scale = 1 - progress * 0.8;
            const alpha = 1 - progress * 0.5;
            
            frames.push({
                body: {
                    color: baseColor,
                    scale: Math.max(scale, 0.2),
                    alpha: Math.max(alpha, 0.3),
                    blur: progress * 3
                },
                effect: {
                    particles: true,
                    swirl: progress * 360
                }
            });
        }
        
        return frames;
    }
    
    createEffectAnimations() {
        console.log('✨ Creating effect animations...');
        
        // Effets visuels
        this.animations.set('task_complete', {
            type: 'effect',
            frames: this.generateTaskCompleteFrames(),
            duration: 1000,
            loop: false
        });
        
        this.animations.set('emergency_flash', {
            type: 'effect',
            frames: this.generateEmergencyFlashFrames(),
            duration: 500,
            loop: true
        });
        
        this.animations.set('vent_smoke', {
            type: 'effect',
            frames: this.generateVentSmokeFrames(),
            duration: 800,
            loop: false
        });
        
        this.animations.set('sabotage_spark', {
            type: 'effect',
            frames: this.generateSabotageSparkFrames(),
            duration: 1200,
            loop: true
        });
    }
    
    generateTaskCompleteFrames() {
        const frames = [];
        
        for (let i = 0; i < 10; i++) {
            const progress = i / 9;
            const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
            const alpha = 1 - progress;
            
            frames.push({
                type: 'checkmark',
                scale: scale,
                alpha: alpha,
                color: `rgba(39, 174, 96, ${alpha})`,
                rotation: progress * 360,
                glow: Math.sin(progress * Math.PI) * 10
            });
        }
        
        return frames;
    }
    
    generateEmergencyFlashFrames() {
        const frames = [];
        
        for (let i = 0; i < 4; i++) {
            const intensity = Math.sin(i * Math.PI / 2);
            
            frames.push({
                type: 'screen_flash',
                color: `rgba(231, 76, 60, ${intensity * 0.3})`,
                intensity: intensity
            });
        }
        
        return frames;
    }
    
    generateVentSmokeFrames() {
        const frames = [];
        
        for (let i = 0; i < 8; i++) {
            const progress = i / 7;
            const scale = 1 + progress * 2;
            const alpha = 1 - progress;
            
            frames.push({
                type: 'smoke',
                scale: scale,
                alpha: alpha * 0.6,
                offsetY: -progress * 30,
                rotation: progress * 180
            });
        }
        
        return frames;
    }
    
    generateSabotageSparkFrames() {
        const frames = [];
        
        for (let i = 0; i < 6; i++) {
            const sparks = [];
            
            for (let j = 0; j < 5; j++) {
                sparks.push({
                    x: Math.random() * 40 - 20,
                    y: Math.random() * 40 - 20,
                    size: Math.random() * 3 + 1,
                    life: Math.random()
                });
            }
            
            frames.push({
                type: 'sparks',
                particles: sparks,
                color: '#f1c40f'
            });
        }
        
        return frames;
    }
    
    createParticleSystems() {
        console.log('💫 Creating particle systems...');
        
        // Système de particules pour différents effets
        this.particleSystems.push({
            name: 'steam',
            maxParticles: 20,
            particles: [],
            emissionRate: 5,
            lastEmission: 0
        });
        
        this.particleSystems.push({
            name: 'sparks',
            maxParticles: 15,
            particles: [],
            emissionRate: 8,
            lastEmission: 0
        });
        
        this.particleSystems.push({
            name: 'dust',
            maxParticles: 30,
            particles: [],
            emissionRate: 3,
            lastEmission: 0
        });
    }
    
    // Méthodes d'animation des joueurs
    animatePlayer(player, animationType, deltaTime) {
        if (!player || !animationType) return;
        
        const animKey = `${animationType}_${player.color || 'red'}`;
        const animation = this.animations.get(animKey);
        
        if (!animation) return;
        
        // Mettre à jour le frame de l'animation
        const now = Date.now();
        if (now - animation.lastUpdate > animation.duration / animation.frames.length) {
            animation.currentFrame = (animation.currentFrame + 1) % animation.frames.length;
            animation.lastUpdate = now;
            
            if (!animation.loop && animation.currentFrame === 0) {
                // Animation terminée
                return null;
            }
        }
        
        return animation.frames[animation.currentFrame];
    }
    
    drawAnimatedPlayer(ctx, player, x, y) {
        if (!ctx || !player) return;
        
        // Déterminer le type d'animation
        let animationType = 'idle';
        if (player.velocity && (Math.abs(player.velocity.x) > 10 || Math.abs(player.velocity.y) > 10)) {
            animationType = 'walk';
        }
        if (player.isKilling) {
            animationType = 'kill';
        }
        if (player.isVenting) {
            animationType = 'vent';
        }
        
        const animFrame = this.animatePlayer(player, animationType, 16);
        
        if (animFrame) {
            this.drawPlayerWithFrame(ctx, player, x, y, animFrame);
        } else {
            this.drawBasicPlayer(ctx, player, x, y);
        }
    }
    
    drawPlayerWithFrame(ctx, player, x, y, frame) {
        ctx.save();
        
        // Appliquer les transformations du frame
        ctx.translate(x, y);
        
        if (frame.body) {
            if (frame.body.rotation) {
                ctx.rotate(frame.body.rotation * Math.PI / 180);
            }
            if (frame.body.scale) {
                ctx.scale(frame.body.scale, frame.body.scale);
            }
            if (frame.body.alpha) {
                ctx.globalAlpha = frame.body.alpha;
            }
        }
        
        // Dessiner le corps principal
        this.drawPlayerBody(ctx, player, frame);
        
        // Dessiner les jambes si animées
        if (frame.legs) {
            this.drawAnimatedLegs(ctx, player, frame.legs);
        }
        
        // Dessiner les bras si animés
        if (frame.arms) {
            this.drawAnimatedArms(ctx, player, frame.arms);
        }
        
        // Dessiner la visière avec reflets
        if (frame.visor) {
            this.drawAnimatedVisor(ctx, player, frame.visor);
        }
        
        // Effets spéciaux
        if (frame.effect) {
            this.drawFrameEffects(ctx, frame.effect);
        }
        
        ctx.restore();
    }
    
    drawPlayerBody(ctx, player, frame) {
        const color = frame.body ? frame.body.color : this.getPlayerColorHex(player.color);
        const offsetY = frame.body ? (frame.body.offsetY || 0) : 0;
        
        // Corps principal (ellipse)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, offsetY, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ombre du corps
        ctx.fillStyle = this.darkenColor(color, 0.3);
        ctx.beginPath();
        ctx.ellipse(0, offsetY + 2, 18, 23, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Sac à dos
        ctx.fillStyle = this.darkenColor(color, 0.2);
        ctx.fillRect(-8, offsetY - 15, 16, 8);
        
        // Détails du sac
        ctx.fillStyle = this.darkenColor(color, 0.4);
        ctx.fillRect(-6, offsetY - 13, 3, 4);
        ctx.fillRect(3, offsetY - 13, 3, 4);
    }
    
    drawAnimatedLegs(ctx, player, legData) {
        const color = this.getPlayerColorHex(player.color);
        
        // Jambe gauche
        ctx.save();
        ctx.translate(legData.leftOffset || 0, 0);
        ctx.fillStyle = color;
        ctx.fillRect(-8, 20, 6, 12);
        ctx.restore();
        
        // Jambe droite
        ctx.save();
        ctx.translate(legData.rightOffset || 0, 0);
        ctx.fillStyle = color;
        ctx.fillRect(2, 20, 6, 12);
        ctx.restore();
    }
    
    drawAnimatedArms(ctx, player, armData) {
        const color = this.getPlayerColorHex(player.color);
        
        if (armData.extended) {
            ctx.save();
            ctx.rotate(armData.angle * Math.PI / 180);
            
            // Bras étendu
            ctx.fillStyle = color;
            ctx.fillRect(-25, -3, 20, 6);
            
            // Main/griffe
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.moveTo(-30, -3);
            ctx.lineTo(-35, -8);
            ctx.lineTo(-32, 0);
            ctx.lineTo(-35, 8);
            ctx.lineTo(-30, 3);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    drawAnimatedVisor(ctx, player, visorData) {
        const reflection = visorData.reflection || 0.3;
        
        // Visière principale
        ctx.fillStyle = '#87ceeb';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet animé
        ctx.fillStyle = `rgba(255, 255, 255, ${reflection})`;
        ctx.beginPath();
        ctx.ellipse(-5, -8, 8, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
    
    drawFrameEffects(ctx, effectData) {
        if (effectData.particles) {
            this.drawSwirl(ctx, effectData.swirl || 0);
        }
    }
    
    drawSwirl(ctx, rotation) {
        ctx.save();
        ctx.rotate(rotation * Math.PI / 180);
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 30;
            const y = Math.sin(angle) * 30;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - i * 0.03})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawBasicPlayer(ctx, player, x, y) {
        // Version basique sans animation
        ctx.save();
        ctx.translate(x, y);
        
        const color = this.getPlayerColorHex(player.color);
        
        // Corps
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Visière
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Effets visuels
    createEffect(type, x, y, duration = 1000) {
        const effect = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: x,
            y: y,
            startTime: Date.now(),
            duration: duration,
            animationKey: type
        };
        
        this.effects.push(effect);
        
        // Auto-suppression après la durée
        setTimeout(() => {
            this.removeEffect(effect.id);
        }, duration);
        
        return effect.id;
    }
    
    removeEffect(effectId) {
        this.effects = this.effects.filter(e => e.id !== effectId);
    }
    
    drawEffects(ctx) {
        const now = Date.now();
        
        for (const effect of this.effects) {
            const progress = (now - effect.startTime) / effect.duration;
            if (progress >= 1) continue;
            
            this.drawEffect(ctx, effect, progress);
        }
    }
    
    drawEffect(ctx, effect, progress) {
        const animation = this.animations.get(effect.animationKey);
        if (!animation) return;
        
        const frameIndex = Math.floor(progress * animation.frames.length);
        const frame = animation.frames[frameIndex];
        if (!frame) return;
        
        ctx.save();
        ctx.translate(effect.x, effect.y);
        
        switch (frame.type) {
            case 'checkmark':
                this.drawCheckmark(ctx, frame);
                break;
            case 'screen_flash':
                this.drawScreenFlash(ctx, frame);
                break;
            case 'smoke':
                this.drawSmoke(ctx, frame);
                break;
            case 'sparks':
                this.drawSparks(ctx, frame);
                break;
        }
        
        ctx.restore();
    }
    
    drawCheckmark(ctx, frame) {
        ctx.save();
        ctx.scale(frame.scale, frame.scale);
        ctx.rotate(frame.rotation * Math.PI / 180);
        ctx.globalAlpha = frame.alpha;
        
        // Dessiner le checkmark
        ctx.strokeStyle = frame.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-3, 7);
        ctx.lineTo(10, -8);
        ctx.stroke();
        
        // Glow effect
        if (frame.glow > 0) {
            ctx.shadowColor = frame.color;
            ctx.shadowBlur = frame.glow;
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawScreenFlash(ctx, frame) {
        // Flash d'écran plein
        const canvas = ctx.canvas;
        ctx.save();
        ctx.resetTransform();
        ctx.fillStyle = frame.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    
    drawSmoke(ctx, frame) {
        ctx.save();
        ctx.scale(frame.scale, frame.scale);
        ctx.rotate(frame.rotation * Math.PI / 180);
        ctx.globalAlpha = frame.alpha;
        ctx.translate(0, frame.offsetY);
        
        // Dessiner de la fumée
        ctx.fillStyle = '#95a5a6';
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const size = Math.random() * 8 + 4;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawSparks(ctx, frame) {
        ctx.fillStyle = frame.color;
        
        for (const spark of frame.particles) {
            ctx.save();
            ctx.globalAlpha = spark.life;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Méthodes utilitaires
    getPlayerColorHex(color) {
        const colors = {
            red: '#e74c3c',
            blue: '#3498db',
            green: '#27ae60',
            yellow: '#f1c40f',
            orange: '#e67e22',
            pink: '#e91e63',
            cyan: '#1abc9c',
            lime: '#2ecc71',
            purple: '#9b59b6',
            black: '#34495e'
        };
        
        return colors[color] || colors.red;
    }
    
    darkenColor(color, amount) {
        // Assombrir une couleur
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    update(deltaTime) {
        this.frameCount++;
        
        // Mettre à jour les systèmes de particules
        this.updateParticleSystems(deltaTime);
        
        // Nettoyer les effets expirés
        const now = Date.now();
        this.effects = this.effects.filter(effect => 
            now - effect.startTime < effect.duration
        );
    }
    
    updateParticleSystems(deltaTime) {
        for (const system of this.particleSystems) {
            // Logique de mise à jour des particules
            system.particles = system.particles.filter(p => p.life > 0);
            
            for (const particle of system.particles) {
                particle.life -= deltaTime / 1000;
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
            }
        }
    }
    
    render(ctx) {
        if (!ctx) return;
        
        // Dessiner tous les effets
        this.drawEffects(ctx);
        
        // Dessiner les systèmes de particules
        this.renderParticleSystems(ctx);
    }
    
    renderParticleSystems(ctx) {
        for (const system of this.particleSystems) {
            for (const particle of system.particles) {
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color || '#ffffff';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}

// Export global
window.AmongUsAnimations = AmongUsAnimations;

console.log('✅ Among Us Animation System loaded');
