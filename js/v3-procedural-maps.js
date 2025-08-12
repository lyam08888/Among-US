// Among Us V3 - Procedural Map Integration
// Integrates the TypeScript procedural map generator with the existing map system

class AmongUsV3ProceduralMaps {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        this.currentProceduralMap = null;
        this.mapGenerator = null;
        
        console.log('🗺️ Procedural map system created');
    }

    async initialize() {
        try {
            this.isInitialized = true;
            console.log('🗺️ Procedural map system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize procedural map system:', error);
        }
    }

    generateProceduralLevel(seed = 'default-seed') {
        const config = {
            seed: seed,
            width: 96,
            height: 64,
            tileSize: 32,
            roomCount: 12,
            roomMin: { x: 6, y: 5 },
            roomMax: { x: 14, y: 10 },
            corridorWidth: 2,
            doorChance: 0.3,
            theme: {
                name: 'Procedural',
                floorTile: 1,
                wallTile: 2,
                doorTile: 3,
                ventTile: 4,
                decoTiles: [5, 6, 7, 8, 9, 10]
            },
            props: {
                density: 0.05,
                defs: [
                    { id: 'table', w: 3, h: 2, kind: 'table', tile: 5, blocking: true },
                    { id: 'console', w: 2, h: 1, kind: 'console', tile: 6, blocking: true, nearWall: true },
                    { id: 'crate', w: 1, h: 1, kind: 'crate', tile: 7, blocking: true },
                    { id: 'chair', w: 1, h: 1, kind: 'chair', tile: 8, blocking: false },
                    { id: 'plant', w: 1, h: 1, kind: 'plant', tile: 9, blocking: false },
                    { id: 'light', w: 1, h: 1, kind: 'light', tile: 10, blocking: false }
                ]
            },
            tasks: { count: 15 },
            vents: { pairs: 4 },
            ensureLoop: true
        };

        const levelData = this.generateLevel(config);
        return this.convertToAmongUsFormat(levelData);
    }

    generateLevel(config) {
        // RNG functions
        const mulberry32 = (seed) => {
            return () => {
                let t = seed += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        };

        const hashString = (s) => {
            let h = 2166136261 >>> 0;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0;
        };

        // Helper functions
        const makeGrid = (w, h, val) => {
            return Array.from({ length: h }, () => Array.from({ length: w }, () => val));
        };

        const rectsOverlap = (a, b, pad = 0) => {
            return !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || 
                     a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);
        };

        const center = (r) => ({
            x: Math.floor(r.x + r.w / 2),
            y: Math.floor(r.y + r.h / 2)
        });

        const distance = (a, b) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        // Generate rooms
        const generateRooms = (cfg, rnd) => {
            const rooms = [];
            let tries = 0;
            const maxTries = cfg.roomCount * 20;
            
            while (rooms.length < cfg.roomCount && tries++ < maxTries) {
                const w = Math.floor(cfg.roomMin.x + rnd() * (cfg.roomMax.x - cfg.roomMin.x));
                const h = Math.floor(cfg.roomMin.y + rnd() * (cfg.roomMax.y - cfg.roomMin.y));
                const x = Math.floor(2 + rnd() * (cfg.width - w - 4));
                const y = Math.floor(2 + rnd() * (cfg.height - h - 4));
                const r = { x, y, w, h };
                
                if (!rooms.some(o => rectsOverlap(o, r, 2))) {
                    rooms.push(r);
                }
            }
            return rooms;
        };

        // Build MST for corridors
        const buildMST = (rooms) => {
            const edges = [];
            for (let i = 0; i < rooms.length; i++) {
                for (let j = i + 1; j < rooms.length; j++) {
                    edges.push({ a: i, b: j, w: distance(center(rooms[i]), center(rooms[j])) });
                }
            }
            edges.sort((x, y) => x.w - y.w);
            
            const parent = Array.from(rooms, (_, i) => i);
            const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
            const join = (a, b) => parent[find(a)] = find(b);
            
            const mst = [];
            for (const e of edges) {
                if (find(e.a) !== find(e.b)) {
                    join(e.a, e.b);
                    mst.push([e.a, e.b]);
                }
            }
            return mst;
        };

        // Carve corridors
        const carveCorridor = (grid, a, b, width, tile) => {
            const rnd = Math.random();
            const horizFirst = rnd < 0.5;
            const mid = horizFirst ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
            
            const carveLine = (p, q) => {
                const dx = Math.sign(q.x - p.x);
                const dy = Math.sign(q.y - p.y);
                let x = p.x, y = p.y;
                
                while (x !== q.x || y !== q.y) {
                    for (let ox = -(width >> 1); ox <= (width >> 1); ox++) {
                        for (let oy = -(width >> 1); oy <= (width >> 1); oy++) {
                            const gx = x + ox;
                            const gy = y + oy;
                            if (grid[gy] && grid[gy][gx] !== undefined) {
                                grid[gy][gx] = tile;
                            }
                        }
                    }
                    if (x !== q.x) x += dx;
                    else if (y !== q.y) y += dy;
                }
                
                for (let ox = -(width >> 1); ox <= (width >> 1); ox++) {
                    for (let oy = -(width >> 1); oy <= (width >> 1); oy++) {
                        const gx = q.x + ox;
                        const gy = q.y + oy;
                        if (grid[gy] && grid[gy][gx] !== undefined) {
                            grid[gy][gx] = tile;
                        }
                    }
                }
            };
            
            carveLine(a, mid);
            carveLine(mid, b);
        };

        // Generate the map
        const rnd = mulberry32(hashString(config.seed) || 1);
        const W = config.width;
        const H = config.height;
        
        const floor = makeGrid(W, H, 0);
        
        // 1) Generate rooms
        const rooms = generateRooms(config, rnd);
        rooms.forEach(r => {
            for (let y = r.y; y < r.y + r.h; y++) {
                for (let x = r.x; x < r.x + r.w; x++) {
                    floor[y][x] = config.theme.floorTile;
                }
            }
        });
        
        // 2) Generate corridors
        const mst = buildMST(rooms);
        mst.forEach(([i, j]) => {
            carveCorridor(floor, center(rooms[i]), center(rooms[j]), config.corridorWidth, config.theme.floorTile);
        });
        
        // 3) Generate walls
        const walls = makeGrid(W, H, 0);
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (floor[y][x] === config.theme.floorTile) {
                    for (const [dx, dy] of dirs) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (floor[ny] && floor[ny][nx] === 0) {
                            walls[ny][nx] = config.theme.wallTile;
                        }
                    }
                }
            }
        }
        
        // 4) Generate doors
        const doors = makeGrid(W, H, 0);
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (walls[y][x] !== 0) {
                    const a = floor[y][x - 1] === config.theme.floorTile && 
                             floor[y][x + 1] === config.theme.floorTile;
                    const b = floor[y - 1][x] === config.theme.floorTile && 
                             floor[y + 1][x] === config.theme.floorTile;
                    
                    if (a || b) {
                        if (Math.random() < 0.65 || Math.random() < config.doorChance) {
                            doors[y][x] = config.theme.doorTile;
                            walls[y][x] = 0;
                        }
                    }
                }
            }
        }
        
        // 5) Generate vents
        const vents = makeGrid(W, H, 0);
        const roomIdx = rooms.map((r, i) => i);
        
        for (let p = 0; p < config.vents.pairs && roomIdx.length >= 2; p++) {
            const i = Math.floor(Math.random() * roomIdx.length);
            const a = roomIdx.splice(i, 1)[0];
            const j = Math.floor(Math.random() * roomIdx.length);
            const b = roomIdx.splice(j, 1)[0];
            
            const pa = this.pickVentSpot(rooms[a], floor);
            const pb = this.pickVentSpot(rooms[b], floor);
            
            if (pa && pb) {
                vents[pa.y][pa.x] = config.theme.ventTile;
                vents[pb.y][pb.x] = config.theme.ventTile;
            }
        }
        
        // 6) Generate collision and navigation grids
        const collision = makeGrid(W, H, false);
        const nav = makeGrid(W, H, false);
        
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const isWall = walls[y][x] !== 0;
                const isDoor = doors[y][x] !== 0;
                const isFloor = floor[y][x] !== 0;
                
                collision[y][x] = isWall && !isDoor;
                nav[y][x] = isFloor || isDoor;
            }
        }
        
        // 7) Generate spawn points
        const spawns = rooms.slice(0, Math.min(4, rooms.length)).map(r => ({
            x: Math.floor((center(r).x + 0.5) * config.tileSize),
            y: Math.floor((center(r).y + 0.5) * config.tileSize)
        }));
        
        return {
            config,
            floor,
            walls,
            doors,
            vents,
            collision,
            nav,
            rooms,
            corridors: [],
            spawns,
            entities: {
                props: [],
                tasks: []
            },
            meta: { mstEdges: mst }
        };
    }

    pickVentSpot(room, floor) {
        for (let tries = 0; tries < 50; tries++) {
            const x = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            const y = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            
            if (floor[y] && floor[y][x] !== 0 && 
                floor[y] && floor[y][x + 1] !== 0 && 
                floor[y + 1] && floor[y + 1][x] !== 0) {
                return { x, y };
            }
        }
        return null;
    }

    convertToAmongUsFormat(levelData) {
        const tileSize = levelData.config.tileSize;
        
        // Convert rooms to Among Us format
        const rooms = levelData.rooms.map((room, index) => ({
            id: `room_${index}`,
            name: `Room ${index + 1}`,
            bounds: {
                x: room.x * tileSize,
                y: room.y * tileSize,
                width: room.w * tileSize,
                height: room.h * tileSize
            },
            color: '#4a4a6a',
            tasks: []
        }));

        // Convert vents
        const vents = [];
        
        for (let y = 0; y < levelData.config.height; y++) {
            for (let x = 0; x < levelData.config.width; x++) {
                if (levelData.vents[y][x] === levelData.config.theme.ventTile) {
                    const ventId = `vent_${x}_${y}`;
                    vents.push({
                        id: ventId,
                        position: {
                            x: (x + 0.5) * tileSize,
                            y: (y + 0.5) * tileSize
                        },
                        connections: []
                    });
                }
            }
        }

        // Connect nearby vents
        for (let i = 0; i < vents.length; i++) {
            for (let j = i + 1; j < vents.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(vents[i].position.x - vents[j].position.x, 2) +
                    Math.pow(vents[i].position.y - vents[j].position.y, 2)
                );
                
                if (dist < 200) {
                    vents[i].connections.push(vents[j].id);
                    vents[j].connections.push(vents[i].id);
                }
            }
        }

        // Convert spawn points
        const spawnPoints = levelData.spawns.map(spawn => ({
            x: spawn.x,
            y: spawn.y
        }));

        return {
            id: 'procedural',
            name: 'Procedural Map',
            size: {
                width: levelData.config.width * tileSize,
                height: levelData.config.height * tileSize
            },
            background: '#1a1a2e',
            rooms,
            corridors: [],
            vents,
            spawnPoints,
            emergencyButton: spawnPoints[0] || { x: 0, y: 0 },
            cameras: []
        };
    }

    // Public API methods
    getProceduralMap(seed = 'default-seed') {
        return this.generateProceduralLevel(seed);
    }

    getRandomSeed() {
        return 'proc_' + Math.random().toString(36).substr(2, 9);
    }
}

// Export for use in other modules
window.AmongUsV3ProceduralMaps = AmongUsV3ProceduralMaps;
