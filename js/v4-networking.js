// Among Us V4 - Networking System
class NetworkingSystem {
    constructor(app) {
        this.app = app;
        this.isHost = false;
        this.isConnected = false;
        this.roomCode = '';
        this.playerId = '';
        this.players = new Map();
        
        // WebRTC pour peer-to-peer
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        
        // WebSocket pour signaling (simulation)
        this.ws = null;
        this.wsUrl = 'wss://among-us-signaling.herokuapp.com'; // URL fictive
        
        // Configuration WebRTC
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        // Messages en attente
        this.messageQueue = [];
        this.lastHeartbeat = Date.now();
        
        this.init();
    }
    
    init() {
        console.log('🌐 Initializing Networking System...');
        
        // Générer un ID de joueur unique
        this.playerId = this.generatePlayerId();
        
        // Simuler la connexion réseau pour la démo
        this.simulateNetworking();
    }
    
    // Simulation du réseau pour la démo (remplace WebSocket/WebRTC)
    simulateNetworking() {
        console.log('🔄 Simulating network for demo...');
        
        // Simuler des joueurs IA
        this.simulateAIPlayers();
        
        // Simuler la latence réseau
        this.networkLatency = 50; // 50ms
        
        // Démarrer la simulation de heartbeat
        setInterval(() => {
            this.simulateHeartbeat();
        }, 1000);
    }
    
    simulateAIPlayers() {
        const aiNames = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Rose', 'Orange', 'Cyan', 'Lime'];
        const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'orange', 'cyan', 'lime'];
        
        for (let i = 0; i < 6; i++) {
            const aiId = `ai_${i}`;
            const aiPlayer = {
                id: aiId,
                name: aiNames[i],
                color: colors[i],
                x: Math.random() * 800,
                y: Math.random() * 600,
                isAI: true,
                isImpostor: false,
                isDead: false,
                lastUpdate: Date.now()
            };
            
            this.players.set(aiId, aiPlayer);
            this.app.gameState.players.set(aiId, aiPlayer);
        }
        
