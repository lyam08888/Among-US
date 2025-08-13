// Among Us V4 - Game Logic
class GameLogic {
    constructor(app) {
        this.app = app;
        this.gameState = 'lobby'; // lobby, playing, discussion, voting, ended
        this.players = new Map();
        this.tasks = new Map();
        this.meetings = [];
        this.votes = new Map();
        this.gameSettings = {
            maxPlayers: 10,
            numImpostors: 2,
            killCooldown: 45000, // 45 secondes
            emergencyMeetings: 1,
            discussionTime: 15000, // 15 secondes
            votingTime: 120000, // 2 minutes
            taskBarUpdates: 'always'
        };
        
        // Timers
        this.killCooldownTimer = 0;
        this.meetingTimer = 0;
        this.gameTimer = 0;
        
        // État du jeu
        this.isGameStarted = false;
        this.isEmergencyMeeting = false;
        this.currentPhase = 'lobby';
        
        this.init();
    }
    
    init() {
        console.log('🎮 Initializing Game Logic...');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('player-killed', this.handlePlayerKilled.bind(this));
        document.addEventListener('body-reported', this.handleBodyReported.bind(this));
        document.addEventListener('emergency-meeting', this.handleEmergencyMeeting.bind(this));
        document.addEventListener('task-completed', this.handleTaskCompleted.bind(this));
        document.addEventListener('vote-cast', this.handleVoteCast.bind(this));
    }
    
    startGame() {
        console.log('🚀 Starting game...');
        this.isGameStarted = true;
        this.currentPhase = 'playing';
        this.gameTimer = Date.now();
        
        // Assigner les rôles
        this.assignRoles();
        
        // Créer les tâches
        this.createTasks();
        
        // Démarrer les timers
        this.startGameLoop();
        
        // Notifier l'interface
        this.app.onGameStarted();
    }
    
    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const numImpostors = Math.min(this.gameSettings.numImpostors, Math.floor(playerIds.length / 2));
        
