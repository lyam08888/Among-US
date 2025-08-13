// Among Us V4 - Système de Mapping Avancé avec Assets
class AdvancedMappingSystem {
    constructor(engine) {
        this.engine = engine;
        this.assets = new Map();
        this.loadedTextures = new Map();
        this.currentMap = null;
        this.mapData = new Map();
        this.decorElements = [];
        this.interactiveObjects = [];
        this.ventSystem = new Map();
        this.roomBounds = new Map();
        this.lightingSources = [];
        this.ambientSounds = new Map();
        
        // Configuration du système
        this.config = {
            tileSize: 256,
            characterSize: 128,
            renderDistance: 1000,
            lightingEnabled: true,
            shadowsEnabled: true,
            particlesEnabled: true,
            audioEnabled: true
        };
        
        this.init();
    }
    
    async init() {
        console.log('🗺️ Initializing Advanced Mapping System...');
        
        try {
            // Charger l'atlas des assets
            await this.loadAtlas();
            
            // Charger les textures
            await this.loadTextures();
            
            // Initialiser les cartes
            this.initializeMaps();
            
            // Charger la carte par défaut
            await this.loadMap('skeld');
            
            console.log('✅ Advanced Mapping System initialized');
        } catch (error) {
            console.error('❌ Failed to initialize mapping system:', error);
            throw error;
        }
    }
    
    async loadAtlas() {
        try {
            const response = await fetch('assets/atlas.json');
            const atlasData = await response.json();
            
            this.atlas = atlasData;
            console.log('📋 Atlas loaded:', Object.keys(atlasData.files).length, 'assets');
        } catch (error) {
            console.error('❌ Failed to load atlas:', error);
            throw error;
        }
    }
    
    async loadTextures() {
        const texturePromises = [];
        
        // Charger les textures de décor
        const decorTextures = [
            'decor/floor-metal.png',
            'decor/floor-hazard.png',
            'decor/floor-grate.png',
            'decor/floor-dots.png',
            'decor/floor-tech.png',
            'decor/wall-panel.png',
            'decor/wall-pipe.png',
            'decor/trim-light.png',
            'decor/vent.png',
            'decor/door.png',
            'decor/table-round.png',
            'decor/table-rect.png',
            'decor/crate.png',
            'decor/barrel.png',
            'decor/camera.png',
            'decor/lamp.png',
            'decor/screen.png',
            'decor/console.png',
            'decor/computer.png',
            'decor/scanner.png',
            'decor/reactor.png'
        ];
        
        for (const texturePath of decorTextures) {
            texturePromises.push(this.loadTexture(texturePath));
        }
        
        // Charger les textures de personnages
        const characterColors = ['red', 'blue', 'green', 'yellow', 'pink', 'orange', 'cyan', 'lime', 'purple', 'black'];
        for (const color of characterColors) {
            texturePromises.push(this.loadTexture(`characters/crew-${color}-sheet.png`));
        }
        
        await Promise.all(texturePromises);
        console.log('🎨 All textures loaded');
    }
    
