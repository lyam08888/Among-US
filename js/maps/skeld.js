class SkeldMap {
    constructor() {
        this.rooms = {
            cafeteria: {
                name: 'Cafeteria',
                connections: ['admin', 'weapons', 'medbay', 'storage'],
                tasks: ['clearGarbage', 'uploadData', 'fixWiring'],
                vents: [{ x: 100, y: 100, connects: ['admin', 'security'] }],
                dimensions: { width: 800, height: 600 },
                spawnPoints: [
                    { x: 400, y: 300 },
                    { x: 450, y: 300 },
                    { x: 350, y: 300 }
                ],
                interactables: [
                    { type: 'emergencyButton', x: 400, y: 300 },
                    { type: 'table', x: 400, y: 400 }
                ]
            },
            admin: {
                name: 'Admin',
                connections: ['cafeteria', 'storage'],
                tasks: ['swipeCard', 'uploadData'],
                vents: [{ x: 50, y: 50, connects: ['cafeteria'] }],
                dimensions: { width: 400, height: 300 }
            }
            // Ajoutez d'autres salles ici
        };

        this.securityCameras = {
            locations: [
                { room: 'cafeteria', x: 200, y: 150 },
                { room: 'admin', x: 100, y: 100 }
            ],
            viewableFrom: 'security'
        };

        this.emergencyLocations = ['cafeteria'];
        this.commonTasks = ['fixWiring', 'uploadData'];
        this.longTasks = ['clearAsteroids', 'alignEngineOutput'];
        this.shortTasks = ['swipeCard', 'chartCourse'];
    }

    getRandomSpawnPoint() {
        const room = this.rooms.cafeteria;
        const spawnPoints = room.spawnPoints;
        return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    }

    getTaskLocations() {
        const taskLocations = {};
        for (const [roomName, room] of Object.entries(this.rooms)) {
            if (room.tasks) {
                room.tasks.forEach(task => {
                    if (!taskLocations[task]) taskLocations[task] = [];
                    taskLocations[task].push(roomName);
                });
            }
        }
        return taskLocations;
    }

    isValidPath(from, to) {
        if (!this.rooms[from] || !this.rooms[to]) return false;
        return this.rooms[from].connections.includes(to);
    }

    getVentConnections(room, ventIndex) {
        if (!this.rooms[room]?.vents[ventIndex]) return [];
        return this.rooms[room].vents[ventIndex].connects;
    }
}
