// Among Us V3 - Game Logic System
class AmongUsV3GameLogic {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Game state
        this.gamePhase = 'lobby'; // lobby, playing, meeting, voting, ended
        this.gameSettings = {
            maxPlayers: 15,
            numImpostors: 2,
            killCooldown: 45,
            emergencyMeetings: 1,
            emergencyCooldown: 15,
            discussionTime: 15,
            votingTime: 120,
            playerSpeed: 1.0,
            crewmateVision: 1.0,
            impostorVision: 1.5,
            killDistance: 1.0,
            taskBarUpdates: 'always',
            commonTasks: 1,
            longTasks: 1,
            shortTasks: 2,
            visualTasks: true,
            confirmEjects: true,
            anonymousVotes: false,
            // Nouvelles options avancées
            roleSettings: {
                detective: { enabled: true, cooldown: 30 },
                medic: { enabled: true, shieldCooldown: 45 },
                engineer: { enabled: true, ventCooldown: 30 },
                scientist: { enabled: true, batteryCooldown: 60 }
            },
            advancedOptions: {
                bodyDragEnabled: true,
                ventRandomization: true,
                taskShuffling: true,
                adaptiveDifficulty: true,
                hiddenRoles: false,
                proximityChat: true,
                customWinConditions: true
            },
            mapModifiers: {
                randomEvents: true,
                dynamicHazards: true,
                secretPassages: true,
                weatherEffects: true
            },
            gameBalance: {
                taskCompletionWeight: 1.0,
                killPenaltyWeight: 1.5,
                votingAccuracyBonus: 0.5,
                sabotageImpact: 1.0
            }
        };
    }
}

// Among Us V3 - Game Logic System
class AmongUsV3GameLogic {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Game state
        this.gamePhase = 'lobby'; // lobby, playing, meeting, voting, ended
        this.gameSettings = {
            maxPlayers: 15,
            numImpostors: 2,
            killCooldown: 45,
            emergencyMeetings: 1,
            emergencyCooldown: 15,
            discussionTime: 15,
            votingTime: 120,
            playerSpeed: 1.0,
            crewmateVision: 1.0,
            impostorVision: 1.5,
            killDistance: 1.0,
            taskBarUpdates: 'always',
            commonTasks: 1,
            longTasks: 1,
            shortTasks: 2,
            visualTasks: true,
            confirmEjects: true,
            anonymousVotes: false,
            roles: {
                detective: { enabled: true, cooldown: 30 },
                medic: { enabled: true, cooldown: 45 },
                engineer: { enabled: true, cooldown: 30 },
                scientist: { enabled: true, cooldown: 60 }
            },
            advanced: {
                bodyDragging: true,
                ventRandomization: true,
                taskShuffling: true,
                adaptiveDifficulty: true,
                proximityChat: true
            },
            modifiers: {
                randomEvents: true,
                hazards: true,
                secretPassages: true,
                weather: true
            }
        };
        
        // Game data
        this.players = new Map();
        this.tasks = new Map();
        this.sabotages = new Map();
        this.votes = new Map();
        this.deadBodies = [];
        
        // Game timers
        this.gameTimer = 0;
        this.meetingTimer = 0;
        this.killCooldowns = new Map();
        this.sabotageTimer = 0;
        
