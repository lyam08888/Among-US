// Among Us V3 - Networking System (Simulated)
class AmongUsV3Networking {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        this.isConnected = false;
        
        // Connection state
        this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
        this.ping = 0;
        this.lastPingTime = 0;
        
        // Room state
        this.roomCode = '';
        this.isHost = false;
        this.players = new Map();
        this.localPlayerId = null;
        
        // Message queues
        this.incomingMessages = [];
        this.outgoingMessages = [];
        this.messageHandlers = new Map();
        
        // Simulation
        this.simulatedLatency = 50; // ms
        this.simulatedPacketLoss = 0.01; // 1%
        this.simulatedPlayers = [];
        
        // Network statistics
        this.stats = {
            messagesSent: 0,
            messagesReceived: 0,
            bytesTransferred: 0,
            packetsLost: 0,
            averagePing: 0,
            pingHistory: []
        };
        
        this.setupMessageHandlers();
        console.log('🌐 Networking system created');
    }
    
    async initialize() {
        try {
            // Simulate network initialization
            await this.simulateNetworkSetup();
            
            // Generate local player ID
            this.localPlayerId = this.generatePlayerId();
            
            // Start network update loop
            this.startNetworkLoop();
            
            this.isInitialized = true;
            console.log('🌐 Networking system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize networking:', error);
            this.connectionState = 'error';
        }
    }
    
    async simulateNetworkSetup() {
        this.connectionState = 'connecting';
        
        // Simulate connection delay
        await this.sleep(1000 + Math.random() * 2000);
        
        // Simulate connection success/failure
        if (Math.random() > 0.05) { // 95% success rate
            this.connectionState = 'connected';
            this.isConnected = true;
            this.startPingMonitoring();
        } else {
            throw new Error('Failed to connect to game servers');
        }
    }
    
    setupMessageHandlers() {
        try {
            // Safely bind message handlers, checking if methods exist
            const handlers = [
                ['playerJoin', 'handlePlayerJoin'],
                ['playerLeave', 'handlePlayerLeave'],
                ['playerMove', 'handlePlayerMove'],
                ['playerKill', 'handlePlayerKill'],
                ['taskComplete', 'handleTaskComplete'],
                ['emergencyMeeting', 'handleEmergencyMeeting'],
                ['vote', 'handleVote'],
                ['chatMessage', 'handleChatMessage'],
                ['gameStart', 'handleGameStart'],
                ['gameEnd', 'handleGameEnd'],
                ['sabotage', 'handleSabotage'],
                ['ping', 'handlePing'],
                ['pong', 'handlePong']
            ];
            
            handlers.forEach(([eventName, methodName]) => {
                console.log(`🔍 Checking method: ${methodName}`);
                if (typeof this[methodName] === 'function') {
                    console.log(`✅ Method ${methodName} found, binding...`);
                    try {
                        this.messageHandlers.set(eventName, this[methodName].bind(this));
                        console.log(`✅ Method ${methodName} bound successfully`);
                    } catch (bindError) {
                        console.error(`❌ Failed to bind ${methodName}:`, bindError);
                        this.messageHandlers.set(eventName, (message) => {
                            console.log(`📨 Fallback handler for ${eventName}`, message);
                        });
                    }
                } else {
                    console.warn(`⚠️ Method ${methodName} not found (type: ${typeof this[methodName]}), creating placeholder`);
                    this.messageHandlers.set(eventName, (message) => {
                        console.log(`📨 Unhandled message: ${eventName}`, message);
                    });
                }
            });
            
            console.log('✅ Message handlers setup complete');
        } catch (error) {
            console.error('❌ Failed to setup message handlers:', error);
            // Create empty handlers map as fallback
            this.messageHandlers.clear();
        }
    }
    
    startNetworkLoop() {
        const networkUpdate = () => {
            if (this.isInitialized) {
                this.processIncomingMessages();
                this.processOutgoingMessages();
                this.updateSimulatedPlayers();
                this.updateNetworkStats();
                
                setTimeout(networkUpdate, 16); // ~60 FPS
            }
        };
        
        networkUpdate();
    }
    
    startPingMonitoring() {
        const pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendPing();
            } else {
                clearInterval(pingInterval);
            }
        }, 5000); // Ping every 5 seconds
    }
    
    // Room management
    async createRoom(settings = {}) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        this.roomCode = this.generateRoomCode();
        this.isHost = true;
        
        // Simulate room creation
        await this.sleep(500);
        
        // Add local player to room
        const localPlayer = {
            id: this.localPlayerId,
            name: settings.playerName || 'Host',
            color: settings.color || 0,
            isHost: true,
            isAlive: true,
            position: { x: 0, y: 0 },
            tasks: []
        };
        
        this.players.set(this.localPlayerId, localPlayer);
        
        // Start simulating other players joining
        this.simulatePlayersJoining();
        
        this.engine.emit('roomCreated', {
            roomCode: this.roomCode,
            player: localPlayer
        });
        
        return this.roomCode;
    }
    
    async joinRoom(roomCode, playerData = {}) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }
        
        // Simulate room validation
        await this.sleep(1000);
        
        if (Math.random() > 0.8) { // 20% chance of room not found
            throw new Error('Room not found or full');
        }
        
        this.roomCode = roomCode;
        this.isHost = false;
        
        // Add local player to room
        const localPlayer = {
            id: this.localPlayerId,
            name: playerData.name || 'Player',
            color: playerData.color || 0,
            isHost: false,
            isAlive: true,
            position: { x: 0, y: 0 },
            tasks: []
        };
        
        this.players.set(this.localPlayerId, localPlayer);
        
        // Simulate existing players in room
        this.simulateExistingPlayers();
        
        // Notify other players
        this.sendMessage('playerJoin', localPlayer);
        
        this.engine.emit('roomJoined', {
            roomCode: this.roomCode,
            player: localPlayer,
            players: Array.from(this.players.values())
        });
        
        return localPlayer;
    }
    
    leaveRoom() {
        if (this.roomCode) {
            // Notify other players
            this.sendMessage('playerLeave', { playerId: this.localPlayerId });
            
            // Clear room state
            this.roomCode = '';
            this.isHost = false;
            this.players.clear();
            this.simulatedPlayers = [];
            
            this.engine.emit('roomLeft');
        }
    }
    
    // Message handling
    sendMessage(type, data = {}) {
        if (!this.isConnected) {
            console.warn('Cannot send message: not connected');
            return;
        }
        
        const message = {
            id: this.generateMessageId(),
            type,
            data,
            timestamp: Date.now(),
            senderId: this.localPlayerId,
            roomCode: this.roomCode
        };
        
        this.outgoingMessages.push(message);
        this.stats.messagesSent++;
    }
    
    processOutgoingMessages() {
        while (this.outgoingMessages.length > 0) {
            const message = this.outgoingMessages.shift();
            
            // Simulate packet loss
            if (Math.random() < this.simulatedPacketLoss) {
                this.stats.packetsLost++;
                continue;
            }
            
            // Simulate network latency
            setTimeout(() => {
                this.simulateMessageDelivery(message);
            }, this.simulatedLatency + Math.random() * 20);
            
            this.stats.bytesTransferred += JSON.stringify(message).length;
        }
    }
    
    simulateMessageDelivery(message) {
        // Simulate message being received by other players
        // In a real implementation, this would go through a server
        
        // Echo back to simulate server response for certain message types
        if (['playerMove', 'chatMessage'].includes(message.type)) {
            setTimeout(() => {
                this.receiveMessage(message);
            }, this.simulatedLatency);
        }
        
        // Simulate responses from other players
        this.simulatePlayerResponses(message);
    }
    
    receiveMessage(message) {
        this.incomingMessages.push(message);
        this.stats.messagesReceived++;
    }
    
    processIncomingMessages() {
        while (this.incomingMessages.length > 0) {
            const message = this.incomingMessages.shift();
            this.handleMessage(message);
        }
    }
    
    handleMessage(message) {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            try {
                handler(message);
            } catch (error) {
                console.error(`Error handling message ${message.type}:`, error);
            }
        } else {
            console.warn(`No handler for message type: ${message.type}`);
        }
    }
    
    // Message handlers
    handlePlayerJoin(message) {
        const player = message.data;
        this.players.set(player.id, player);
        
        this.engine.emit('playerJoined', { player });
        console.log(`Player joined: ${player.name}`);
    }
    
    handlePlayerLeave(message) {
        const playerId = message.data.playerId;
        const player = this.players.get(playerId);
        
        if (player) {
            this.players.delete(playerId);
            this.engine.emit('playerLeft', { player });
            console.log(`Player left: ${player.name}`);
        }
    }
    
    handlePlayerMove(message) {
        const { playerId, position, velocity } = message.data;
        const player = this.players.get(playerId);
        
        if (player && playerId !== this.localPlayerId) {
            player.position = position;
            player.velocity = velocity;
            
            this.engine.emit('playerMoved', { player, position, velocity });
        }
    }
    
    handlePlayerKill(message) {
        const { killerId, victimId } = message.data;
        const killer = this.players.get(killerId);
        const victim = this.players.get(victimId);
        
        if (victim) {
            victim.isAlive = false;
            this.engine.emit('playerKilled', { killer, victim });
        }
    }
    
    handleTaskComplete(message) {
        const { playerId, taskId } = message.data;
        const player = this.players.get(playerId);
        
        if (player) {
            this.engine.emit('taskCompleted', { player, taskId });
        }
    }
    
    handleEmergencyMeeting(message) {
        const { callerId, reason } = message.data;
        const caller = this.players.get(callerId);
        
        this.engine.emit('emergencyMeeting', { caller, reason });
    }
    
    handleVote(message) {
        const { voterId, targetId } = message.data;
        this.engine.emit('voteReceived', { voterId, targetId });
    }
    
    handleChatMessage(message) {
        const { playerId, text, isQuickChat } = message.data;
        const player = this.players.get(playerId);
        
        if (player) {
            this.engine.emit('chatMessage', {
                player,
                text,
                isQuickChat,
                timestamp: message.timestamp
            });
        }
    }
    
    handleGameStart(message) {
        const { gameSettings, playerRoles } = message.data;
        this.engine.emit('gameStarted', { gameSettings, playerRoles });
    }
    
    handleGameEnd(message) {
        const { winner, reason } = message.data;
        this.engine.emit('gameEnded', { winner, reason });
    }
    
    handleSabotage(message) {
        const { sabotageType, location, playerId } = message.data;
        this.engine.emit('sabotageTriggered', { sabotageType, location, playerId });
    }
    
    handlePing(message) {
        // Respond with pong
        this.sendMessage('pong', { pingId: message.data.pingId });
    }
    
    handlePong(message) {
        const pingId = message.data.pingId;
        const sentTime = this.lastPingTime;
        const currentTime = Date.now();
        
        if (pingId === sentTime) {
            this.ping = currentTime - sentTime;
            this.updatePingStats();
        }
    }
    
    // Simulation methods
    simulatePlayersJoining() {
        const playerCount = 3 + Math.floor(Math.random() * 7); // 3-9 additional players
        
        for (let i = 0; i < playerCount; i++) {
            setTimeout(() => {
                this.simulatePlayerJoin();
            }, (i + 1) * 2000 + Math.random() * 3000);
        }
    }
    
    simulateExistingPlayers() {
        const playerCount = 2 + Math.floor(Math.random() * 6); // 2-7 existing players
        
        for (let i = 0; i < playerCount; i++) {
            const player = this.createSimulatedPlayer();
            this.players.set(player.id, player);
            this.simulatedPlayers.push(player);
        }
    }
    
    simulatePlayerJoin() {
        if (this.players.size >= 15) return; // Max players
        
        const player = this.createSimulatedPlayer();
        this.players.set(player.id, player);
        this.simulatedPlayers.push(player);
        
        // Simulate join message
        this.receiveMessage({
            type: 'playerJoin',
            data: player,
            timestamp: Date.now(),
            senderId: player.id
        });
    }
    
    createSimulatedPlayer() {
        const names = [
            'RedPlayer', 'BluePlayer', 'GreenPlayer', 'PinkPlayer',
            'OrangePlayer', 'YellowPlayer', 'BlackPlayer', 'WhitePlayer',
            'PurplePlayer', 'BrownPlayer', 'CyanPlayer', 'LimePlayer'
        ];
        
        const availableColors = [];
        for (let i = 0; i < 12; i++) {
            if (!Array.from(this.players.values()).some(p => p.color === i)) {
                availableColors.push(i);
            }
        }
        
        const color = availableColors.length > 0 ? 
            availableColors[Math.floor(Math.random() * availableColors.length)] : 0;
        
        return {
            id: this.generatePlayerId(),
            name: names[color] || `Player${Math.floor(Math.random() * 1000)}`,
            color,
            isHost: false,
            isAlive: true,
            position: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200
            },
            tasks: [],
            isBot: true
        };
    }
    
    updateSimulatedPlayers() {
        for (let player of this.simulatedPlayers) {
            // Simulate random movement
            if (Math.random() < 0.1) { // 10% chance per frame
                player.position.x += (Math.random() - 0.5) * 10;
                player.position.y += (Math.random() - 0.5) * 10;
                
                // Send movement update
                this.receiveMessage({
                    type: 'playerMove',
                    data: {
                        playerId: player.id,
                        position: player.position,
                        velocity: { x: 0, y: 0 }
                    },
                    timestamp: Date.now(),
                    senderId: player.id
                });
            }
            
            // Simulate random chat messages
            if (Math.random() < 0.001) { // Very rare
                const messages = [
                    'Where?', 'Sus', 'I saw red vent', 'Emergency meeting!',
                    'Vote blue', 'I was in medbay', 'Who?', 'Skip vote'
                ];
                
                this.receiveMessage({
                    type: 'chatMessage',
                    data: {
                        playerId: player.id,
                        text: messages[Math.floor(Math.random() * messages.length)],
                        isQuickChat: true
                    },
                    timestamp: Date.now(),
                    senderId: player.id
                });
            }
        }
    }
    
    simulatePlayerResponses(message) {
        // Simulate other players responding to certain messages
        switch (message.type) {
            case 'emergencyMeeting':
                // Simulate players gathering for meeting
                setTimeout(() => {
                    this.engine.emit('playersGathering');
                }, 2000);
                break;
                
            case 'vote':
                // Simulate other players voting
                setTimeout(() => {
                    for (let player of this.simulatedPlayers) {
                        if (Math.random() < 0.8) { // 80% participation
                            const targets = Array.from(this.players.keys());
                            const target = targets[Math.floor(Math.random() * targets.length)];
                            
                            this.receiveMessage({
                                type: 'vote',
                                data: { voterId: player.id, targetId: target },
                                timestamp: Date.now(),
                                senderId: player.id
                            });
                        }
                    }
                }, 1000 + Math.random() * 5000);
                break;
        }
    }
    
    // Network utilities
    sendPing() {
        this.lastPingTime = Date.now();
        this.sendMessage('ping', { pingId: this.lastPingTime });
    }
    
    updatePingStats() {
        this.stats.pingHistory.push(this.ping);
        
        // Keep only last 10 pings
        if (this.stats.pingHistory.length > 10) {
            this.stats.pingHistory.shift();
        }
        
        // Calculate average ping
        const sum = this.stats.pingHistory.reduce((a, b) => a + b, 0);
        this.stats.averagePing = Math.round(sum / this.stats.pingHistory.length);
    }
    
    updateNetworkStats() {
        // Update network statistics
        // This would include bandwidth usage, connection quality, etc.
    }
    
    // Public API
    getConnectionState() {
        return this.connectionState;
    }
    
    getPing() {
        return this.ping;
    }
    
    getPlayers() {
        return Array.from(this.players.values());
    }
    
    getPlayer(playerId) {
        return this.players.get(playerId);
    }
    
    getLocalPlayer() {
        return this.players.get(this.localPlayerId);
    }
    
    getRoomCode() {
        return this.roomCode;
    }
    
    isRoomHost() {
        return this.isHost;
    }
    
    getNetworkStats() {
        return {
            ...this.stats,
            ping: this.ping,
            connectionState: this.connectionState,
            playersConnected: this.players.size
        };
    }
    
    // Game actions
    movePlayer(position, velocity) {
        this.sendMessage('playerMove', {
            playerId: this.localPlayerId,
            position,
            velocity
        });
    }
    
    killPlayer(victimId) {
        this.sendMessage('playerKill', {
            killerId: this.localPlayerId,
            victimId
        });
    }
    
    completeTask(taskId) {
        this.sendMessage('taskComplete', {
            playerId: this.localPlayerId,
            taskId
        });
    }
    
    callEmergencyMeeting(reason = '') {
        this.sendMessage('emergencyMeeting', {
            callerId: this.localPlayerId,
            reason
        });
    }
    
    castVote(targetId) {
        this.sendMessage('vote', {
            voterId: this.localPlayerId,
            targetId
        });
    }
    
    sendChatMessage(text, isQuickChat = false) {
        this.sendMessage('chatMessage', {
            playerId: this.localPlayerId,
            text,
            isQuickChat
        });
    }
    
    triggerSabotage(sabotageType, location) {
        this.sendMessage('sabotage', {
            playerId: this.localPlayerId,
            sabotageType,
            location
        });
    }
    
    startGame(gameSettings) {
        if (!this.isHost) {
            throw new Error('Only host can start the game');
        }
        
        // Assign roles
        const playerIds = Array.from(this.players.keys());
        const impostorCount = gameSettings.numImpostors || 2;
        const impostors = this.shuffleArray(playerIds).slice(0, impostorCount);
        
        const playerRoles = {};
        for (let playerId of playerIds) {
            playerRoles[playerId] = {
                isImpostor: impostors.includes(playerId),
                tasks: this.generateTasksForPlayer()
            };
        }
        
        this.sendMessage('gameStart', {
            gameSettings,
            playerRoles
        });
    }
    
    endGame(winner, reason) {
        if (!this.isHost) return;
        
        this.sendMessage('gameEnd', {
            winner,
            reason
        });
    }
    
    // Utility methods
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    generateTasksForPlayer() {
        const allTasks = [
            'wires', 'fuel', 'scan', 'asteroids', 'shields',
            'reactor', 'navigation', 'weapons', 'communications'
        ];
        
        const numTasks = 5 + Math.floor(Math.random() * 3);
        return this.shuffleArray(allTasks).slice(0, numTasks);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Update method called by engine
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update network statistics
        this.updateNetworkStats();
        
        // Update simulated players
        this.updateSimulatedPlayers();
        
        // Process any pending messages
        this.processIncomingMessages();
        this.processOutgoingMessages();
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            connected: this.isConnected,
            connectionState: this.connectionState,
            roomCode: this.roomCode,
            isHost: this.isHost,
            playersCount: this.players.size,
            ping: this.ping,
            stats: this.stats
        };
    }
    
    // Cleanup
    destroy() {
        // Leave room if connected
        this.leaveRoom();
        
        // Clear all data
        this.players.clear();
        this.simulatedPlayers = [];
        this.incomingMessages = [];
        this.outgoingMessages = [];
        this.messageHandlers.clear();
        
        // Update state
        this.isInitialized = false;
        this.isConnected = false;
        this.connectionState = 'disconnected';
        
        console.log('🌐 Networking system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Networking = AmongUsV3Networking;