// Among Us V4 - Système de Personnages Avancé
class AdvancedCharacterSystem {
    constructor(engine) {
        this.engine = engine;
        this.characters = new Map();
        this.characterAtlases = new Map();
        this.characterTextures = new Map();
        this.animations = new Map();
        this.localPlayer = null;
        
        // Configuration des couleurs disponibles
        this.availableColors = [
            { name: 'red', hex: '#ef4444', displayName: 'Rouge' },
            { name: 'blue', hex: '#132ed1', displayName: 'Bleu' },
            { name: 'green', hex: '#117f2d', displayName: 'Vert' },
            { name: 'yellow', hex: '#f5f557', displayName: 'Jaune' },
            { name: 'pink', hex: '#ed54ba', displayName: 'Rose' },
            { name: 'orange', hex: '#f07613', displayName: 'Orange' },
            { name: 'cyan', hex: '#38fedc', displayName: 'Cyan' },
            { name: 'lime', hex: '#50ef39', displayName: 'Lime' },
            { name: 'purple', hex: '#6b2fbb', displayName: 'Violet' },
            { name: 'black', hex: '#3f474e', displayName: 'Noir' }
        ];
        
        // Configuration des animations
        this.animationConfig = {
            idle: { frames: 4, duration: 2000, loop: true },
            walk: { frames: 8, duration: 800, loop: true },
            kill: { frames: 6, duration: 1200, loop: false },
            ghost: { frames: 8, duration: 1600, loop: true },
            use: { frames: 4, duration: 600, loop: false },
            vent: { frames: 6, duration: 800, loop: false }
        };
        
        // État des personnages
        this.characterStates = {
            ALIVE: 'alive',
            DEAD: 'dead',
            GHOST: 'ghost',
            USING: 'using',
            VENTING: 'venting',
            KILLING: 'killing'
        };
        
        this.init();
    }
    
    async init() {
        console.log('👥 Initializing Advanced Character System...');
        
        try {
            // Charger les atlas de personnages
            await this.loadCharacterAtlases();
            
            // Charger les textures de personnages
            await this.loadCharacterTextures();
            
            // Initialiser les animations
            this.initializeAnimations();
            
            console.log('✅ Advanced Character System initialized');
        } catch (error) {
            console.error('❌ Failed to initialize character system:', error);
            throw error;
        }
    }
    
    async loadCharacterAtlases() {
        const atlasPromises = [];
        
        for (const color of this.availableColors) {
            atlasPromises.push(this.loadCharacterAtlas(color.name));
        }
        
        await Promise.all(atlasPromises);
        console.log(`📋 Loaded ${this.characterAtlases.size} character atlases`);
    }
    
    async loadCharacterAtlas(colorName) {
        try {
            const response = await fetch(`assets/characters/crew-${colorName}-atlas.json`);
            const atlasData = await response.json();
            
            this.characterAtlases.set(colorName, atlasData);
        } catch (error) {
            console.error(`❌ Failed to load atlas for ${colorName}:`, error);
            throw error;
        }
    }
    
    async loadCharacterTextures() {
        const texturePromises = [];
        
        for (const color of this.availableColors) {
            texturePromises.push(this.loadCharacterTexture(color.name));
        }
        
        await Promise.all(texturePromises);
        console.log(`🎨 Loaded ${this.characterTextures.size} character textures`);
    }
    
