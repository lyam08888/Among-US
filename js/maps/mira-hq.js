class MiraHQ {
    constructor() {
        this.rooms = {
            launchpad: {
                name: 'Launchpad',
                connections: ['communications', 'medbay'],
                tasks: ['scanBoardingPass', 'fixWiring'],
                dimensions: { width: 600, height: 400 },
                spawnPoints: [
                    { x: 300, y: 200 },
                    { x: 350, y: 200 },
                    { x: 250, y: 200 }
                ],
                vents: []
            },
            communications: {
                name: 'Communications',
                connections: ['launchpad', 'storage', 'locker'],
                tasks: ['processSample', 'uploadData'],
                vents: [{ x: 150, y: 150, connects: ['reactor', 'laboratory'] }],
                dimensions: { width: 500, height: 400 }
            },
            laboratory: {
                name: 'Laboratory',
                connections: ['reactor', 'office'],
                tasks: ['sortSamples', 'assembleMicroscope', 'processData'],
                vents: [{ x: 250, y: 150, connects: ['communications', 'office'] }],
                dimensions: { width: 700, height: 500 },
                specialFeatures: {
                    decontamination: {
                        entrance: { x: 50, y: 250 },
                        exit: { x: 650, y: 250 },
                        duration: 5000
                    }
                }
            }
            // ... autres salles
        };

        this.uniqueFeatures = {
            doorLog: {
                locations: [
                    { id: 'mainEntrance', between: ['launchpad', 'communications'] },
                    { id: 'labEntrance', between: ['laboratory', 'reactor'] }
                ],
                loggedIn: 'communications'
            },
            ventSystem: {
                type: 'interconnected',
                description: 'All vents are connected in MIRA HQ'
            }
        };

        this.securitySystem = {
            type: 'doorLog',
            location: 'communications',
            features: ['playerTracking', 'doorStatus']
        };
    }

    getRandomSpawnPoint() {
        const spawnRoom = this.rooms.launchpad;
        return spawnRoom.spawnPoints[Math.floor(Math.random() * spawnRoom.spawnPoints.length)];
    }

    getDoorLogData(timeRange) {
        // Simule les données du système de log des portes
        return this.uniqueFeatures.doorLog.locations.map(location => ({
            doorId: location.id,
            passages: this.generatePassageData(timeRange)
        }));
    }

    generatePassageData(timeRange) {
        const passages = [];
        const [startTime, endTime] = timeRange;
        let currentTime = startTime;

        while (currentTime < endTime) {
            if (Math.random() < 0.3) { // 30% chance of passage
                passages.push({
                    time: currentTime,
                    direction: Math.random() < 0.5 ? 'enter' : 'exit',
                    color: ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)]
                });
            }
            currentTime += Math.random() * 10000; // Random interval between passages
        }

        return passages;
    }

    // Méthodes spécifiques à MIRA HQ
    handleDecontamination(playerPosition, currentRoom) {
        if (currentRoom === 'laboratory' && this.rooms.laboratory.specialFeatures.decontamination) {
            const decon = this.rooms.laboratory.specialFeatures.decontamination;
            
            // Vérifie si le joueur est à l'entrée de la décontamination
            if (this.isNearPoint(playerPosition, decon.entrance)) {
                return {
                    startDecon: true,
                    duration: decon.duration,
                    exitPoint: decon.exit
                };
            }
        }
        return null;
    }

    isNearPoint(pos1, pos2, threshold = 30) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }
}
