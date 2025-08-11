// Among Us V3 - Map System
class AmongUsV3Maps {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Map system state
        this.currentMap = null;
        this.maps = new Map();
        this.mapAssets = new Map();
        
        // Map rendering
        this.mapCanvas = null;
        this.mapContext = null;
        this.minimapCanvas = null;
        this.minimapContext = null;
        
        // Map data
        this.rooms = new Map();
        this.vents = new Map();
        this.spawnPoints = [];
        this.taskLocations = new Map();
        this.emergencyButton = null;
        
        // Collision system
        this.walls = [];
        this.collisionMap = null;
        
        console.log('🗺️ Map system created');
    }
    
    async initialize() {
        try {
            // Initialize map definitions
            this.initializeMapDefinitions();
            
            // Setup rendering canvases
            this.setupCanvases();
            
            // Load default map
            await this.loadMap('skeld');
            
            // Setup event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('🗺️ Map system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize map system:', error);
        }
    }
    
    initializeMapDefinitions() {
        // The Skeld (Classic Map)
        this.maps.set('skeld', {
            id: 'skeld',
            name: 'The Skeld',
            size: { width: 2000, height: 1200 },
            background: '#1a1a2e',
            rooms: [
                {
                    id: 'cafeteria',
                    name: 'Cafeteria',
                    bounds: { x: 800, y: 250, width: 200, height: 150 },
                    color: '#4a4a6a',
                    tasks: ['cafeteria-empty-garbage']
                },
                {
                    id: 'weapons',
                    name: 'Weapons',
                    bounds: { x: 1500, y: 150, width: 150, height: 100 },
                    color: '#6a4a4a',
                    tasks: ['weapons-clear-asteroids']
                },
                {
                    id: 'o2',
                    name: 'O2',
                    bounds: { x: 1200, y: 150, width: 120, height: 100 },
                    color: '#4a6a4a',
                    tasks: ['o2-clean-filter']
                },
                {
                    id: 'navigation',
                    name: 'Navigation',
                    bounds: { x: 1600, y: 250, width: 120, height: 100 },
                    color: '#4a4a6a',
                    tasks: ['navigation-chart-course']
                },
                {
                    id: 'shields',
                    name: 'Shields',
                    bounds: { x: 1400, y: 450, width: 150, height: 100 },
                    color: '#6a6a4a',
                    tasks: ['shields-prime-shields']
                },
                {
                    id: 'communications',
                    name: 'Communications',
                    bounds: { x: 650, y: 150, width: 120, height: 100 },
                    color: '#4a6a6a',
                    tasks: ['communications-download-data']
                },
                {
                    id: 'storage',
                    name: 'Storage',
                    bounds: { x: 950, y: 650, width: 150, height: 120 },
                    color: '#6a4a6a',
                    tasks: ['storage-fuel-engines']
                },
                {
                    id: 'admin',
                    name: 'Admin',
                    bounds: { x: 1300, y: 250, width: 150, height: 120 },
                    color: '#4a4a6a',
                    tasks: ['admin-swipe-card']
                },
                {
                    id: 'electrical',
                    name: 'Electrical',
                    bounds: { x: 750, y: 550, width: 120, height: 100 },
                    color: '#6a6a4a',
                    tasks: ['electrical-fix-wiring']
                },
                {
                    id: 'lower-engine',
                    name: 'Lower Engine',
                    bounds: { x: 550, y: 650, width: 120, height: 100 },
                    color: '#6a4a4a',
                    tasks: []
                },
                {
                    id: 'upper-engine',
                    name: 'Upper Engine',
                    bounds: { x: 550, y: 150, width: 120, height: 100 },
                    color: '#6a4a4a',
                    tasks: []
                },
                {
                    id: 'security',
                    name: 'Security',
                    bounds: { x: 1150, y: 350, width: 100, height: 80 },
                    color: '#4a6a4a',
                    tasks: []
                },
                {
                    id: 'reactor',
                    name: 'Reactor',
                    bounds: { x: 500, y: 350, width: 150, height: 150 },
                    color: '#6a4a4a',
                    tasks: ['reactor-start-reactor']
                },
                {
                    id: 'medbay',
                    name: 'Medbay',
                    bounds: { x: 1100, y: 350, width: 150, height: 120 },
                    color: '#4a6a6a',
                    tasks: ['medbay-submit-scan']
                }
            ],
            corridors: [
                { from: { x: 900, y: 325 }, to: { x: 1100, y: 325 }, width: 60 },
                { from: { x: 1000, y: 400 }, to: { x: 1000, y: 650 }, width: 60 },
                { from: { x: 650, y: 400 }, to: { x: 900, y: 400 }, width: 60 },
                { from: { x: 1250, y: 325 }, to: { x: 1400, y: 325 }, width: 60 },
                { from: { x: 1320, y: 370 }, to: { x: 1320, y: 450 }, width: 60 }
            ],
            vents: [
                {
                    id: 'cafeteria-vent',
                    position: { x: 850, y: 380 },
                    connections: ['admin-vent', 'weapons-vent']
                },
                {
                    id: 'admin-vent',
                    position: { x: 1350, y: 320 },
                    connections: ['cafeteria-vent']
                },
                {
                    id: 'weapons-vent',
                    position: { x: 1550, y: 200 },
                    connections: ['cafeteria-vent', 'navigation-vent']
                },
                {
                    id: 'navigation-vent',
                    position: { x: 1650, y: 300 },
                    connections: ['weapons-vent', 'shields-vent']
                },
                {
                    id: 'shields-vent',
                    position: { x: 1450, y: 500 },
                    connections: ['navigation-vent']
                },
                {
                    id: 'electrical-vent',
                    position: { x: 800, y: 600 },
                    connections: ['security-vent', 'medbay-vent']
                },
                {
                    id: 'security-vent',
                    position: { x: 1200, y: 380 },
                    connections: ['electrical-vent', 'medbay-vent']
                },
                {
                    id: 'medbay-vent',
                    position: { x: 1150, y: 420 },
                    connections: ['electrical-vent', 'security-vent']
                },
                {
                    id: 'reactor-vent',
                    position: { x: 550, y: 420 },
                    connections: ['lower-engine-vent', 'upper-engine-vent']
                },
                {
                    id: 'lower-engine-vent',
                    position: { x: 600, y: 700 },
                    connections: ['reactor-vent', 'upper-engine-vent']
                },
                {
                    id: 'upper-engine-vent',
                    position: { x: 600, y: 200 },
                    connections: ['reactor-vent', 'lower-engine-vent']
                }
            ],
            spawnPoints: [
                { x: 900, y: 325 },
                { x: 920, y: 325 },
                { x: 940, y: 325 },
                { x: 960, y: 325 },
                { x: 980, y: 325 },
                { x: 900, y: 345 },
                { x: 920, y: 345 },
                { x: 940, y: 345 },
                { x: 960, y: 345 },
                { x: 980, y: 345 }
            ],
            emergencyButton: { x: 900, y: 300 },
            cameras: [
                { id: 'security-cam-1', position: { x: 1200, y: 380 }, viewAngle: 90, range: 200 },
                { id: 'security-cam-2', position: { x: 800, y: 600 }, viewAngle: 180, range: 200 },
                { id: 'security-cam-3', position: { x: 1450, y: 500 }, viewAngle: 270, range: 200 },
                { id: 'security-cam-4', position: { x: 600, y: 200 }, viewAngle: 0, range: 200 }
            ]
        });
        
        // Mira HQ (Alternative Map)
        this.maps.set('mira', {
            id: 'mira',
            name: 'Mira HQ',
            size: { width: 1800, height: 1000 },
            background: '#2a1a1a',
            rooms: [
                {
                    id: 'launchpad',
                    name: 'Launchpad',
                    bounds: { x: 400, y: 200, width: 200, height: 150 },
                    color: '#4a4a6a',
                    tasks: []
                },
                {
                    id: 'reactor-mira',
                    name: 'Reactor',
                    bounds: { x: 200, y: 400, width: 150, height: 150 },
                    color: '#6a4a4a',
                    tasks: ['reactor-start-reactor']
                },
                {
                    id: 'laboratory',
                    name: 'Laboratory',
                    bounds: { x: 600, y: 300, width: 180, height: 120 },
                    color: '#4a6a4a',
                    tasks: []
                },
                {
                    id: 'office',
                    name: 'Office',
                    bounds: { x: 900, y: 200, width: 150, height: 120 },
                    color: '#4a4a6a',
                    tasks: []
                },
                {
                    id: 'admin-mira',
                    name: 'Admin',
                    bounds: { x: 1200, y: 300, width: 150, height: 120 },
                    color: '#4a4a6a',
                    tasks: ['admin-swipe-card']
                },
                {
                    id: 'greenhouse',
                    name: 'Greenhouse',
                    bounds: { x: 1000, y: 500, width: 200, height: 150 },
                    color: '#4a6a4a',
                    tasks: []
                },
                {
                    id: 'cafeteria-mira',
                    name: 'Cafeteria',
                    bounds: { x: 700, y: 600, width: 200, height: 150 },
                    color: '#4a4a6a',
                    tasks: ['cafeteria-empty-garbage']
                },
                {
                    id: 'balcony',
                    name: 'Balcony',
                    bounds: { x: 1400, y: 400, width: 150, height: 100 },
                    color: '#6a6a4a',
                    tasks: []
                },
                {
                    id: 'storage-mira',
                    name: 'Storage',
                    bounds: { x: 400, y: 700, width: 150, height: 120 },
                    color: '#6a4a6a',
                    tasks: ['storage-fuel-engines']
                },
                {
                    id: 'communications-mira',
                    name: 'Communications',
                    bounds: { x: 1300, y: 600, width: 120, height: 100 },
                    color: '#4a6a6a',
                    tasks: ['communications-download-data']
                },
                {
                    id: 'medbay-mira',
                    name: 'Medbay',
                    bounds: { x: 1100, y: 700, width: 150, height: 120 },
                    color: '#4a6a6a',
                    tasks: ['medbay-submit-scan']
                }
            ],
            corridors: [
                { from: { x: 500, y: 350 }, to: { x: 700, y: 350 }, width: 60 },
                { from: { x: 780, y: 320 }, to: { x: 900, y: 320 }, width: 60 },
                { from: { x: 1050, y: 320 }, to: { x: 1200, y: 320 }, width: 60 },
                { from: { x: 800, y: 420 }, to: { x: 800, y: 600 }, width: 60 },
                { from: { x: 1100, y: 420 }, to: { x: 1100, y: 500 }, width: 60 }
            ],
            vents: [
                {
                    id: 'balcony-vent',
                    position: { x: 1450, y: 450 },
                    connections: ['medbay-mira-vent', 'cafeteria-mira-vent']
                },
                {
                    id: 'medbay-mira-vent',
                    position: { x: 1150, y: 750 },
                    connections: ['balcony-vent', 'admin-mira-vent']
                },
                {
                    id: 'admin-mira-vent',
                    position: { x: 1250, y: 350 },
                    connections: ['medbay-mira-vent', 'greenhouse-vent']
                },
                {
                    id: 'greenhouse-vent',
                    position: { x: 1100, y: 550 },
                    connections: ['admin-mira-vent', 'cafeteria-mira-vent']
                },
                {
                    id: 'cafeteria-mira-vent',
                    position: { x: 750, y: 650 },
                    connections: ['greenhouse-vent', 'balcony-vent']
                },
                {
                    id: 'reactor-mira-vent',
                    position: { x: 250, y: 450 },
                    connections: ['launchpad-vent']
                },
                {
                    id: 'launchpad-vent',
                    position: { x: 450, y: 250 },
                    connections: ['reactor-mira-vent', 'laboratory-vent']
                },
                {
                    id: 'laboratory-vent',
                    position: { x: 650, y: 350 },
                    connections: ['launchpad-vent']
                }
            ],
            spawnPoints: [
                { x: 500, y: 275 },
                { x: 520, y: 275 },
                { x: 540, y: 275 },
                { x: 560, y: 275 },
                { x: 580, y: 275 },
                { x: 500, y: 295 },
                { x: 520, y: 295 },
                { x: 540, y: 295 },
                { x: 560, y: 295 },
                { x: 580, y: 295 }
            ],
            emergencyButton: { x: 500, y: 275 },
            cameras: [
                { id: 'mira-cam-1', position: { x: 1250, y: 350 }, viewAngle: 90, range: 200 },
                { id: 'mira-cam-2', position: { x: 750, y: 650 }, viewAngle: 180, range: 200 },
                { id: 'mira-cam-3', position: { x: 1100, y: 550 }, viewAngle: 270, range: 200 },
                { id: 'mira-cam-4', position: { x: 450, y: 250 }, viewAngle: 0, range: 200 }
            ]
        });
        
        // Polus (Ice Planet Map)
        this.maps.set('polus', {
            id: 'polus',
            name: 'Polus',
            size: { width: 2200, height: 1400 },
            background: '#1a2a3a',
            rooms: [
                {
                    id: 'dropship',
                    name: 'Dropship',
                    bounds: { x: 400, y: 300, width: 200, height: 150 },
                    color: '#4a4a6a',
                    tasks: []
                },
                {
                    id: 'office-polus',
                    name: 'Office',
                    bounds: { x: 800, y: 200, width: 150, height: 120 },
                    color: '#4a4a6a',
                    tasks: []
                },
                {
                    id: 'admin-polus',
                    name: 'Admin',
                    bounds: { x: 1100, y: 250, width: 150, height: 120 },
                    color: '#4a4a6a',
                    tasks: ['admin-swipe-card']
                },
                {
                    id: 'communications-polus',
                    name: 'Communications',
                    bounds: { x: 1400, y: 200, width: 120, height: 100 },
                    color: '#4a6a6a',
                    tasks: ['communications-download-data']
                },
                {
                    id: 'weapons-polus',
                    name: 'Weapons',
                    bounds: { x: 1700, y: 300, width: 150, height: 100 },
                    color: '#6a4a4a',
                    tasks: ['weapons-clear-asteroids']
                },
                {
                    id: 'o2-polus',
                    name: 'O2',
                    bounds: { x: 1600, y: 500, width: 120, height: 100 },
                    color: '#4a6a4a',
                    tasks: ['o2-clean-filter']
                },
                {
                    id: 'electrical-polus',
                    name: 'Electrical',
                    bounds: { x: 1200, y: 600, width: 120, height: 100 },
                    color: '#6a6a4a',
                    tasks: ['electrical-fix-wiring']
                },
                {
                    id: 'storage-polus',
                    name: 'Storage',
                    bounds: { x: 800, y: 700, width: 150, height: 120 },
                    color: '#6a4a6a',
                    tasks: ['storage-fuel-engines']
                },
                {
                    id: 'security-polus',
                    name: 'Security',
                    bounds: { x: 500, y: 600, width: 100, height: 80 },
                    color: '#4a6a4a',
                    tasks: []
                },
                {
                    id: 'laboratory-polus',
                    name: 'Laboratory',
                    bounds: { x: 1400, y: 800, width: 180, height: 120 },
                    color: '#4a6a4a',
                    tasks: []
                },
                {
                    id: 'specimen-room',
                    name: 'Specimen Room',
                    bounds: { x: 1700, y: 700, width: 150, height: 120 },
                    color: '#6a4a6a',
                    tasks: []
                },
                {
                    id: 'decontamination',
                    name: 'Decontamination',
                    bounds: { x: 1000, y: 500, width: 100, height: 60 },
                    color: '#4a6a4a',
                    tasks: []
                }
            ],
            corridors: [
                { from: { x: 600, y: 375 }, to: { x: 800, y: 375 }, width: 60 },
                { from: { x: 950, y: 260 }, to: { x: 1100, y: 260 }, width: 60 },
                { from: { x: 1250, y: 310 }, to: { x: 1400, y: 310 }, width: 60 },
                { from: { x: 1050, y: 370 }, to: { x: 1050, y: 500 }, width: 60 },
                { from: { x: 1150, y: 560 }, to: { x: 1150, y: 700 }, width: 60 }
            ],
            vents: [
                {
                    id: 'security-polus-vent',
                    position: { x: 550, y: 640 },
                    connections: ['electrical-polus-vent', 'o2-polus-vent']
                },
                {
                    id: 'electrical-polus-vent',
                    position: { x: 1250, y: 650 },
                    connections: ['security-polus-vent', 'o2-polus-vent']
                },
                {
                    id: 'o2-polus-vent',
                    position: { x: 1650, y: 550 },
                    connections: ['security-polus-vent', 'electrical-polus-vent']
                },
                {
                    id: 'admin-polus-vent',
                    position: { x: 1150, y: 300 },
                    connections: ['communications-polus-vent']
                },
                {
                    id: 'communications-polus-vent',
                    position: { x: 1450, y: 250 },
                    connections: ['admin-polus-vent', 'weapons-polus-vent']
                },
                {
                    id: 'weapons-polus-vent',
                    position: { x: 1750, y: 350 },
                    connections: ['communications-polus-vent']
                },
                {
                    id: 'laboratory-polus-vent',
                    position: { x: 1450, y: 850 },
                    connections: ['specimen-vent']
                },
                {
                    id: 'specimen-vent',
                    position: { x: 1750, y: 750 },
                    connections: ['laboratory-polus-vent']
                }
            ],
            spawnPoints: [
                { x: 450, y: 375 },
                { x: 470, y: 375 },
                { x: 490, y: 375 },
                { x: 510, y: 375 },
                { x: 530, y: 375 },
                { x: 450, y: 395 },
                { x: 470, y: 395 },
                { x: 490, y: 395 },
                { x: 510, y: 395 },
                { x: 530, y: 395 }
            ],
            emergencyButton: { x: 500, y: 375 },
            cameras: [
                { id: 'polus-cam-1', position: { x: 1150, y: 300 }, viewAngle: 90, range: 200 },
                { id: 'polus-cam-2', position: { x: 1250, y: 650 }, viewAngle: 180, range: 200 },
                { id: 'polus-cam-3', position: { x: 1450, y: 850 }, viewAngle: 270, range: 200 },
                { id: 'polus-cam-4', position: { x: 550, y: 640 }, viewAngle: 0, range: 200 }
            ]
        });
    }
    
    setupCanvases() {
        // Main map canvas
        this.mapCanvas = document.getElementById('game-canvas');
        if (this.mapCanvas) {
            this.mapContext = this.mapCanvas.getContext('2d');
        }
        
        // Minimap canvas
        const minimapContainer = document.getElementById('minimap');
        if (minimapContainer) {
            this.minimapCanvas = document.createElement('canvas');
            this.minimapCanvas.width = 200;
            this.minimapCanvas.height = 150;
            this.minimapCanvas.className = 'minimap-canvas';
            
            minimapContainer.appendChild(this.minimapCanvas);
            this.minimapContext = this.minimapCanvas.getContext('2d');
        }
    }
    
    setupEventHandlers() {
        // Listen to game events
        this.engine.on('gameStarted', this.handleGameStarted.bind(this));
        this.engine.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.engine.on('ventUsed', this.handleVentUsed.bind(this));
    }
    
    async loadMap(mapId) {
        const mapData = this.maps.get(mapId);
        if (!mapData) {
            console.error(`Map not found: ${mapId}`);
            return false;
        }
        
        this.currentMap = mapData;
        
        // Initialize map components
        this.initializeRooms(mapData.rooms);
        this.initializeVents(mapData.vents);
        this.initializeSpawnPoints(mapData.spawnPoints);
        this.initializeTaskLocations(mapData.rooms);
        this.initializeEmergencyButton(mapData.emergencyButton);
        
        // Generate collision map
        this.generateCollisionMap();
        
        console.log(`🗺️ Loaded map: ${mapData.name}`);
        return true;
    }
    
    initializeRooms(roomsData) {
        this.rooms.clear();
        
        roomsData.forEach(roomData => {
            const room = {
                id: roomData.id,
                name: roomData.name,
                bounds: roomData.bounds,
                color: roomData.color,
                tasks: roomData.tasks || [],
                players: new Set(),
                isLit: true,
                temperature: 20,
                oxygenLevel: 100
            };
            
            this.rooms.set(room.id, room);
        });
    }
    
    initializeVents(ventsData) {
        this.vents.clear();
        
        ventsData.forEach(ventData => {
            const vent = {
                id: ventData.id,
                position: ventData.position,
                connections: ventData.connections,
                isOpen: false,
                isBlocked: false,
                lastUsed: 0,
                cooldown: 5000 // 5 seconds
            };
            
            this.vents.set(vent.id, vent);
        });
    }
    
    initializeSpawnPoints(spawnPointsData) {
        this.spawnPoints = spawnPointsData.map(point => ({
            x: point.x,
            y: point.y,
            occupied: false
        }));
    }
    
    initializeTaskLocations(roomsData) {
        this.taskLocations.clear();
        
        roomsData.forEach(room => {
            if (room.tasks && room.tasks.length > 0) {
                room.tasks.forEach(taskId => {
                    this.taskLocations.set(taskId, {
                        taskId: taskId,
                        roomId: room.id,
                        position: {
                            x: room.bounds.x + room.bounds.width / 2,
                            y: room.bounds.y + room.bounds.height / 2
                        },
                        interactionRadius: 50
                    });
                });
            }
        });
    }
    
    initializeEmergencyButton(buttonData) {
        if (buttonData) {
            this.emergencyButton = {
                position: buttonData,
                interactionRadius: 30,
                cooldown: 0,
                usesRemaining: 1
            };
        }
    }
    
    generateCollisionMap() {
        if (!this.currentMap) return;
        
        this.walls = [];
        
        // Generate walls from room bounds
        this.currentMap.rooms.forEach(room => {
            const bounds = room.bounds;
            
            // Top wall
            this.walls.push({
                x1: bounds.x,
                y1: bounds.y,
                x2: bounds.x + bounds.width,
                y2: bounds.y
            });
            
            // Bottom wall
            this.walls.push({
                x1: bounds.x,
                y1: bounds.y + bounds.height,
                x2: bounds.x + bounds.width,
                y2: bounds.y + bounds.height
            });
            
            // Left wall
            this.walls.push({
                x1: bounds.x,
                y1: bounds.y,
                x2: bounds.x,
                y2: bounds.y + bounds.height
            });
            
            // Right wall
            this.walls.push({
                x1: bounds.x + bounds.width,
                y1: bounds.y,
                x2: bounds.x + bounds.width,
                y2: bounds.y + bounds.height
            });
        });
        
        // Add corridor openings (remove walls where corridors connect)
        if (this.currentMap.corridors) {
            this.currentMap.corridors.forEach(corridor => {
                // This would involve more complex logic to create openings
                // For now, we'll keep it simple
            });
        }
    }
    
    // Rendering methods
    render(ctx) {
        if (!this.isInitialized || !this.currentMap) return;
        
        // Clear canvas
        ctx.fillStyle = this.currentMap.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Render rooms
        this.renderRooms(ctx);
        
        // Render corridors
        this.renderCorridors(ctx);
        
        // Render vents
        this.renderVents(ctx);
        
        // Render emergency button
        this.renderEmergencyButton(ctx);
        
        // Render task locations
        this.renderTaskLocations(ctx);
    }
    
    renderRooms(ctx) {
        for (let [id, room] of this.rooms) {
            const bounds = room.bounds;
            
            // Room background
            ctx.fillStyle = room.color;
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Room border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Room name
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                room.name,
                bounds.x + bounds.width / 2,
                bounds.y + bounds.height / 2
            );
            
            // Lighting effects
            if (!room.isLit) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }
    }
    
    renderCorridors(ctx) {
        if (!this.currentMap.corridors) return;
        
        ctx.fillStyle = '#3a3a5a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        this.currentMap.corridors.forEach(corridor => {
            const width = corridor.width;
            const length = Math.sqrt(
                Math.pow(corridor.to.x - corridor.from.x, 2) +
                Math.pow(corridor.to.y - corridor.from.y, 2)
            );
            
            ctx.save();
            ctx.translate(corridor.from.x, corridor.from.y);
            
            const angle = Math.atan2(
                corridor.to.y - corridor.from.y,
                corridor.to.x - corridor.from.x
            );
            ctx.rotate(angle);
            
            ctx.fillRect(-width/2, -width/2, length, width);
            ctx.strokeRect(-width/2, -width/2, length, width);
            
            ctx.restore();
        });
    }
    
    renderVents(ctx) {
        for (let [id, vent] of this.vents) {
            const pos = vent.position;
            
            // Vent base
            ctx.fillStyle = vent.isOpen ? '#666666' : '#333333';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Vent grill
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = -10; i <= 10; i += 5) {
                ctx.moveTo(pos.x + i, pos.y - 10);
                ctx.lineTo(pos.x + i, pos.y + 10);
            }
            ctx.stroke();
            
            // Vent border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderEmergencyButton(ctx) {
        if (!this.emergencyButton) return;
        
        const pos = this.emergencyButton.position;
        
        // Button base
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Button highlight
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(pos.x - 5, pos.y - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Button border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderTaskLocations(ctx) {
        for (let [taskId, location] of this.taskLocations) {
            const pos = location.position;
            
            // Task indicator
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Task border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderMinimap() {
        if (!this.minimapContext || !this.currentMap) return;
        
        const ctx = this.minimapContext;
        const canvas = this.minimapCanvas;
        
        // Clear minimap
        ctx.fillStyle = this.currentMap.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scale
        const scaleX = canvas.width / this.currentMap.size.width;
        const scaleY = canvas.height / this.currentMap.size.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Render rooms on minimap
        for (let [id, room] of this.rooms) {
            const bounds = room.bounds;
            
            ctx.fillStyle = room.color;
            ctx.fillRect(
                bounds.x * scale,
                bounds.y * scale,
                bounds.width * scale,
                bounds.height * scale
            );
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                bounds.x * scale,
                bounds.y * scale,
                bounds.width * scale,
                bounds.height * scale
            );
        }
        
        // Render corridors on minimap
        if (this.currentMap.corridors) {
            ctx.strokeStyle = '#3a3a5a';
            ctx.lineWidth = 2;
            
            this.currentMap.corridors.forEach(corridor => {
                ctx.beginPath();
                ctx.moveTo(corridor.from.x * scale, corridor.from.y * scale);
                ctx.lineTo(corridor.to.x * scale, corridor.to.y * scale);
                ctx.stroke();
            });
        }
    }
    
    // Utility methods
    getRoomAtPosition(x, y) {
        for (let [id, room] of this.rooms) {
            const bounds = room.bounds;
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                return room;
            }
        }
        return null;
    }
    
    getVentAtPosition(x, y, radius = 30) {
        for (let [id, vent] of this.vents) {
            const distance = Math.sqrt(
                Math.pow(x - vent.position.x, 2) +
                Math.pow(y - vent.position.y, 2)
            );
            
            if (distance <= radius) {
                return vent;
            }
        }
        return null;
    }
    
    getSpawnPoint(index) {
        if (index >= 0 && index < this.spawnPoints.length) {
            return this.spawnPoints[index];
        }
        return this.spawnPoints[0] || { x: 0, y: 0 };
    }
    
    getRandomSpawnPoint() {
        const availableSpawns = this.spawnPoints.filter(spawn => !spawn.occupied);
        if (availableSpawns.length === 0) {
            return this.spawnPoints[0] || { x: 0, y: 0 };
        }
        
        const randomIndex = Math.floor(Math.random() * availableSpawns.length);
        return availableSpawns[randomIndex];
    }
    
    isPositionWalkable(x, y) {
        // Check if position is inside any room or corridor
        const room = this.getRoomAtPosition(x, y);
        if (room) return true;
        
        // Check corridors
        if (this.currentMap.corridors) {
            for (let corridor of this.currentMap.corridors) {
                // Simplified corridor collision check
                const distance = this.distanceToLineSegment(
                    { x, y },
                    corridor.from,
                    corridor.to
                );
                
                if (distance <= corridor.width / 2) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Event handlers
    handleGameStarted(data) {
        // Reset map state for new game
        for (let [id, room] of this.rooms) {
            room.players.clear();
            room.isLit = true;
            room.oxygenLevel = 100;
        }
        
        for (let [id, vent] of this.vents) {
            vent.isOpen = false;
            vent.lastUsed = 0;
        }
        
        if (this.emergencyButton) {
            this.emergencyButton.cooldown = 0;
            this.emergencyButton.usesRemaining = 1;
        }
    }
    
    handlePlayerMoved(data) {
        const { player, oldPosition } = data;
        
        // Update room occupancy
        if (oldPosition) {
            const oldRoom = this.getRoomAtPosition(oldPosition.x, oldPosition.y);
            if (oldRoom) {
                oldRoom.players.delete(player.id);
            }
        }
        
        const newRoom = this.getRoomAtPosition(player.position.x, player.position.y);
        if (newRoom) {
            newRoom.players.add(player.id);
        }
    }
    
    handleVentUsed(data) {
        const { playerId, ventId } = data;
        const vent = this.vents.get(ventId);
        
        if (vent) {
            vent.isOpen = true;
            vent.lastUsed = Date.now();
            
            // Close vent after a delay
            setTimeout(() => {
                vent.isOpen = false;
            }, 3000);
        }
    }
    
    // Public API methods
    getCurrentMap() {
        return this.currentMap;
    }
    
    getMapList() {
        return Array.from(this.maps.keys());
    }
    
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    
    getVent(ventId) {
        return this.vents.get(ventId);
    }
    
    getTaskLocation(taskId) {
        return this.taskLocations.get(taskId);
    }
    
    // Update method
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update vent cooldowns
        const currentTime = Date.now();
        for (let [id, vent] of this.vents) {
            if (vent.lastUsed > 0 && currentTime - vent.lastUsed > vent.cooldown) {
                vent.lastUsed = 0;
            }
        }
        
        // Update emergency button cooldown
        if (this.emergencyButton && this.emergencyButton.cooldown > 0) {
            this.emergencyButton.cooldown = Math.max(0, this.emergencyButton.cooldown - deltaTime);
        }
        
        // Render minimap
        this.renderMinimap();
    }
    
    // Cleanup
    destroy() {
        this.currentMap = null;
        this.maps.clear();
        this.mapAssets.clear();
        this.rooms.clear();
        this.vents.clear();
        this.taskLocations.clear();
        this.spawnPoints = [];
        this.walls = [];
        this.emergencyButton = null;
        
        this.isInitialized = false;
        console.log('🗺️ Map system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Maps = AmongUsV3Maps;