    async loadCharacterTexture(colorName) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.characterTextures.set(colorName, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load texture for ${colorName}`));
            img.src = `assets/characters/crew-${colorName}-sheet.png`;
        });
    }
    
    initializeAnimations() {
        // Créer les définitions d'animations pour chaque couleur
        for (const color of this.availableColors) {
            const atlas = this.characterAtlases.get(color.name);
            if (!atlas) continue;
            
            const colorAnimations = new Map();
            
            // Créer les animations basées sur l'atlas
            for (const [animName, config] of Object.entries(this.animationConfig)) {
                const frames = [];
                
                for (let i = 0; i < config.frames; i++) {
                    const frameKey = `${animName}_${i}`;
                    if (atlas.frames[frameKey]) {
                        frames.push({
                            ...atlas.frames[frameKey],
                            duration: config.duration / config.frames
                        });
                    }
                }
                
                if (frames.length > 0) {
                    colorAnimations.set(animName, {
                        frames: frames,
                        totalDuration: config.duration,
                        loop: config.loop,
                        currentFrame: 0,
                        elapsedTime: 0
                    });
                }
            }
            
            this.animations.set(color.name, colorAnimations);
        }
        
        console.log(`🎬 Initialized animations for ${this.animations.size} colors`);
    }
    
    createCharacter(id, options = {}) {
        const character = {
            id: id,
            name: options.name || `Player ${id}`,
            color: options.color || 'red',
            position: { x: options.x || 0, y: options.y || 0 },
            velocity: { x: 0, y: 0 },
            direction: options.direction || 'right',
            state: this.characterStates.ALIVE,
            animation: 'idle',
            animationTime: 0,
            isImpostor: options.isImpostor || false,
            isLocal: options.isLocal || false,
            
            // Propriétés de gameplay
            health: 100,
            speed: options.speed || 150,
            tasks: [],
            completedTasks: 0,
            
            // Propriétés visuelles
            scale: options.scale || 1,
            opacity: 1,
            rotation: 0,
            flipX: false,
            
            // Effets spéciaux
            effects: {
                glow: false,
                glowColor: '#ffffff',
                trail: false,
                trailColor: '#ffffff',
                particles: false
            },
            
            // Cosmétiques (pour extension future)
            cosmetics: {
                hat: null,
                skin: null,
                pet: null,
                visor: null
            },
            
            // État d'interaction
            interaction: {
                target: null,
                inRange: false,
                canUse: false,
                canKill: false,
                canVent: false,
                canReport: false
            }
        };
        
        this.characters.set(id, character);
        
        if (character.isLocal) {
            this.localPlayer = character;
        }
        
        console.log(`👤 Created character: ${character.name} (${character.color})`);
        return character;
    }
    
    updateCharacter(id, deltaTime) {
        const character = this.characters.get(id);
        if (!character) return;
        
        // Mettre à jour la position
        this.updatePosition(character, deltaTime);
        
        // Mettre à jour l'animation
        this.updateAnimation(character, deltaTime);
        
        // Mettre à jour les effets
        this.updateEffects(character, deltaTime);
        
        // Mettre à jour l'état d'interaction
        this.updateInteractionState(character);
    }
    
    updatePosition(character, deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // Appliquer la vélocité
        character.position.x += character.velocity.x * deltaSeconds;
        character.position.y += character.velocity.y * deltaSeconds;
        
        // Déterminer la direction basée sur la vélocité
        if (Math.abs(character.velocity.x) > 10) {
            character.direction = character.velocity.x > 0 ? 'right' : 'left';
            character.flipX = character.direction === 'left';
        }
        
        // Déterminer l'animation basée sur le mouvement
        const isMoving = Math.abs(character.velocity.x) > 10 || Math.abs(character.velocity.y) > 10;
        
        if (character.state === this.characterStates.ALIVE) {
            if (isMoving && character.animation === 'idle') {
                this.setCharacterAnimation(character.id, 'walk');
            } else if (!isMoving && character.animation === 'walk') {
                this.setCharacterAnimation(character.id, 'idle');
            }
        }
    }
    
    updateAnimation(character, deltaTime) {
        const colorAnimations = this.animations.get(character.color);
        if (!colorAnimations) return;
        
        const animation = colorAnimations.get(character.animation);
        if (!animation) return;
        
        // Mettre à jour le temps d'animation
        animation.elapsedTime += deltaTime;
        
        // Calculer la frame actuelle
        const frameIndex = Math.floor((animation.elapsedTime / animation.totalDuration) * animation.frames.length);
        
        if (animation.loop) {
            animation.currentFrame = frameIndex % animation.frames.length;
        } else {
            animation.currentFrame = Math.min(frameIndex, animation.frames.length - 1);
            
            // Si l'animation non-bouclée est terminée, revenir à idle
            if (frameIndex >= animation.frames.length) {
                this.setCharacterAnimation(character.id, 'idle');
            }
        }
        
        // Réinitialiser le temps si nécessaire
        if (animation.loop && animation.elapsedTime >= animation.totalDuration) {
            animation.elapsedTime = 0;
        }
    }
    
    updateEffects(character, deltaTime) {
        // Mettre à jour les effets spéciaux
        if (character.effects.glow) {
            // Effet de pulsation pour le glow
            const glowIntensity = 0.5 + 0.3 * Math.sin(Date.now() * 0.005);
            character.effects.glowIntensity = glowIntensity;
        }
        
        if (character.effects.trail) {
            // Gérer la traînée (implémentation future)
        }
        
        if (character.effects.particles) {
            // Gérer les particules (implémentation future)
        }
    }
    
    updateInteractionState(character) {
        if (!character.isLocal) return;
        
        // Réinitialiser l'état d'interaction
        character.interaction = {
            target: null,
            inRange: false,
            canUse: false,
            canKill: false,
            canVent: false,
            canReport: false
        };
        
        // Vérifier les interactions possibles
        // (Cette logique sera étendue avec le système de mapping)
    }
    
    setCharacterAnimation(id, animationName) {
        const character = this.characters.get(id);
        if (!character) return;
        
        const colorAnimations = this.animations.get(character.color);
        if (!colorAnimations || !colorAnimations.has(animationName)) return;
        
        character.animation = animationName;
        
        // Réinitialiser l'animation
        const animation = colorAnimations.get(animationName);
        animation.elapsedTime = 0;
        animation.currentFrame = 0;
    }
    
    setCharacterState(id, state) {
        const character = this.characters.get(id);
        if (!character) return;
        
        const oldState = character.state;
        character.state = state;
        
        // Changer l'animation en fonction de l'état
        switch (state) {
            case this.characterStates.DEAD:
                character.opacity = 0.7;
                this.setCharacterAnimation(id, 'ghost');
                break;
            case this.characterStates.GHOST:
                character.opacity = 0.5;
                character.effects.glow = true;
                character.effects.glowColor = '#ffffff';
                this.setCharacterAnimation(id, 'ghost');
                break;
            case this.characterStates.USING:
                this.setCharacterAnimation(id, 'use');
                break;
            case this.characterStates.VENTING:
                this.setCharacterAnimation(id, 'vent');
                break;
            case this.characterStates.KILLING:
                this.setCharacterAnimation(id, 'kill');
                break;
            case this.characterStates.ALIVE:
                character.opacity = 1;
                character.effects.glow = false;
                this.setCharacterAnimation(id, 'idle');
                break;
        }
        
        console.log(`👤 Character ${character.name} state changed: ${oldState} -> ${state}`);
    }
    
    moveCharacter(id, velocity) {
        const character = this.characters.get(id);
        if (!character) return;
        
        character.velocity = { ...velocity };
    }
    
    teleportCharacter(id, position) {
        const character = this.characters.get(id);
        if (!character) return;

        character.position = { ...position };
        character.velocity = { x: 0, y: 0 };
    }

    // API utilisée par v4-app.js pour mettre à jour la position d'un personnage
    updateCharacterPosition(id, x, y, direction) {
        // Si une méthode setPosition existe, l'utiliser
        if (typeof this.setPosition === 'function') {
            return this.setPosition(id, x, y, direction);
        }

        // Si une méthode updatePosition compatible existe, l'utiliser
        if (typeof this.updatePosition === 'function' && this.updatePosition.length >= 3) {
            return this.updatePosition(id, x, y, direction);
        }

        // Dernier recours : mettre à jour le modèle interne directement
        const character = this.characters.get(id);
        if (character) {
            character.position.x = x;
            character.position.y = y;
            if (direction !== undefined) {
                character.direction = direction;
                character.flipX = direction === 'left';
            }
        }
    }
    
    setCharacterColor(id, colorName) {
        const character = this.characters.get(id);
        if (!character || !this.availableColors.find(c => c.name === colorName)) return;
        
        character.color = colorName;
        console.log(`👤 Character ${character.name} color changed to ${colorName}`);
    }
    
    addCharacterEffect(id, effectName, options = {}) {
        const character = this.characters.get(id);
        if (!character) return;
        
        switch (effectName) {
            case 'glow':
                character.effects.glow = true;
                character.effects.glowColor = options.color || '#ffffff';
                break;
            case 'trail':
                character.effects.trail = true;
                character.effects.trailColor = options.color || character.color;
                break;
            case 'particles':
                character.effects.particles = true;
                character.effects.particleType = options.type || 'sparkle';
                break;
        }
    }
    
    removeCharacterEffect(id, effectName) {
        const character = this.characters.get(id);
        if (!character) return;
        
        character.effects[effectName] = false;
    }
    
    render(ctx, camera) {
        if (!ctx) return;
        
        ctx.save();
        
        // Appliquer la transformation de la caméra
        ctx.translate(-camera.x + camera.width / 2, -camera.y + camera.height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        
        // Calculer la zone visible
        const visibleBounds = {
            left: camera.x - camera.width / (2 * camera.zoom),
            right: camera.x + camera.width / (2 * camera.zoom),
            top: camera.y - camera.height / (2 * camera.zoom),
            bottom: camera.y + camera.height / (2 * camera.zoom)
        };
        
        // Trier les personnages par position Y pour un rendu correct
        const sortedCharacters = Array.from(this.characters.values())
            .filter(char => this.isCharacterVisible(char, visibleBounds))
            .sort((a, b) => a.position.y - b.position.y);
        
        // Rendre chaque personnage
        for (const character of sortedCharacters) {
            this.renderCharacter(ctx, character);
        }
        
        ctx.restore();
    }
    
    renderCharacter(ctx, character) {
        const texture = this.characterTextures.get(character.color);
        const colorAnimations = this.animations.get(character.color);
        
        // Si les textures ne sont pas chargées, utiliser le rendu de secours
        if (!texture || !colorAnimations) {
            this.renderCharacterFallback(ctx, character);
            return;
        }
        
        const animation = colorAnimations.get(character.animation);
        if (!animation || animation.frames.length === 0) {
            this.renderCharacterFallback(ctx, character);
            return;
        }
        
        const currentFrame = animation.frames[animation.currentFrame];
        
        ctx.save();
        
        // Appliquer la position
        ctx.translate(character.position.x, character.position.y);
        
        // Appliquer la rotation
        if (character.rotation !== 0) {
            ctx.rotate(character.rotation);
        }
        
        // Appliquer le flip horizontal
        if (character.flipX) {
            ctx.scale(-1, 1);
        }
        
        // Appliquer l'échelle
        ctx.scale(character.scale, character.scale);
        
        // Appliquer l'opacité
        ctx.globalAlpha = character.opacity;
        
        // Rendre les effets de glow
        if (character.effects.glow) {
            this.renderGlowEffect(ctx, character, currentFrame);
        }
        
        // Rendre le personnage
        ctx.drawImage(
            texture,
            currentFrame.x, currentFrame.y, currentFrame.w, currentFrame.h,
            -currentFrame.w / 2, -currentFrame.h / 2, currentFrame.w, currentFrame.h
        );
        
        // Rendre le nom du personnage
        this.renderCharacterName(ctx, character, currentFrame);
        
        // Rendre les indicateurs d'état
        this.renderStateIndicators(ctx, character, currentFrame);
        
        ctx.restore();
    }
    
    renderGlowEffect(ctx, character, frame) {
        ctx.save();
        ctx.globalAlpha = character.effects.glowIntensity || 0.5;
        ctx.shadowColor = character.effects.glowColor;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Rendre une version légèrement agrandie pour l'effet de glow
        ctx.drawImage(
            this.characterTextures.get(character.color),
            frame.x, frame.y, frame.w, frame.h,
            -frame.w / 2 - 2, -frame.h / 2 - 2, frame.w + 4, frame.h + 4
        );
        
        ctx.restore();
    }
    
    renderCharacterName(ctx, character, frame) {
        if (!character.name) return;
        
        ctx.save();
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const nameY = -frame.h / 2 - 20;
        
        // Contour noir
        ctx.strokeText(character.name, 0, nameY);
        // Texte blanc
        ctx.fillText(character.name, 0, nameY);
        
        ctx.restore();
    }
    
    renderStateIndicators(ctx, character, frame) {
        // Indicateur d'imposteur (pour les fantômes)
        if (character.isImpostor && character.state === this.characterStates.GHOST) {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👹', 0, -frame.h / 2 - 40);
            ctx.restore();
        }
        
        // Indicateur de tâche en cours
        if (character.state === this.characterStates.USING) {
            ctx.save();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚙️', 0, -frame.h / 2 - 35);
            ctx.restore();
        }
        
        // Indicateur de vent
        if (character.state === this.characterStates.VENTING) {
            ctx.save();
            ctx.fillStyle = '#888888';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🌪️', 0, -frame.h / 2 - 35);
            ctx.restore();
        }
    }
    
    isCharacterVisible(character, bounds) {
        const charSize = 128; // Taille approximative du personnage
        return !(character.position.x + charSize / 2 < bounds.left || 
                character.position.x - charSize / 2 > bounds.right || 
                character.position.y + charSize / 2 < bounds.top || 
                character.position.y - charSize / 2 > bounds.bottom);
    }
    
    // Méthodes utilitaires
    getCharacter(id) {
        return this.characters.get(id);
    }
    
    getAllCharacters() {
        return Array.from(this.characters.values());
    }
    
    getLocalPlayer() {
        return this.localPlayer;
    }
    
    getCharactersInRange(position, range) {
        return Array.from(this.characters.values()).filter(char => {
            const distance = Math.sqrt(
                Math.pow(char.position.x - position.x, 2) +
                Math.pow(char.position.y - position.y, 2)
            );
            return distance <= range;
        });
    }
    
    removeCharacter(id) {
        const character = this.characters.get(id);
        if (character) {
            this.characters.delete(id);
            if (character.isLocal) {
                this.localPlayer = null;
            }
            console.log(`👤 Removed character: ${character.name}`);
        }
    }
    
    getAvailableColors() {
        return this.availableColors;
    }
    
    isColorAvailable(colorName) {
        return !Array.from(this.characters.values()).some(char => char.color === colorName);
    }
    
    // Méthodes de gameplay
    killCharacter(killerId, victimId) {
        const killer = this.characters.get(killerId);
        const victim = this.characters.get(victimId);
        
        if (!killer || !victim || !killer.isImpostor) return false;
        
        // Animation de kill pour le tueur
        this.setCharacterState(killerId, this.characterStates.KILLING);
        
        // Tuer la victime
        this.setCharacterState(victimId, this.characterStates.DEAD);
        
        console.log(`💀 ${killer.name} killed ${victim.name}`);
        return true;
    }
    
    ventCharacter(characterId, ventId) {
        const character = this.characters.get(characterId);
        if (!character || !character.isImpostor) return false;
        
        this.setCharacterState(characterId, this.characterStates.VENTING);
        
        console.log(`🌪️ ${character.name} entered vent ${ventId}`);
        return true;
    }
    
    useObject(characterId, objectId) {
        const character = this.characters.get(characterId);
        if (!character) return false;
        
        this.setCharacterState(characterId, this.characterStates.USING);
        
        console.log(`⚙️ ${character.name} is using ${objectId}`);
        return true;
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedCharacterSystem;
} else if (typeof window !== 'undefined') {
    window.AdvancedCharacterSystem = AdvancedCharacterSystem;
}