// Character Customizer - Interface de personnalisation utilisant le générateur
class CharacterCustomizer {
    constructor(app) {
        this.app = app;
        this.currentOptions = null;
        this.previewCanvas = null;
        this.previewContext = null;
        this.animationFrame = null;
        this.animationTime = 0;
        
        this.init();
    }
    
    init() {
        this.currentOptions = window.CrewmateGenerator.CrewmatePresets.Classic();
        this.setupPreviewCanvas();
        this.setupControls();
        this.startPreviewAnimation();
    }
    
    setupPreviewCanvas() {
        this.previewCanvas = document.getElementById('character-preview-canvas');
        if (!this.previewCanvas) {
            // Créer le canvas s'il n'existe pas
            this.previewCanvas = document.createElement('canvas');
            this.previewCanvas.id = 'character-preview-canvas';
            this.previewCanvas.width = 300;
            this.previewCanvas.height = 300;
        }
        this.previewContext = this.previewCanvas.getContext('2d');
    }
    
    setupControls() {
        // Configuration des contrôles de couleur
        this.setupColorControls();
        
        // Configuration des contrôles d'anatomie
        this.setupAnatomyControls();
        
        // Configuration des contrôles de visière
        this.setupVisorControls();
        
        // Configuration des accessoires
        this.setupAccessoryControls();
        
        // Configuration des décals
        this.setupDecalControls();
        
        // Configuration des presets
        this.setupPresetControls();
    }
    
    setupColorControls() {
        const colors = [
            { name: 'Rouge', value: '#c51111' },
            { name: 'Bleu', value: '#132ed1' },
            { name: 'Vert', value: '#117f2d' },
            { name: 'Rose', value: '#ed54ba' },
            { name: 'Orange', value: '#f07613' },
            { name: 'Jaune', value: '#f5f557' },
            { name: 'Noir', value: '#3f474e' },
            { name: 'Blanc', value: '#d6e0f0' },
            { name: 'Violet', value: '#6b2fbb' },
            { name: 'Marron', value: '#71491e' },
            { name: 'Cyan', value: '#38fedc' },
            { name: 'Lime', value: '#50ef39' }
        ];
        
        const bodyColorContainer = document.getElementById('body-color-options');
        if (bodyColorContainer) {
            bodyColorContainer.innerHTML = colors.map(color => `
                <button class="color-option ${color.value === this.currentOptions.body ? 'active' : ''}" 
                        data-color="${color.value}" 
                        style="background-color: ${color.value}"
                        title="${color.name}"
                        onclick="characterCustomizer.setBodyColor('${color.value}')">
                </button>
            `).join('');
        }
        
        // Couleur de visière
        const visorColors = [
            { name: 'Bleu clair', value: '#8fd3ff' },
            { name: 'Rouge', value: '#ff6b6b' },
            { name: 'Vert', value: '#51cf66' },
            { name: 'Jaune', value: '#ffd43b' },
            { name: 'Violet', value: '#da77f2' },
            { name: 'Orange', value: '#ff922b' }
        ];
        
        const visorColorContainer = document.getElementById('visor-color-options');
        if (visorColorContainer) {
            visorColorContainer.innerHTML = visorColors.map(color => `
                <button class="color-option ${color.value === this.currentOptions.visor ? 'active' : ''}" 
                        data-color="${color.value}" 
                        style="background-color: ${color.value}"
                        title="${color.name}"
                        onclick="characterCustomizer.setVisorColor('${color.value}')">
                </button>
            `).join('');
        }
    }
    
