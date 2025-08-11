class Polus {
    constructor() {
        this.rooms = {
            dropship: {
                name: 'Dropship',
                connections: ['office'],
                tasks: ['chartCourse', 'insertKeys'],
                dimensions: { width: 500, height: 300 },
                spawnPoints: [
                    { x: 250, y: 150 },
                    { x: 300, y: 150 },
                    { x: 200, y: 150 }
                ],
                weatherEffects: {
                    snow: true,
                    windStrength: 0.5
                }
            },
            office: {
                name: 'Office',
                connections: ['dropship', 'admin', 'laboratory'],
                tasks: ['swipeCard', 'scanBoardingPass'],
                vents: [{ x: 100, y: 100, connects: ['admin', 'communications'] }],
                dimensions: { width: 600, height: 400 },
                weatherEffects: {
                    snow: true,
                    windStrength: 0.7
                }
            },
            laboratory: {
                name: 'Laboratory',
                connections: ['office', 'storage', 'medbay'],
                tasks: ['repairDrill', 'alignTelescope', 'recordTemperature'],
                vents: [{ x: 200, y: 150, connects: ['office', 'storage'] }],
                dimensions: { width: 800, height: 600 },
                specialFeatures: {
                    lavaPool: {
                        position: { x: 400, y: 300 },
                        radius: 100,
                        damage: 100 // Instant kill
                    }
                }
            }
            // ... autres salles
        };

        this.uniqueFeatures = {
            weather: {
                types: ['snow', 'blizzard'],
                affects: ['visibility', 'movement'],
                intensity: {
                    min: 0,
                    max: 1,
                    current: 0.5
                }
            },
            vitals: {
                location: 'office',
                updateInterval: 1000,
                showsHistory: true
            },
            lavaPools: [
                {
                    room: 'laboratory',
                    position: { x: 400, y: 300 },
                    radius: 100
                }
                // ... autres zones de lave
            ]
        };

        this.securitySystem = {
            type: 'cameras',
            locations: [
                { room: 'office', x: 300, y: 200 },
                { room: 'laboratory', x: 400, y: 300 }
            ],
            viewableFrom: 'security'
        };
    }

    // Méthodes spécifiques à Polus
    updateWeather(deltaTime) {
        // Mise à jour dynamique des conditions météo
        const weather = this.uniqueFeatures.weather;
        
        // Change aléatoirement l'intensité
        weather.intensity.current += (Math.random() - 0.5) * 0.1;
        weather.intensity.current = Math.max(weather.intensity.min, 
                                          Math.min(weather.intensity.max, 
                                                 weather.intensity.current));

        // Retourne les effets actuels
        return {
            visibility: 1 - weather.intensity.current * 0.7, // 30% de visibilité minimum
            movementPenalty: weather.intensity.current * 0.3, // Jusqu'à 30% plus lent
            type: weather.intensity.current > 0.7 ? 'blizzard' : 'snow'
        };
    }

    handleLavaCollision(playerPosition, currentRoom) {
        if (!this.rooms[currentRoom]?.specialFeatures?.lavaPool) return false;

        const lavaPool = this.rooms[currentRoom].specialFeatures.lavaPool;
        const distance = this.calculateDistance(playerPosition, lavaPool.position);
        
        return distance < lavaPool.radius;
    }

    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getVitalsData(players) {
        return players.map(player => ({
            id: player.id,
            alive: player.isAlive,
            lastUpdate: Date.now(),
            timeSinceDeath: player.isAlive ? null : Date.now() - player.deathTime
        }));
    }
}