        // Game statistics
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            tasksCompleted: 0,
            playersKilled: 0,
            meetingsCalled: 0,
            votesCorrect: 0
        };
        
        console.log('🎮 Game Logic system created');
    }
    
    async initialize() {
        try {
            // Initialize game systems
            this.setupEventHandlers();
            this.initializeTasks();
            this.initializeSabotages();
            
            this.isInitialized = true;
            console.log('🎮 Game Logic system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize game logic:', error);
        }
    }
    
    setupEventHandlers() {
        // Listen to engine events
        this.engine.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.engine.on('playerLeft', this.handlePlayerLeft.bind(this));
        this.engine.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.engine.on('taskCompleted', this.handleTaskCompleted.bind(this));
        this.engine.on('playerKilled', this.handlePlayerKilled.bind(this));
        this.engine.on('emergencyMeeting', this.handleEmergencyMeeting.bind(this));
        this.engine.on('voteReceived', this.handleVoteReceived.bind(this));
        this.engine.on('sabotageTriggered', this.handleSabotageTriggered.bind(this));
    }
    
    initializeTasks() {
        // Define available tasks
        const taskDefinitions = [
            { id: 'admin-swipe', name: 'Admin: Swipe Card', type: 'common', location: 'admin', duration: 3000 },
            { id: 'electrical-wires', name: 'Electrical: Fix Wiring', type: 'common', location: 'electrical', duration: 5000 },
            { id: 'medbay-scan', name: 'Medbay: Submit Scan', type: 'visual', location: 'medbay', duration: 10000 },
            { id: 'weapons-asteroids', name: 'Weapons: Clear Asteroids', type: 'long', location: 'weapons', duration: 15000 },
            { id: 'shields-prime', name: 'Shields: Prime Shields', type: 'short', location: 'shields', duration: 2000 },
            { id: 'o2-filter', name: 'O2: Clean O2 Filter', type: 'short', location: 'o2', duration: 3000 },
            { id: 'navigation-course', name: 'Navigation: Chart Course', type: 'short', location: 'navigation', duration: 4000 },
            { id: 'reactor-manifolds', name: 'Reactor: Start Reactor', type: 'long', location: 'reactor', duration: 12000 },
            { id: 'storage-fuel', name: 'Storage: Fuel Engines', type: 'long', location: 'storage', duration: 8000 },
            { id: 'cafeteria-garbage', name: 'Cafeteria: Empty Garbage', type: 'short', location: 'cafeteria', duration: 2500 }
        ];
        
        taskDefinitions.forEach(task => {
            this.tasks.set(task.id, task);
        });
    }
    
    initializeSabotages() {
        // Define available sabotages
        const sabotageDefinitions = [
            { id: 'reactor-meltdown', name: 'Reactor Meltdown', type: 'critical', duration: 30000, locations: ['reactor'] },
            { id: 'o2-depletion', name: 'O2 Sabotage', type: 'critical', duration: 30000, locations: ['o2', 'admin'] },
            { id: 'lights-out', name: 'Lights', type: 'normal', duration: 0, locations: ['electrical'] },
            { id: 'comms-disrupted', name: 'Communications', type: 'normal', duration: 0, locations: ['communications'] },
            { id: 'doors-locked', name: 'Doors', type: 'normal', duration: 10000, locations: ['security'] }
        ];
        
        sabotageDefinitions.forEach(sabotage => {
            this.sabotages.set(sabotage.id, sabotage);
        });
    }
    
    // Game flow methods
    startGame(players, settings = {}) {
        // Apply custom settings
        Object.assign(this.gameSettings, settings);
        
        // Assign roles
        const playerList = Array.from(players.values());
        this.assignRoles(playerList);
        
        // Assign tasks to crewmates
        this.assignTasks(playerList);
        
        // Initialize game state
        this.gamePhase = 'playing';
        this.gameTimer = 0;
        this.votes.clear();
        this.deadBodies = [];
        
        // Reset cooldowns
        this.killCooldowns.clear();
        playerList.forEach(player => {
            if (player.role === 'impostor') {
                this.killCooldowns.set(player.id, 0);
            }
        });
        
        this.engine.emit('gameStarted', {
            players: playerList,
            settings: this.gameSettings
        });
        
        console.log('🎮 Game started with', playerList.length, 'players');
    }
    
    assignRoles(players) {
        // Shuffle players
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        
        // Assign impostors
        const numImpostors = Math.min(this.gameSettings.numImpostors, Math.floor(players.length / 2));
        
        for (let i = 0; i < numImpostors; i++) {
            shuffled[i].role = 'impostor';
            shuffled[i].tasks = [];
        }
        
        // Assign crewmates
        for (let i = numImpostors; i < shuffled.length; i++) {
            shuffled[i].role = 'crewmate';
        }
    }
    
    assignTasks(players) {
        const crewmates = players.filter(p => p.role === 'crewmate');
        const taskList = Array.from(this.tasks.values());
        
        crewmates.forEach(player => {
            player.tasks = [];
            
            // Assign common tasks
            const commonTasks = taskList.filter(t => t.type === 'common')
                .slice(0, this.gameSettings.commonTasks);
            player.tasks.push(...commonTasks);
            
            // Assign long tasks
            const longTasks = taskList.filter(t => t.type === 'long')
                .sort(() => Math.random() - 0.5)
                .slice(0, this.gameSettings.longTasks);
            player.tasks.push(...longTasks);
            
            // Assign short tasks
            const shortTasks = taskList.filter(t => t.type === 'short')
                .sort(() => Math.random() - 0.5)
                .slice(0, this.gameSettings.shortTasks);
            player.tasks.push(...shortTasks);
            
            // Mark all tasks as incomplete
            player.tasks.forEach(task => {
                task.completed = false;
                task.progress = 0;
            });
        });
    }
    
    // Game update
    update(deltaTime) {
        if (!this.isInitialized || this.gamePhase === 'lobby') return;
        
        this.gameTimer += deltaTime;
        
        // Update cooldowns
        this.updateCooldowns(deltaTime);
        
        // Check win conditions
        this.checkWinConditions();
        
        // Update sabotages
        this.updateSabotages(deltaTime);
        
        // Update meeting timer
        if (this.gamePhase === 'meeting' || this.gamePhase === 'voting') {
            this.updateMeetingTimer(deltaTime);
        }
    }
    
    updateCooldowns(deltaTime) {
        // Update kill cooldowns
        for (let [playerId, cooldown] of this.killCooldowns) {
            if (cooldown > 0) {
                this.killCooldowns.set(playerId, Math.max(0, cooldown - deltaTime));
            }
        }
        
        // Update sabotage timer
        if (this.sabotageTimer > 0) {
            this.sabotageTimer = Math.max(0, this.sabotageTimer - deltaTime);
        }
    }
    
    checkWinConditions() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.isAlive);
        const aliveCrewmates = alivePlayers.filter(p => p.role === 'crewmate');
        const aliveImpostors = alivePlayers.filter(p => p.role === 'impostor');
        
        // Impostors win if they equal or outnumber crewmates
        if (aliveImpostors.length >= aliveCrewmates.length && aliveImpostors.length > 0) {
            this.endGame('impostors', 'Impostors eliminated enough crewmates');
            return;
        }
        
        // Crewmates win if all impostors are eliminated
        if (aliveImpostors.length === 0) {
            this.endGame('crewmates', 'All impostors eliminated');
            return;
        }
        
        // Crewmates win if all tasks are completed
        const allTasks = aliveCrewmates.flatMap(p => p.tasks || []);
        const completedTasks = allTasks.filter(t => t.completed);
        
        if (allTasks.length > 0 && completedTasks.length === allTasks.length) {
            this.endGame('crewmates', 'All tasks completed');
            return;
        }
    }
    
    updateSabotages(deltaTime) {
        // Handle active sabotages
        // This would be expanded with specific sabotage logic
    }
    
    updateMeetingTimer(deltaTime) {
        this.meetingTimer -= deltaTime;
        
        if (this.meetingTimer <= 0) {
            if (this.gamePhase === 'meeting') {
                // Move to voting phase
                this.gamePhase = 'voting';
                this.meetingTimer = this.gameSettings.votingTime * 1000;
                this.engine.emit('votingStarted');
            } else if (this.gamePhase === 'voting') {
                // End voting and return to game
                this.processVotes();
            }
        }
    }
    
    // Event handlers
    handlePlayerJoined(data) {
        const { player } = data;
        this.players.set(player.id, player);
    }
    
    handlePlayerLeft(data) {
        const { player } = data;
        this.players.delete(player.id);
        this.killCooldowns.delete(player.id);
    }
    
    handlePlayerMoved(data) {
        const { player } = data;
        if (this.players.has(player.id)) {
            this.players.set(player.id, player);
        }
    }
    
    handleTaskCompleted(data) {
        const { player, taskId } = data;
        const gamePlayer = this.players.get(player.id);
        
        if (gamePlayer && gamePlayer.tasks) {
            const task = gamePlayer.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = true;
                task.progress = 100;
                this.stats.tasksCompleted++;
                
                this.engine.emit('taskProgressUpdated', {
                    player: gamePlayer,
                    task,
                    totalProgress: this.calculateTaskProgress()
                });
            }
        }
    }
    
    handlePlayerKilled(data) {
        const { killer, victim } = data;
        
        // Add dead body
        this.deadBodies.push({
            playerId: victim.id,
            position: victim.position,
            timestamp: Date.now()
        });
        
        // Reset killer's cooldown
        if (killer) {
            this.killCooldowns.set(killer.id, this.gameSettings.killCooldown * 1000);
            this.stats.playersKilled++;
        }
    }
    
    handleEmergencyMeeting(data) {
        this.startMeeting(data.caller, data.reason);
    }
    
    handleVoteReceived(data) {
        const { voterId, targetId } = data;
        this.votes.set(voterId, targetId);
    }
    
    handleSabotageTriggered(data) {
        const { sabotageType, location, playerId } = data;
        // Handle sabotage activation
        this.activateSabotage(sabotageType, location);
    }
    
    // Game actions
    startMeeting(caller, reason) {
        this.gamePhase = 'meeting';
        this.meetingTimer = this.gameSettings.discussionTime * 1000;
        this.votes.clear();
        this.stats.meetingsCalled++;
        
        this.engine.emit('meetingStarted', {
            caller,
            reason,
            discussionTime: this.gameSettings.discussionTime
        });
    }
    
    processVotes() {
        const voteCount = new Map();
        const skipVotes = [];
        
        // Count votes
        for (let [voterId, targetId] of this.votes) {
            if (targetId === 'skip') {
                skipVotes.push(voterId);
            } else {
                voteCount.set(targetId, (voteCount.get(targetId) || 0) + 1);
            }
        }
        
        // Find player with most votes
        let maxVotes = skipVotes.length;
        let ejectedPlayer = null;
        
        for (let [playerId, votes] of voteCount) {
            if (votes > maxVotes) {
                maxVotes = votes;
                ejectedPlayer = this.players.get(playerId);
            }
        }
        
        // Eject player if they have majority
        if (ejectedPlayer) {
            ejectedPlayer.isAlive = false;
            this.engine.emit('playerEjected', {
                player: ejectedPlayer,
                votes: maxVotes,
                wasImpostor: ejectedPlayer.role === 'impostor'
            });
        } else {
            this.engine.emit('noEjection', { skipVotes: skipVotes.length });
        }
        
        // Return to game
        this.gamePhase = 'playing';
        this.meetingTimer = 0;
        this.votes.clear();
    }
    
    activateSabotage(sabotageType, location) {
        const sabotage = this.sabotages.get(sabotageType);
        if (sabotage) {
            this.engine.emit('sabotageActivated', {
                sabotage,
                location,
                duration: sabotage.duration
            });
        }
    }
    
    endGame(winner, reason) {
        this.gamePhase = 'ended';
        this.stats.gamesPlayed++;
        
        if (winner === 'crewmates') {
            // Check if local player is crewmate
            // This would be determined by the networking system
        }
        
        this.engine.emit('gameEnded', {
            winner,
            reason,
            stats: this.stats,
            duration: this.gameTimer
        });
        
        console.log('🎮 Game ended:', winner, 'won -', reason);
    }
    
    // Utility methods
    calculateTaskProgress() {
        const allPlayers = Array.from(this.players.values());
        const crewmates = allPlayers.filter(p => p.role === 'crewmate' && p.isAlive);
        
        let totalTasks = 0;
        let completedTasks = 0;
        
        crewmates.forEach(player => {
            if (player.tasks) {
                totalTasks += player.tasks.length;
                completedTasks += player.tasks.filter(t => t.completed).length;
            }
        });
        
        return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    }
    
    getGameState() {
        return {
            phase: this.gamePhase,
            timer: this.gameTimer,
            meetingTimer: this.meetingTimer,
            players: Array.from(this.players.values()),
            taskProgress: this.calculateTaskProgress(),
            deadBodies: this.deadBodies,
            settings: this.gameSettings
        };
    }
    
    // Cleanup
    destroy() {
        this.players.clear();
        this.tasks.clear();
        this.sabotages.clear();
        this.votes.clear();
        this.killCooldowns.clear();
        this.deadBodies = [];
        
        this.isInitialized = false;
        this.gamePhase = 'lobby';
        
        console.log('🎮 Game Logic system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3GameLogic = AmongUsV3GameLogic;