    setupAnatomyControls() {
        // Sliders pour l'anatomie
        const anatomyControls = [
            { id: 'height-slider', property: 'heightMul', min: 0.8, max: 1.2, step: 0.01 },
            { id: 'width-slider', property: 'widthMul', min: 0.8, max: 1.2, step: 0.01 },
            { id: 'belly-slider', property: 'belly', min: 0, max: 0.5, step: 0.01 },
            { id: 'shoulder-slider', property: 'shoulder', min: 0, max: 0.3, step: 0.01 },
            { id: 'tilt-slider', property: 'tilt', min: -0.2, max: 0.2, step: 0.01 }
        ];
        
        anatomyControls.forEach(control => {
            const slider = document.getElementById(control.id);
            if (slider) {
                slider.min = control.min;
                slider.max = control.max;
                slider.step = control.step;
                slider.value = this.currentOptions.anatomy[control.property];
                
                slider.addEventListener('input', (e) => {
                    this.currentOptions.anatomy[control.property] = parseFloat(e.target.value);
                    this.updateSliderValue(control.id, e.target.value);
                    this.updatePreview();
                });
            }
        });
    }
    
    setupVisorControls() {
        const visorControls = [
            { id: 'visor-width-slider', property: 'visorW', min: 0.15, max: 0.35, step: 0.01 },
            { id: 'visor-height-slider', property: 'visorH', min: 0.10, max: 0.25, step: 0.01 },
            { id: 'visor-tilt-slider', property: 'visorTilt', min: -0.3, max: 0.3, step: 0.01 }
        ];
        
        visorControls.forEach(control => {
            const slider = document.getElementById(control.id);
            if (slider) {
                slider.min = control.min;
                slider.max = control.max;
                slider.step = control.step;
                slider.value = this.currentOptions[control.property];
                
                slider.addEventListener('input', (e) => {
                    this.currentOptions[control.property] = parseFloat(e.target.value);
                    this.updateSliderValue(control.id, e.target.value);
                    this.updatePreview();
                });
            }
        });
    }
    
    setupAccessoryControls() {
        const accessories = [
            { id: null, name: 'Aucun', emoji: '🚫' },
            { id: 'cap', name: 'Casquette', emoji: '🧢' },
            { id: 'flower', name: 'Fleur', emoji: '🌸' },
            { id: 'crown', name: 'Couronne', emoji: '👑' },
            { id: 'toilet', name: 'Papier toilette', emoji: '🧻' },
            { id: 'antenna', name: 'Antenne', emoji: '📡' },
            { id: 'halo', name: 'Auréole', emoji: '😇' },
            { id: 'bandana', name: 'Bandana', emoji: '🔺' },
            { id: 'horns', name: 'Cornes', emoji: '😈' }
        ];
        
        const accessoryContainer = document.getElementById('accessory-options');
        if (accessoryContainer) {
            accessoryContainer.innerHTML = accessories.map(acc => `
                <button class="accessory-option ${acc.id === this.currentOptions.accessory ? 'active' : ''}" 
                        data-accessory="${acc.id}"
                        title="${acc.name}"
                        onclick="characterCustomizer.setAccessory('${acc.id}')">
                    <span class="accessory-emoji">${acc.emoji}</span>
                    <span class="accessory-name">${acc.name}</span>
                </button>
            `).join('');
        }
    }
    
    setupDecalControls() {
        const decals = [
            { id: 'none', name: 'Aucun' },
            { id: 'stripe', name: 'Rayure' },
            { id: 'chevron', name: 'Chevron' },
            { id: 'star', name: 'Étoile' },
            { id: 'number', name: 'Numéro' },
            { id: 'badge', name: 'Badge' }
        ];
        
        const decalContainer = document.getElementById('decal-options');
        if (decalContainer) {
            decalContainer.innerHTML = decals.map(decal => `
                <button class="decal-option ${decal.id === this.currentOptions.decals.kind ? 'active' : ''}" 
                        data-decal="${decal.id}"
                        onclick="characterCustomizer.setDecal('${decal.id}')">
                    ${decal.name}
                </button>
            `).join('');
        }
    }
    
    setupPresetControls() {
        const presets = [
            { id: 'Classic', name: 'Classique' },
            { id: 'Slim', name: 'Mince' },
            { id: 'Chunky', name: 'Costaud' },
            { id: 'Heroic', name: 'Héroïque' }
        ];
        
        const presetContainer = document.getElementById('preset-options');
        if (presetContainer) {
            presetContainer.innerHTML = presets.map(preset => `
                <button class="preset-option" 
                        onclick="characterCustomizer.loadPreset('${preset.id}')">
                    ${preset.name}
                </button>
            `).join('');
        }
    }
    