        // Mélanger les joueurs
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }
        
        // Assigner les imposteurs
        for (let i = 0; i < numImpostors; i++) {
            const player = this.players.get(playerIds[i]);
            if (player) {
                player.isImpostor = true;
                player.role = 'impostor';
            }
        }
        
        // Les autres sont des crewmates
        for (let i = numImpostors; i < playerIds.length; i++) {
            const player = this.players.get(playerIds[i]);
            if (player) {
                player.isImpostor = false;
                player.role = 'crewmate';
            }
        }
        
        console.log(`👥 Roles assigned: ${numImpostors} impostors, ${playerIds.length - numImpostors} crewmates`);
    }
    
    createTasks() {
        const taskTypes = [
            { id: 'fix-wiring', name: 'Réparer les câbles', locations: ['electrical', 'admin', 'navigation'] },
            { id: 'swipe-card', name: 'Scanner la carte', locations: ['admin'] },
            { id: 'fuel-engines', name: 'Faire le plein', locations: ['storage', 'upper-engine', 'lower-engine'] },
            { id: 'calibrate-distributor', name: 'Calibrer distributeur', locations: ['electrical'] },
            { id: 'chart-course', name: 'Tracer la route', locations: ['navigation'] },
            { id: 'align-engine', name: 'Aligner moteur', locations: ['upper-engine', 'lower-engine'] },
            { id: 'inspect-sample', name: 'Analyser échantillon', locations: ['medbay'] },
            { id: 'empty-garbage', name: 'Vider poubelles', locations: ['cafeteria', 'o2'] },
            { id: 'download-data', name: 'Télécharger données', locations: ['electrical', 'navigation', 'communications'] }
        ];
        
        // Créer des tâches pour chaque crewmate
        this.players.forEach((player, playerId) => {
            if (!player.isImpostor) {
                player.tasks = [];
                
                // Assigner 3-5 tâches aléatoires
                const numTasks = 3 + Math.floor(Math.random() * 3);
                const availableTasks = [...taskTypes];
                
                for (let i = 0; i < numTasks && availableTasks.length > 0; i++) {
                    const taskIndex = Math.floor(Math.random() * availableTasks.length);
                    const task = availableTasks.splice(taskIndex, 1)[0];
                    
                    const location = task.locations[Math.floor(Math.random() * task.locations.length)];
                    
                    player.tasks.push({
                        id: `${task.id}-${i}`,
                        type: task.id,
                        name: task.name,
                        location: location,
                        completed: false
                    });
                }
            }
        });
        
        console.log('📋 Tasks created for all crewmates');
    }
    
    handlePlayerKilled(event) {
        const { killerId, victimId } = event.detail;
        
        const killer = this.players.get(killerId);
        const victim = this.players.get(victimId);
        
        if (!killer || !victim || !killer.isImpostor) return;
        
        // Marquer la victime comme morte
        victim.isDead = true;
        victim.deathTime = Date.now();
        victim.deathLocation = { x: victim.x, y: victim.y };
        
        // Démarrer le cooldown de kill
        killer.killCooldown = Date.now() + this.gameSettings.killCooldown;
        
        console.log(`💀 ${victim.name} killed by ${killer.name}`);
        
        // Vérifier les conditions de victoire
        this.checkWinConditions();
    }
    
    handleBodyReported(event) {
        const { reporterId, bodyId } = event.detail;
        
        console.log(`📢 Body reported by ${reporterId}`);
        this.startMeeting('body', reporterId, bodyId);
    }
    
    handleEmergencyMeeting(event) {
        const { callerId } = event.detail;
        
        console.log(`🚨 Emergency meeting called by ${callerId}`);
        this.startMeeting('emergency', callerId);
    }
    
    startMeeting(type, callerId, bodyId = null) {
        this.currentPhase = 'discussion';
        this.isEmergencyMeeting = type === 'emergency';
        
        const meeting = {
            id: Date.now(),
            type: type,
            callerId: callerId,
            bodyId: bodyId,
            startTime: Date.now(),
            phase: 'discussion' // discussion -> voting -> results
        };
        
        this.meetings.push(meeting);
        this.votes.clear();
        
        // Démarrer le timer de discussion
        this.meetingTimer = Date.now() + this.gameSettings.discussionTime;
        
        // Notifier l'interface
        this.app.onMeetingStarted(meeting);
        
        // Passer automatiquement au vote après le temps de discussion
        setTimeout(() => {
            this.startVoting();
        }, this.gameSettings.discussionTime);
    }
    
    startVoting() {
        this.currentPhase = 'voting';
        const currentMeeting = this.meetings[this.meetings.length - 1];
        currentMeeting.phase = 'voting';
        
        // Démarrer le timer de vote
        this.meetingTimer = Date.now() + this.gameSettings.votingTime;
        
        console.log('🗳️ Voting phase started');
        this.app.onVotingStarted();
        
        // Terminer le vote automatiquement
        setTimeout(() => {
            this.endVoting();
        }, this.gameSettings.votingTime);
    }
    
    handleVoteCast(event) {
        const { voterId, targetId } = event.detail;
        
        if (this.currentPhase !== 'voting') return;
        
        this.votes.set(voterId, targetId);
        console.log(`🗳️ ${voterId} voted for ${targetId || 'skip'}`);
        
        // Vérifier si tous les joueurs vivants ont voté
        const alivePlayers = Array.from(this.players.values()).filter(p => !p.isDead);
        if (this.votes.size >= alivePlayers.length) {
            this.endVoting();
        }
    }
    
    endVoting() {
        this.currentPhase = 'results';
        
        // Compter les votes
        const voteCount = new Map();
        let skipVotes = 0;
        
        this.votes.forEach((targetId, voterId) => {
            if (targetId === null || targetId === 'skip') {
                skipVotes++;
            } else {
                voteCount.set(targetId, (voteCount.get(targetId) || 0) + 1);
            }
        });
        
        // Trouver le joueur avec le plus de votes
        let maxVotes = skipVotes;
        let ejectedPlayerId = null;
        let tie = false;
        
        voteCount.forEach((votes, playerId) => {
            if (votes > maxVotes) {
                maxVotes = votes;
                ejectedPlayerId = playerId;
                tie = false;
            } else if (votes === maxVotes && votes > 0) {
                tie = true;
            }
        });
        
        // Éjecter le joueur si pas d'égalité
        if (!tie && ejectedPlayerId) {
            const ejectedPlayer = this.players.get(ejectedPlayerId);
            if (ejectedPlayer) {
                ejectedPlayer.isDead = true;
                ejectedPlayer.ejected = true;
                console.log(`🚀 ${ejectedPlayer.name} was ejected (${ejectedPlayer.isImpostor ? 'Impostor' : 'Crewmate'})`);
            }
        } else {
            console.log('🤝 No one was ejected (tie or skip)');
        }
        
        // Afficher les résultats
        this.app.onVotingResults({
            ejectedPlayerId,
            tie,
            skipVotes,
            voteCount: Object.fromEntries(voteCount)
        });
        
        // Retourner au jeu après 5 secondes
        setTimeout(() => {
            this.currentPhase = 'playing';
            this.app.onReturnToGame();
            this.checkWinConditions();
        }, 5000);
    }
    
    handleTaskCompleted(event) {
        const { playerId, taskId } = event.detail;
        
        const player = this.players.get(playerId);
        if (!player || player.isImpostor) return;
        
        const task = player.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            console.log(`✅ Task completed: ${task.name} by ${player.name}`);
            
            // Vérifier si toutes les tâches sont terminées
            this.checkTaskCompletion();
        }
    }
    
    checkTaskCompletion() {
        const crewmates = Array.from(this.players.values()).filter(p => !p.isImpostor && !p.isDead);
        const totalTasks = crewmates.reduce((sum, p) => sum + p.tasks.length, 0);
        const completedTasks = crewmates.reduce((sum, p) => sum + p.tasks.filter(t => t.completed).length, 0);
        
        const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
        
        // Notifier l'interface du progrès
        this.app.onTaskProgress(progress, completedTasks, totalTasks);
        
        // Victoire des crewmates si toutes les tâches sont terminées
        if (progress >= 1) {
            this.endGame('crewmates', 'tasks');
        }
    }
    
    checkWinConditions() {
        const alivePlayers = Array.from(this.players.values()).filter(p => !p.isDead);
        const aliveCrewmates = alivePlayers.filter(p => !p.isImpostor);
        const aliveImpostors = alivePlayers.filter(p => p.isImpostor);
        
        if (aliveImpostors.length === 0) {
            // Victoire des crewmates
            this.endGame('crewmates', 'elimination');
        } else if (aliveImpostors.length >= aliveCrewmates.length) {
            // Victoire des imposteurs
            this.endGame('impostors', 'elimination');
        }
    }
    
    endGame(winner, reason) {
        this.isGameStarted = false;
        this.currentPhase = 'ended';
        
        console.log(`🏆 Game ended: ${winner} win by ${reason}`);
        
        // Notifier l'interface
        this.app.onGameEnded(winner, reason);
        
        // Jouer la musique appropriée
        if (winner === 'crewmates') {
            this.app.audioSystem.playVictoryMusic();
        } else {
            this.app.audioSystem.playDefeatMusic();
        }
    }
    
    update(deltaTime) {
        if (!this.isGameStarted) return;
        
        // Mettre à jour les cooldowns
        this.updateCooldowns(deltaTime);
        
        // Mettre à jour les timers de meeting
        if (this.currentPhase === 'discussion' || this.currentPhase === 'voting') {
            this.updateMeetingTimer();
        }
    }
    
    updateCooldowns(deltaTime) {
        const now = Date.now();
        
        this.players.forEach((player) => {
            if (player.isImpostor && player.killCooldown > now) {
                // Le cooldown est encore actif
            }
        });
    }
    
    updateMeetingTimer() {
        const now = Date.now();
        const timeLeft = Math.max(0, this.meetingTimer - now);
        
        // Notifier l'interface du temps restant
        this.app.onMeetingTimerUpdate(timeLeft);
    }
    
    // Méthodes utilitaires
    addPlayer(playerId, playerData) {
        this.players.set(playerId, {
            id: playerId,
            name: playerData.name || `Player ${playerId}`,
            color: playerData.color || 'red',
            x: playerData.x || 0,
            y: playerData.y || 0,
            isImpostor: false,
            isDead: false,
            ejected: false,
            tasks: [],
            killCooldown: 0,
            ...playerData
        });
        
        console.log(`👤 Player added: ${playerData.name}`);
    }
    
    removePlayer(playerId) {
        this.players.delete(playerId);
        console.log(`👤 Player removed: ${playerId}`);
    }
    
    getPlayer(playerId) {
        return this.players.get(playerId);
    }
    
    getAllPlayers() {
        return Array.from(this.players.values());
    }
    
    getAlivePlayers() {
        return Array.from(this.players.values()).filter(p => !p.isDead);
    }
    
    getLocalPlayer() {
        return Array.from(this.players.values()).find(p => p.isLocal);
    }
    
    canKill(killerId, targetId) {
        const killer = this.players.get(killerId);
        const target = this.players.get(targetId);
        
        if (!killer || !target) return false;
        if (!killer.isImpostor) return false;
        if (target.isDead) return false;
        if (killer.killCooldown > Date.now()) return false;
        if (this.currentPhase !== 'playing') return false;
        
        // Vérifier la distance
        const distance = Math.sqrt(
            Math.pow(killer.x - target.x, 2) + 
            Math.pow(killer.y - target.y, 2)
        );
        
        return distance <= 100; // Distance de kill
    }
    
    startRenderLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            this.update(deltaTime);
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLogic;
} else if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
}