        console.log(`🤖 Added ${this.players.size} AI players`);
    }
    
    simulateHeartbeat() {
        // Simuler le mouvement des IA
        this.players.forEach((player, playerId) => {
            if (player.isAI && !player.isDead) {
                // Mouvement aléatoire
                player.x += (Math.random() - 0.5) * 20;
                player.y += (Math.random() - 0.5) * 20;
                
                // Garder dans les limites
                player.x = Math.max(0, Math.min(800, player.x));
                player.y = Math.max(0, Math.min(600, player.y));
                
                // Simuler des actions aléatoires
                if (Math.random() < 0.01) { // 1% de chance par seconde
                    this.simulateAIAction(player);
                }
            }
        });
        
        // Notifier l'app des mises à jour
        this.app.onNetworkUpdate();
    }
    
    simulateAIAction(player) {
        const actions = ['move', 'task', 'vent', 'kill'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        switch (action) {
            case 'task':
                if (!player.isImpostor && Math.random() < 0.3) {
                    console.log(`🤖 ${player.name} is doing a task`);
                    // Simuler une tâche terminée
                    setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('task-completed', {
                            detail: { playerId: player.id, taskId: 'ai-task' }
                        }));
                    }, 2000);
                }
                break;
                
            case 'kill':
                if (player.isImpostor && Math.random() < 0.1) {
                    const nearbyPlayers = this.getNearbyPlayers(player, 100);
                    const target = nearbyPlayers.find(p => !p.isImpostor && !p.isDead);
                    if (target) {
                        console.log(`🤖 ${player.name} killed ${target.name}`);
                        document.dispatchEvent(new CustomEvent('player-killed', {
                            detail: { killerId: player.id, victimId: target.id }
                        }));
                    }
                }
                break;
        }
    }
    
    // Méthodes de connexion réseau (simulées)
    async createRoom() {
        console.log('🏠 Creating room...');
        
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        this.isConnected = true;
        
        // Ajouter le joueur local
        const localPlayer = this.app.gameState.localPlayer;
        if (localPlayer) {
            this.players.set(localPlayer.id, localPlayer);
        }
        
        console.log(`✅ Room created: ${this.roomCode}`);
        return this.roomCode;
    }
    
    async joinRoom(roomCode) {
        console.log(`🚪 Joining room: ${roomCode}`);
        
        this.isHost = false;
        this.roomCode = roomCode;
        this.isConnected = true;
        
        // Simuler la connexion
        await this.delay(1000);
        
        // Ajouter le joueur local
        const localPlayer = this.app.gameState.localPlayer;
        if (localPlayer) {
            this.players.set(localPlayer.id, localPlayer);
        }
        
        console.log(`✅ Joined room: ${roomCode}`);
        return true;
    }
    
    disconnect() {
        console.log('🔌 Disconnecting...');
        
        this.isConnected = false;
        this.isHost = false;
        this.roomCode = '';
        this.players.clear();
        
        // Fermer les connexions WebRTC
        this.peerConnections.forEach((pc) => {
            pc.close();
        });
        this.peerConnections.clear();
        this.dataChannels.clear();
        
        // Fermer WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    // Envoi de messages
    sendMessage(type, data) {
        if (!this.isConnected) {
            console.warn('⚠️ Not connected, message queued');
            this.messageQueue.push({ type, data, timestamp: Date.now() });
            return;
        }
        
        const message = {
            type: type,
            data: data,
            playerId: this.playerId,
            timestamp: Date.now()
        };
        
        // Simuler l'envoi avec latence
        setTimeout(() => {
            this.handleMessage(message);
        }, this.networkLatency);
    }
    
    handleMessage(message) {
        console.log(`📨 Received message: ${message.type}`, message.data);
        
        switch (message.type) {
            case 'player-move':
                this.handlePlayerMove(message);
                break;
            case 'player-kill':
                this.handlePlayerKill(message);
                break;
            case 'body-report':
                this.handleBodyReport(message);
                break;
            case 'emergency-meeting':
                this.handleEmergencyMeeting(message);
                break;
            case 'vote-cast':
                this.handleVoteCast(message);
                break;
            case 'task-complete':
                this.handleTaskComplete(message);
                break;
            case 'chat-message':
                this.handleChatMessage(message);
                break;
            case 'game-start':
                this.handleGameStart(message);
                break;
            case 'game-end':
                this.handleGameEnd(message);
                break;
        }
    }
    
    // Gestionnaires de messages
    handlePlayerMove(message) {
        const { playerId, x, y, animation } = message.data;
        const player = this.players.get(playerId);
        
        if (player && playerId !== this.playerId) {
            player.x = x;
            player.y = y;
            player.animation = animation;
            player.lastUpdate = Date.now();
        }
    }
    
    handlePlayerKill(message) {
        const { killerId, victimId } = message.data;
        
        document.dispatchEvent(new CustomEvent('player-killed', {
            detail: { killerId, victimId }
        }));
    }
    
    handleBodyReport(message) {
        const { reporterId, bodyId } = message.data;
        
        document.dispatchEvent(new CustomEvent('body-reported', {
            detail: { reporterId, bodyId }
        }));
    }
    
    handleEmergencyMeeting(message) {
        const { callerId } = message.data;
        
        document.dispatchEvent(new CustomEvent('emergency-meeting', {
            detail: { callerId }
        }));
    }
    
    handleVoteCast(message) {
        const { voterId, targetId } = message.data;
        
        document.dispatchEvent(new CustomEvent('vote-cast', {
            detail: { voterId, targetId }
        }));
    }
    
    handleTaskComplete(message) {
        const { playerId, taskId } = message.data;
        
        document.dispatchEvent(new CustomEvent('task-completed', {
            detail: { playerId, taskId }
        }));
    }
    
    handleChatMessage(message) {
        const { playerId, text } = message.data;
        const player = this.players.get(playerId);
        
        if (player) {
            this.app.onChatMessage(player.name, text);
        }
    }
    
    handleGameStart(message) {
        console.log('🚀 Game starting...');
        this.app.onNetworkGameStart(message.data);
    }
    
    handleGameEnd(message) {
        console.log('🏁 Game ended');
        this.app.onNetworkGameEnd(message.data);
    }
    
    // Méthodes publiques pour l'app
    movePlayer(x, y, animation = 'idle') {
        this.sendMessage('player-move', { 
            playerId: this.playerId, 
            x, y, animation 
        });
    }
    
    killPlayer(victimId) {
        this.sendMessage('player-kill', {
            killerId: this.playerId,
            victimId: victimId
        });
    }
    
    reportBody(bodyId) {
        this.sendMessage('body-report', {
            reporterId: this.playerId,
            bodyId: bodyId
        });
    }
    
    callEmergencyMeeting() {
        this.sendMessage('emergency-meeting', {
            callerId: this.playerId
        });
    }
    
    castVote(targetId) {
        this.sendMessage('vote-cast', {
            voterId: this.playerId,
            targetId: targetId
        });
    }
    
    completeTask(taskId) {
        this.sendMessage('task-complete', {
            playerId: this.playerId,
            taskId: taskId
        });
    }
    
    sendChatMessage(text) {
        this.sendMessage('chat-message', {
            playerId: this.playerId,
            text: text
        });
    }
    
    startGame() {
        if (this.isHost) {
            this.sendMessage('game-start', {
                settings: this.app.gameState.settings
            });
        }
    }
    
    // Méthodes utilitaires
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getNearbyPlayers(player, radius) {
        return Array.from(this.players.values()).filter(p => {
            if (p.id === player.id) return false;
            const distance = Math.sqrt(
                Math.pow(p.x - player.x, 2) + 
                Math.pow(p.y - player.y, 2)
            );
            return distance <= radius;
        });
    }
    
    getPlayerCount() {
        return this.players.size;
    }
    
    getAlivePlayerCount() {
        return Array.from(this.players.values()).filter(p => !p.isDead).length;
    }
    
    isPlayerNearby(playerId, radius = 100) {
        const localPlayer = this.app.gameState.localPlayer;
        const otherPlayer = this.players.get(playerId);
        
        if (!localPlayer || !otherPlayer) return false;
        
        const distance = Math.sqrt(
            Math.pow(otherPlayer.x - localPlayer.x, 2) + 
            Math.pow(otherPlayer.y - localPlayer.y, 2)
        );
        
        return distance <= radius;
    }
    
    // Getters
    get connectedPlayers() {
        return Array.from(this.players.values());
    }
    
    get isInRoom() {
        return this.isConnected && this.roomCode !== '';
    }
    
    get ping() {
        return this.networkLatency;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkingSystem;
} else if (typeof window !== 'undefined') {
    window.NetworkingSystem = NetworkingSystem;
}