    // Méthodes de modification
    setBodyColor(color) {
        this.currentOptions.body = color;
        this.updateColorButtons('body-color-options', color);
        this.updatePreview();
    }
    
    setVisorColor(color) {
        this.currentOptions.visor = color;
        this.updateColorButtons('visor-color-options', color);
        this.updatePreview();
    }
    
    setAccessory(accessoryId) {
        this.currentOptions.accessory = accessoryId === 'null' ? null : accessoryId;
        this.updateAccessoryButtons(accessoryId);
        this.updatePreview();
    }
    
    setDecal(decalId) {
        this.currentOptions.decals.kind = decalId;
        this.updateDecalButtons(decalId);
        this.updatePreview();
    }
    
    loadPreset(presetId) {
        this.currentOptions = window.CrewmateGenerator.CrewmatePresets[presetId]();
        this.refreshAllControls();
        this.updatePreview();
    }
    
    // Méthodes utilitaires
    updateColorButtons(containerId, activeColor) {
        const container = document.getElementById(containerId);
        if (container) {
            container.querySelectorAll('.color-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === activeColor);
            });
        }
    }
    
    updateAccessoryButtons(activeAccessory) {
        const container = document.getElementById('accessory-options');
        if (container) {
            container.querySelectorAll('.accessory-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.accessory === activeAccessory);
            });
        }
    }
    
    updateDecalButtons(activeDecal) {
        const container = document.getElementById('decal-options');
        if (container) {
            container.querySelectorAll('.decal-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.decal === activeDecal);
            });
        }
    }
    
    refreshAllControls() {
        this.setupColorControls();
        this.setupAnatomyControls();
        this.setupVisorControls();
        this.setupAccessoryControls();
        this.setupDecalControls();
    }
    
    updateSliderValue(sliderId, value) {
        const valueSpan = document.getElementById(sliderId.replace('-slider', '-value'));
        if (valueSpan) {
            valueSpan.textContent = parseFloat(value).toFixed(2);
        }
    }
    
    updatePreview() {
        if (!this.previewCanvas || !this.previewContext) return;
        
        // Effacer le canvas
        this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // Dessiner le personnage
        const state = {
            anim: 'idle',
            frame: Math.floor(this.animationTime / 100) % 8,
            dir: 3 // Face à droite
        };
        
        window.CrewmateGenerator.renderFrameToCanvas(this.previewCanvas, this.currentOptions, state);
    }
    
    startPreviewAnimation() {
        const animate = () => {
            this.animationTime += 16; // ~60fps
            this.updatePreview();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopPreviewAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    // Sauvegarde et chargement
    saveCharacter() {
        const characterData = {
            options: this.currentOptions,
            timestamp: Date.now()
        };
        
        localStorage.setItem('amongus_character', JSON.stringify(characterData));
        
        if (this.app && this.app.showToast) {
            this.app.showToast('Personnage sauvegardé!', 'success');
        }
    }
    
    loadCharacter() {
        const saved = localStorage.getItem('amongus_character');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentOptions = data.options;
                this.refreshAllControls();
                this.updatePreview();
                
                if (this.app && this.app.showToast) {
                    this.app.showToast('Personnage chargé!', 'success');
                }
            } catch (e) {
                console.error('Erreur lors du chargement du personnage:', e);
            }
        }
    }
    
    // Export pour utilisation dans le jeu
    exportCharacterOptions() {
        return JSON.parse(JSON.stringify(this.currentOptions));
    }
    
    // Génération de sprite sheet pour le jeu
    generateSpriteSheet(config = { frames: 8, dirs: 4, ssaa: 2 }) {
        return window.CrewmateGenerator.buildSpriteSheet(this.currentOptions, config);
    }
}

// Initialisation globale
window.CharacterCustomizer = CharacterCustomizer;