    async loadTexture(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedTextures.set(path, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load texture: ${path}`));
            img.src = `assets/${path}`;
        });
    }
    
    initializeMaps() {
        // Configuration de The Skeld
        this.mapData.set('skeld', {
            name: 'The Skeld',
            size: { width: 2000, height: 1500 },
            spawnPoints: [
                { x: 0, y: 0, name: 'Cafeteria' }
            ],
            rooms: [
                {
                    id: 'cafeteria',
                    name: 'Cafeteria',
                    bounds: { x: -200, y: -150, width: 400, height: 300 },
                    floorType: 'floor-metal',
                    wallType: 'wall-panel',
                    lighting: { color: '#ffffff', intensity: 0.8 },
                    ambientSound: 'ambient-cafeteria',
                    objects: [
                        { type: 'table-round', x: -50, y: -50, rotation: 0 },
                        { type: 'table-round', x: 50, y: -50, rotation: 0 },
                        { type: 'table-round', x: 0, y: 50, rotation: 0 }
                    ],
                    tasks: ['emergency-button'],
                    vents: []
                },
                {
                    id: 'weapons',
                    name: 'Weapons',
                    bounds: { x: 200, y: -200, width: 300, height: 200 },
                    floorType: 'floor-tech',
                    wallType: 'wall-panel',
                    lighting: { color: '#ff4444', intensity: 0.6 },
                    ambientSound: 'ambient-weapons',
                    objects: [
                        { type: 'console', x: 250, y: -150, rotation: 0 },
                        { type: 'screen', x: 300, y: -100, rotation: 0 }
                    ],
                    tasks: ['asteroids'],
                    vents: []
                },
                {
                    id: 'o2',
                    name: 'O2',
                    bounds: { x: 200, y: 50, width: 250, height: 200 },
                    floorType: 'floor-grate',
                    wallType: 'wall-pipe',
                    lighting: { color: '#44ff44', intensity: 0.7 },
                    ambientSound: 'ambient-o2',
                    objects: [
                        { type: 'console', x: 250, y: 100, rotation: 0 },
                        { type: 'barrel', x: 300, y: 150, rotation: 0 }
                    ],
                    tasks: ['o2-filter'],
                    vents: []
                },
                {
                    id: 'navigation',
                    name: 'Navigation',
                    bounds: { x: 200, y: -50, width: 200, height: 150 },
                    floorType: 'floor-dots',
                    wallType: 'wall-panel',
                    lighting: { color: '#4444ff', intensity: 0.8 },
                    ambientSound: 'ambient-navigation',
                    objects: [
                        { type: 'computer', x: 250, y: -25, rotation: 0 },
                        { type: 'screen', x: 300, y: 0, rotation: 0 }
                    ],
                    tasks: ['navigation'],
                    vents: []
                },
                {
                    id: 'shields',
                    name: 'Shields',
                    bounds: { x: 150, y: 200, width: 200, height: 150 },
                    floorType: 'floor-hazard',
                    wallType: 'wall-panel',
                    lighting: { color: '#ffff44', intensity: 0.9 },
                    ambientSound: 'ambient-shields',
                    objects: [
                        { type: 'console', x: 200, y: 250, rotation: 0 }
                    ],
                    tasks: ['shields'],
                    vents: []
                },
                {
                    id: 'communications',
                    name: 'Communications',
                    bounds: { x: -50, y: 200, width: 200, height: 150 },
                    floorType: 'floor-tech',
                    wallType: 'wall-panel',
                    lighting: { color: '#ff44ff', intensity: 0.7 },
                    ambientSound: 'ambient-comms',
                    objects: [
                        { type: 'console', x: 0, y: 250, rotation: 0 },
                        { type: 'screen', x: 50, y: 275, rotation: 0 }
                    ],
                    tasks: ['communications'],
                    vents: []
                },
                {
                    id: 'storage',
                    name: 'Storage',
                    bounds: { x: -300, y: 100, width: 200, height: 200 },
                    floorType: 'floor-metal',
                    wallType: 'wall-panel',
                    lighting: { color: '#ffffff', intensity: 0.6 },
                    ambientSound: 'ambient-storage',
                    objects: [
                        { type: 'crate', x: -250, y: 150, rotation: 0 },
                        { type: 'crate', x: -200, y: 150, rotation: 0 },
                        { type: 'barrel', x: -250, y: 200, rotation: 0 }
                    ],
                    tasks: ['fuel'],
                    vents: []
                },
                {
                    id: 'electrical',
                    name: 'Electrical',
                    bounds: { x: -300, y: -100, width: 150, height: 150 },
                    floorType: 'floor-hazard',
                    wallType: 'wall-pipe',
                    lighting: { color: '#ffff00', intensity: 0.5 },
                    ambientSound: 'ambient-electrical',
                    objects: [
                        { type: 'console', x: -250, y: -50, rotation: 0 },
                        { type: 'wire-1', x: -280, y: -25, rotation: 0 },
                        { type: 'wire-2', x: -220, y: -25, rotation: 0 }
                    ],
                    tasks: ['wires', 'electrical'],
                    vents: ['vent-electrical']
                },
                {
                    id: 'lower-engine',
                    name: 'Lower Engine',
                    bounds: { x: -400, y: 200, width: 200, height: 150 },
                    floorType: 'floor-grate',
                    wallType: 'wall-pipe',
                    lighting: { color: '#ff8800', intensity: 0.8 },
                    ambientSound: 'ambient-engine',
                    objects: [
                        { type: 'reactor', x: -350, y: 250, rotation: 0 }
                    ],
                    tasks: ['engine-lower'],
                    vents: ['vent-lower-engine']
                },
                {
                    id: 'upper-engine',
                    name: 'Upper Engine',
                    bounds: { x: -400, y: -200, width: 200, height: 150 },
                    floorType: 'floor-grate',
                    wallType: 'wall-pipe',
                    lighting: { color: '#ff8800', intensity: 0.8 },
                    ambientSound: 'ambient-engine',
                    objects: [
                        { type: 'reactor', x: -350, y: -150, rotation: 0 }
                    ],
                    tasks: ['engine-upper'],
                    vents: ['vent-upper-engine']
                },
                {
                    id: 'security',
                    name: 'Security',
                    bounds: { x: -150, y: -200, width: 150, height: 100 },
                    floorType: 'floor-dots',
                    wallType: 'wall-panel',
                    lighting: { color: '#00ffff', intensity: 0.9 },
                    ambientSound: 'ambient-security',
                    objects: [
                        { type: 'screen', x: -100, y: -175, rotation: 0 },
                        { type: 'screen', x: -50, y: -175, rotation: 0 },
                        { type: 'camera', x: -75, y: -150, rotation: 0 }
                    ],
                    tasks: ['security'],
                    vents: []
                },
                {
                    id: 'reactor',
                    name: 'Reactor',
                    bounds: { x: -200, y: 300, width: 200, height: 200 },
                    floorType: 'floor-hazard',
                    wallType: 'wall-pipe',
                    lighting: { color: '#ff0000', intensity: 1.0 },
                    ambientSound: 'ambient-reactor',
                    objects: [
                        { type: 'reactor', x: -150, y: 350, rotation: 0 },
                        { type: 'console', x: -100, y: 400, rotation: 0 }
                    ],
                    tasks: ['reactor'],
                    vents: []
                },
                {
                    id: 'medbay',
                    name: 'MedBay',
                    bounds: { x: 50, y: -250, width: 200, height: 150 },
                    floorType: 'floor-tech',
                    wallType: 'wall-panel',
                    lighting: { color: '#00ff88', intensity: 0.9 },
                    ambientSound: 'ambient-medbay',
                    objects: [
                        { type: 'scanner', x: 100, y: -200, rotation: 0 },
                        { type: 'console', x: 150, y: -175, rotation: 0 }
                    ],
                    tasks: ['medbay-scan'],
                    vents: ['vent-medbay']
                },
                {
                    id: 'admin',
                    name: 'Admin',
                    bounds: { x: -50, y: -50, width: 150, height: 100 },
                    floorType: 'floor-dots',
                    wallType: 'wall-panel',
                    lighting: { color: '#ffffff', intensity: 0.8 },
                    ambientSound: 'ambient-admin',
                    objects: [
                        { type: 'console', x: 0, y: -25, rotation: 0 },
                        { type: 'screen', x: 25, y: 0, rotation: 0 }
                    ],
                    tasks: ['admin'],
                    vents: ['vent-admin']
                }
            ],
            vents: [
                {
                    id: 'vent-electrical',
                    position: { x: -275, y: -75 },
                    connections: ['vent-admin', 'vent-medbay']
                },
                {
                    id: 'vent-admin',
                    position: { x: -25, y: -25 },
                    connections: ['vent-electrical', 'vent-cafeteria']
                },
                {
                    id: 'vent-cafeteria',
                    position: { x: 25, y: 25 },
                    connections: ['vent-admin', 'vent-navigation']
                },
                {
                    id: 'vent-navigation',
                    position: { x: 275, y: -25 },
                    connections: ['vent-cafeteria', 'vent-weapons']
                },
                {
                    id: 'vent-weapons',
                    position: { x: 325, y: -175 },
                    connections: ['vent-navigation', 'vent-shields']
                },
                {
                    id: 'vent-shields',
                    position: { x: 225, y: 225 },
                    connections: ['vent-weapons', 'vent-lower-engine']
                },
                {
                    id: 'vent-lower-engine',
                    position: { x: -375, y: 225 },
                    connections: ['vent-shields', 'vent-upper-engine']
                },
                {
                    id: 'vent-upper-engine',
                    position: { x: -375, y: -175 },
                    connections: ['vent-lower-engine', 'vent-medbay']
                },
                {
                    id: 'vent-medbay',
                    position: { x: 125, y: -225 },
                    connections: ['vent-upper-engine', 'vent-electrical']
                }
            ],
            corridors: [
                // Couloirs principaux
                { from: 'cafeteria', to: 'weapons', path: [{ x: 0, y: -100 }, { x: 200, y: -100 }] },
                { from: 'cafeteria', to: 'admin', path: [{ x: -25, y: -25 }] },
                { from: 'cafeteria', to: 'storage', path: [{ x: -100, y: 0 }, { x: -200, y: 100 }] },
                { from: 'weapons', to: 'navigation', path: [{ x: 250, y: -50 }] },
                { from: 'navigation', to: 'o2', path: [{ x: 250, y: 100 }] },
                { from: 'o2', to: 'shields', path: [{ x: 200, y: 200 }] },
                { from: 'shields', to: 'communications', path: [{ x: 100, y: 225 }] },
                { from: 'communications', to: 'storage', path: [{ x: -150, y: 200 }] },
                { from: 'storage', to: 'electrical', path: [{ x: -250, y: 0 }] },
                { from: 'electrical', to: 'lower-engine', path: [{ x: -300, y: 150 }] },
                { from: 'electrical', to: 'upper-engine', path: [{ x: -300, y: -150 }] },
                { from: 'upper-engine', to: 'security', path: [{ x: -200, y: -175 }] },
                { from: 'security', to: 'medbay', path: [{ x: 0, y: -200 }] },
                { from: 'medbay', to: 'weapons', path: [{ x: 150, y: -175 }] },
                { from: 'storage', to: 'reactor', path: [{ x: -200, y: 250 }] }
            ]
        });
        
        console.log('🗺️ Maps initialized');
    }
    
    async loadMap(mapName) {
        console.log(`🗺️ Loading map: ${mapName}`);
        
        const mapData = this.mapData.get(mapName);
        if (!mapData) {
            throw new Error(`Map not found: ${mapName}`);
        }
        
        this.currentMap = mapData;
        
        // Nettoyer les éléments précédents
        this.decorElements = [];
        this.interactiveObjects = [];
        this.lightingSources = [];
        this.ambientSounds.clear();
        
        // Créer les éléments de la carte
        await this.createMapElements();
        
        // Initialiser le système de ventilation
        this.initializeVentSystem();
        
        // Configurer l'éclairage
        this.setupLighting();
        
        // Configurer l'audio ambiant
        this.setupAmbientAudio();
        
        console.log(`✅ Map loaded: ${mapName}`);
        return this.currentMap;
    }
    
    async createMapElements() {
        if (!this.currentMap) return;
        
        // Créer les salles
        for (const room of this.currentMap.rooms) {
            await this.createRoom(room);
        }
        
        // Créer les couloirs
        for (const corridor of this.currentMap.corridors) {
            this.createCorridor(corridor);
        }
        
        // Créer les vents
        for (const vent of this.currentMap.vents) {
            this.createVent(vent);
        }
    }
    
    async createRoom(roomData) {
        const room = {
            id: roomData.id,
            name: roomData.name,
            bounds: roomData.bounds,
            elements: []
        };
        
        // Créer le sol
        const floorTexture = this.loadedTextures.get(`decor/${roomData.floorType}.png`);
        if (floorTexture) {
            room.elements.push({
                type: 'floor',
                texture: floorTexture,
                x: roomData.bounds.x,
                y: roomData.bounds.y,
                width: roomData.bounds.width,
                height: roomData.bounds.height,
                tiled: true
            });
        }
        
        // Créer les murs
        const wallTexture = this.loadedTextures.get(`decor/${roomData.wallType}.png`);
        if (wallTexture) {
            // Mur du haut
            room.elements.push({
                type: 'wall',
                texture: wallTexture,
                x: roomData.bounds.x,
                y: roomData.bounds.y - 20,
                width: roomData.bounds.width,
                height: 20,
                tiled: true
            });
            
            // Mur du bas
            room.elements.push({
                type: 'wall',
                texture: wallTexture,
                x: roomData.bounds.x,
                y: roomData.bounds.y + roomData.bounds.height,
                width: roomData.bounds.width,
                height: 20,
                tiled: true
            });
            
            // Mur de gauche
            room.elements.push({
                type: 'wall',
                texture: wallTexture,
                x: roomData.bounds.x - 20,
                y: roomData.bounds.y,
                width: 20,
                height: roomData.bounds.height,
                tiled: true
            });
            
            // Mur de droite
            room.elements.push({
                type: 'wall',
                texture: wallTexture,
                x: roomData.bounds.x + roomData.bounds.width,
                y: roomData.bounds.y,
                width: 20,
                height: roomData.bounds.height,
                tiled: true
            });
        }
        
        // Créer les objets de décoration
        for (const obj of roomData.objects) {
            const objTexture = this.loadedTextures.get(`decor/${obj.type}.png`);
            if (objTexture) {
                const decorElement = {
                    type: 'decor',
                    subType: obj.type,
                    texture: objTexture,
                    x: obj.x,
                    y: obj.y,
                    rotation: obj.rotation || 0,
                    width: objTexture.width,
                    height: objTexture.height,
                    interactive: this.isInteractiveObject(obj.type),
                    roomId: roomData.id
                };
                
                room.elements.push(decorElement);
                
                if (decorElement.interactive) {
                    this.interactiveObjects.push(decorElement);
                }
            }
        }
        
        // Ajouter l'éclairage de la salle
        if (roomData.lighting) {
            this.lightingSources.push({
                x: roomData.bounds.x + roomData.bounds.width / 2,
                y: roomData.bounds.y + roomData.bounds.height / 2,
                color: roomData.lighting.color,
                intensity: roomData.lighting.intensity,
                radius: Math.max(roomData.bounds.width, roomData.bounds.height),
                roomId: roomData.id
            });
        }
        
        this.decorElements.push(room);
        this.roomBounds.set(roomData.id, roomData.bounds);
    }
    
    createCorridor(corridorData) {
        // Créer un couloir entre deux salles
        const corridor = {
            type: 'corridor',
            from: corridorData.from,
            to: corridorData.to,
            path: corridorData.path,
            elements: []
        };
        
        // Créer le sol du couloir
        const floorTexture = this.loadedTextures.get('decor/floor-metal.png');
        if (floorTexture) {
            for (let i = 0; i < corridorData.path.length - 1; i++) {
                const start = corridorData.path[i];
                const end = corridorData.path[i + 1];
                
                const width = Math.abs(end.x - start.x) || 80;
                const height = Math.abs(end.y - start.y) || 80;
                
                corridor.elements.push({
                    type: 'floor',
                    texture: floorTexture,
                    x: Math.min(start.x, end.x) - width / 2,
                    y: Math.min(start.y, end.y) - height / 2,
                    width: width,
                    height: height,
                    tiled: true
                });
            }
        }
        
        this.decorElements.push(corridor);
    }
    
    createVent(ventData) {
        const ventTexture = this.loadedTextures.get('decor/vent.png');
        if (ventTexture) {
            const vent = {
                type: 'vent',
                id: ventData.id,
                texture: ventTexture,
                x: ventData.position.x,
                y: ventData.position.y,
                width: 64,
                height: 64,
                connections: ventData.connections,
                interactive: true,
                animation: 'idle'
            };
            
            this.decorElements.push(vent);
            this.interactiveObjects.push(vent);
            this.ventSystem.set(ventData.id, vent);
        }
    }
    
    initializeVentSystem() {
        // Créer les connexions entre les vents
        this.ventSystem.forEach((vent, ventId) => {
            vent.connectedVents = [];
            for (const connectionId of vent.connections) {
                const connectedVent = this.ventSystem.get(connectionId);
                if (connectedVent) {
                    vent.connectedVents.push(connectedVent);
                }
            }
        });
        
        console.log(`🌪️ Vent system initialized with ${this.ventSystem.size} vents`);
    }
    
    setupLighting() {
        if (!this.config.lightingEnabled) return;
        
        // Configurer l'éclairage global
        this.globalLighting = {
            ambient: { r: 0.2, g: 0.2, b: 0.3, intensity: 0.3 },
            sources: this.lightingSources
        };
        
        console.log(`💡 Lighting setup with ${this.lightingSources.length} sources`);
    }
    
    setupAmbientAudio() {
        if (!this.config.audioEnabled) return;
        
        // Configurer l'audio ambiant pour chaque salle
        for (const room of this.currentMap.rooms) {
            if (room.ambientSound) {
                this.ambientSounds.set(room.id, {
                    soundId: room.ambientSound,
                    volume: 0.3,
                    loop: true,
                    position: {
                        x: room.bounds.x + room.bounds.width / 2,
                        y: room.bounds.y + room.bounds.height / 2
                    },
                    radius: Math.max(room.bounds.width, room.bounds.height)
                });
            }
        }
        
        console.log(`🔊 Ambient audio setup for ${this.ambientSounds.size} rooms`);
    }
    
    isInteractiveObject(objectType) {
        const interactiveTypes = [
            'console', 'computer', 'scanner', 'reactor',
            'vent', 'door', 'camera', 'screen'
        ];
        return interactiveTypes.includes(objectType);
    }
    
    render(ctx, camera) {
        if (!this.currentMap || !ctx) return;
        
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
        
        // Rendre les éléments de décor
        this.renderDecorElements(ctx, visibleBounds);
        
        // Rendre l'éclairage si activé
        if (this.config.lightingEnabled) {
            this.renderLighting(ctx, visibleBounds);
        }
        
        ctx.restore();
    }
    
    renderDecorElements(ctx, visibleBounds) {
        for (const element of this.decorElements) {
            if (element.elements) {
                // Rendre les éléments d'une salle ou couloir
                for (const subElement of element.elements) {
                    if (this.isElementVisible(subElement, visibleBounds)) {
                        this.renderElement(ctx, subElement);
                    }
                }
            } else if (this.isElementVisible(element, visibleBounds)) {
                // Rendre un élément individuel (comme un vent)
                this.renderElement(ctx, element);
            }
        }
    }
    
    renderElement(ctx, element) {
        if (!element.texture) return;
        
        ctx.save();
        
        if (element.rotation) {
            ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
            ctx.rotate(element.rotation);
            ctx.translate(-element.width / 2, -element.height / 2);
        } else {
            ctx.translate(element.x, element.y);
        }
        
        if (element.tiled) {
            // Rendre en mode tuilé
            this.renderTiledTexture(ctx, element.texture, 0, 0, element.width, element.height);
        } else {
            // Rendre normalement
            ctx.drawImage(element.texture, 0, 0, element.width || element.texture.width, element.height || element.texture.height);
        }
        
        // Ajouter des effets spéciaux pour certains objets
        if (element.interactive) {
            this.renderInteractiveHighlight(ctx, element);
        }
        
        ctx.restore();
    }
    
    renderTiledTexture(ctx, texture, x, y, width, height) {
        const tileWidth = texture.width;
        const tileHeight = texture.height;
        
        for (let tx = 0; tx < width; tx += tileWidth) {
            for (let ty = 0; ty < height; ty += tileHeight) {
                const drawWidth = Math.min(tileWidth, width - tx);
                const drawHeight = Math.min(tileHeight, height - ty);
                
                ctx.drawImage(
                    texture,
                    0, 0, drawWidth, drawHeight,
                    x + tx, y + ty, drawWidth, drawHeight
                );
            }
        }
    }
    
    renderInteractiveHighlight(ctx, element) {
        // Ajouter un effet de surbrillance pour les objets interactifs
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() * 0.003);
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-2, -2, (element.width || element.texture.width) + 4, (element.height || element.texture.height) + 4);
        ctx.restore();
    }
    
    renderLighting(ctx, visibleBounds) {
        // Créer un masque d'éclairage
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        
        // Fond sombre
        ctx.fillStyle = `rgba(${this.globalLighting.ambient.r * 255}, ${this.globalLighting.ambient.g * 255}, ${this.globalLighting.ambient.b * 255}, ${1 - this.globalLighting.ambient.intensity})`;
        ctx.fillRect(visibleBounds.left, visibleBounds.top, visibleBounds.right - visibleBounds.left, visibleBounds.bottom - visibleBounds.top);
        
        // Sources de lumière
        ctx.globalCompositeOperation = 'screen';
        for (const light of this.lightingSources) {
            if (this.isPointVisible(light, visibleBounds)) {
                const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
                gradient.addColorStop(0, `${light.color}${Math.floor(light.intensity * 255).toString(16).padStart(2, '0')}`);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
            }
        }
        
        ctx.restore();
    }
    
    isElementVisible(element, bounds) {
        const elementRight = element.x + (element.width || element.texture?.width || 0);
        const elementBottom = element.y + (element.height || element.texture?.height || 0);
        
        return !(element.x > bounds.right || 
                elementRight < bounds.left || 
                element.y > bounds.bottom || 
                elementBottom < bounds.top);
    }
    
    isPointVisible(point, bounds) {
        return point.x >= bounds.left && point.x <= bounds.right &&
               point.y >= bounds.top && point.y <= bounds.bottom;
    }
    
    // Méthodes utilitaires
    getRoomAt(x, y) {
        for (const [roomId, bounds] of this.roomBounds) {
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                return roomId;
            }
        }
        return null;
    }
    
    getInteractiveObjectAt(x, y) {
        for (const obj of this.interactiveObjects) {
            const objWidth = obj.width || obj.texture?.width || 64;
            const objHeight = obj.height || obj.texture?.height || 64;
            
            if (x >= obj.x && x <= obj.x + objWidth &&
                y >= obj.y && y <= obj.y + objHeight) {
                return obj;
            }
        }
        return null;
    }
    
    getVentConnections(ventId) {
        const vent = this.ventSystem.get(ventId);
        return vent ? vent.connectedVents : [];
    }
    
    updateAmbientAudio(playerPosition, audioSystem) {
        if (!this.config.audioEnabled || !audioSystem) return;
        
        const currentRoom = this.getRoomAt(playerPosition.x, playerPosition.y);
        
        // Mettre à jour l'audio ambiant en fonction de la position du joueur
        this.ambientSounds.forEach((sound, roomId) => {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x - sound.position.x, 2) +
                Math.pow(playerPosition.y - sound.position.y, 2)
            );
            
            const volume = currentRoom === roomId ? sound.volume : 
                          Math.max(0, sound.volume * (1 - distance / sound.radius));
            
            audioSystem.setAmbientVolume(sound.soundId, volume);
        });
    }
    
    // Getters
    getCurrentMap() {
        return this.currentMap;
    }
    
    getMapBounds() {
        return this.currentMap ? this.currentMap.size : { width: 0, height: 0 };
    }
    
    getSpawnPoints() {
        return this.currentMap ? this.currentMap.spawnPoints : [];
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMappingSystem;
} else if (typeof window !== 'undefined') {
    window.AdvancedMappingSystem = AdvancedMappingSystem;
}