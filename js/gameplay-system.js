// Among Us V4 - Système de Gameplay Complet
console.log('🎮 Initializing Among Us Gameplay System...');

class AmongUsGameplay {
    constructor(renderer) {
        this.renderer = renderer;
        this.gameState = 'lobby'; // lobby, playing, discussion, voting
        this.gameMode = 'crewmate'; // crewmate, impostor
        this.tasks = new Map();
        this.emergencyMeetings = 1;
        this.gameTimer = 0;
        this.isEmergency = false;
        this.deadBodies = [];
        this.vents = [];
        this.doors = [];
        this.players = new Map();
        this.currentRoom = 'cafeteria';
        this.sabotages = [];
        
        this.init();
    }
    
    init() {
        console.log('🎮 Setting up gameplay systems...');
        
        this.createMap();
        this.createTasks();
        this.createVents();
        this.createDoors();
        this.setupInteractions();
        this.createAIPlayers();
        
        console.log('✅ Gameplay system initialized');
    }
    
    createMap() {
        console.log('🗺️ Creating Skeld map...');
        
        this.map = {
            rooms: {
                cafeteria: { x: 400, y: 300, width: 200, height: 150, color: '#4a90e2' },
                weapons: { x: 100, y: 150, width: 150, height: 100, color: '#e74c3c' },
                o2: { x: 100, y: 300, width: 120, height: 100, color: '#2ecc71' },
                navigation: { x: 600, y: 150, width: 120, height: 100, color: '#f39c12' },
                shields: { x: 650, y: 300, width: 120, height: 100, color: '#9b59b6' },
                communications: { x: 100, y: 450, width: 150, height: 100, color: '#1abc9c' },
                storage: { x: 300, y: 500, width: 150, height: 100, color: '#34495e' },
                electrical: { x: 500, y: 500, width: 150, height: 120, color: '#e67e22' },
                lowerEngine: { x: 150, y: 650, width: 120, height: 100, color: '#95a5a6' },
                upperEngine: { x: 150, y: 50, width: 120, height: 100, color: '#95a5a6' },
                security: { x: 300, y: 400, width: 100, height: 80, color: '#8e44ad' },
                reactor: { x: 50, y: 350, width: 100, height: 150, color: '#c0392b' },
                medbay: { x: 500, y: 250, width: 120, height: 100, color: '#27ae60' },
                admin: { x: 400, y: 400, width: 100, height: 80, color: '#2980b9' }
            },
            corridors: [
                { from: 'cafeteria', to: 'weapons', path: [{x: 400, y: 225}, {x: 250, y: 225}] },
                { from: 'cafeteria', to: 'medbay', path: [{x: 500, y: 325}] },
                { from: 'cafeteria', to: 'admin', path: [{x: 450, y: 350}] },
                { from: 'cafeteria', to: 'storage', path: [{x: 375, y: 450}] }
            ]
        };
    }
    
    createTasks() {
        console.log('📋 Creating tasks...');
        
        this.taskTypes = {
            'fix-wiring': {
                name: 'Réparer les câbles',
                rooms: ['electrical', 'admin', 'navigation', 'cafeteria', 'security'],
                duration: 3000,
                visual: true,
                common: false
            },
            'download-data': {
                name: 'Télécharger les données',
                rooms: ['electrical', 'navigation', 'weapons', 'communications'],
                duration: 8000,
                visual: false,
                common: false
            },
            'empty-garbage': {
                name: 'Vider les poubelles',
                rooms: ['cafeteria', 'o2'],
                duration: 2000,
                visual: true,
                common: false
            },
            'fuel-engines': {
                name: 'Faire le plein',
                rooms: ['storage', 'lowerEngine', 'upperEngine'],
                duration: 5000,
                visual: true,
                common: false
            },
            'calibrate-distributor': {
                name: 'Calibrer le distributeur',
                rooms: ['electrical'],
                duration: 4000,
                visual: false,
                common: false
            },
            'submit-scan': {
                name: 'Scanner médical',
                rooms: ['medbay'],
                duration: 10000,
                visual: true,
                common: false
            },
            'inspect-sample': {
                name: 'Inspecter échantillon',
                rooms: ['medbay'],
                duration: 60000,
                visual: false,
                common: false
            },
            'prime-shields': {
                name: 'Amorcer les boucliers',
                rooms: ['shields'],
                duration: 3000,
                visual: true,
                common: false
            },
            'chart-course': {
                name: 'Tracer la route',
                rooms: ['navigation'],
                duration: 4000,
                visual: false,
                common: false
            },
            'divert-power': {
                name: 'Dévier l\'énergie',
                rooms: ['electrical', 'weapons', 'o2', 'navigation', 'shields', 'communications'],
                duration: 3000,
                visual: true,
                common: false
            }
        };
        
        // Assigner des tâches aléatoirement
        this.assignRandomTasks();
    }
    
    assignRandomTasks() {
        const taskList = Object.keys(this.taskTypes);
        const assignedTasks = [];
        
        // Sélectionner 4-7 tâches aléatoirement
        const numTasks = 4 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numTasks; i++) {
            const randomTask = taskList[Math.floor(Math.random() * taskList.length)];
            const taskData = this.taskTypes[randomTask];
            const randomRoom = taskData.rooms[Math.floor(Math.random() * taskData.rooms.length)];
            
            const taskId = `task_${i}`;
            assignedTasks.push({
                id: taskId,
                type: randomTask,
                room: randomRoom,
                completed: false,
                progress: 0,
                ...taskData
            });
        }
        
        this.tasks = new Map(assignedTasks.map(task => [task.id, task]));
        console.log(`📋 Assigned ${assignedTasks.length} tasks`);
    }
    
    createVents() {
        console.log('🌪️ Creating vent system...');
        
        this.vents = [
            { id: 'vent1', room: 'medbay', x: 520, y: 280, connected: ['vent2', 'vent3'] },
            { id: 'vent2', room: 'electrical', x: 520, y: 530, connected: ['vent1', 'vent3'] },
            { id: 'vent3', room: 'security', x: 320, y: 430, connected: ['vent1', 'vent2'] },
            { id: 'vent4', room: 'weapons', x: 120, y: 180, connected: ['vent5'] },
            { id: 'vent5', room: 'navigation', x: 620, y: 180, connected: ['vent4'] },
            { id: 'vent6', room: 'shields', x: 670, y: 330, connected: ['vent7'] },
            { id: 'vent7', room: 'cafeteria', x: 430, y: 330, connected: ['vent6'] },
            { id: 'vent8', room: 'lowerEngine', x: 170, y: 680, connected: ['vent9'] },
            { id: 'vent9', room: 'upperEngine', x: 170, y: 80, connected: ['vent8'] }
        ];
    }
    
    createDoors() {
        console.log('🚪 Creating door system...');
        
        this.doors = [
            { id: 'door1', room: 'electrical', x: 550, y: 500, sabotaged: false, timer: 0 },
            { id: 'door2', room: 'medbay', x: 500, y: 280, sabotaged: false, timer: 0 },
            { id: 'door3', room: 'communications', x: 150, y: 480, sabotaged: false, timer: 0 },
            { id: 'door4', room: 'storage', x: 350, y: 500, sabotaged: false, timer: 0 },
            { id: 'door5', room: 'cafeteria', x: 400, y: 330, sabotaged: false, timer: 0 }
        ];
    }
    
    setupInteractions() {
        console.log('⚙️ Setting up interactions...');
        
        if (this.renderer && this.renderer.canvas) {
            this.renderer.canvas.addEventListener('keydown', (e) => this.handleGameplayInput(e));
            this.renderer.canvas.addEventListener('click', (e) => this.handleGameplayClick(e));
        }
    }
    
    createAIPlayers() {
        console.log('🤖 Creating AI players...');
        
        const colors = ['blue', 'green', 'yellow', 'orange', 'pink', 'cyan', 'lime', 'purple'];
        const names = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Taylor'];
        
        for (let i = 0; i < 6; i++) {
            const aiPlayer = {
                id: `ai_${i}`,
                name: names[i],
                color: colors[i],
                x: 400 + (Math.random() - 0.5) * 200,
                y: 300 + (Math.random() - 0.5) * 100,
                isLocal: false,
                isAI: true,
                isAlive: true,
                isImpostor: i === 0, // Premier AI est imposteur
                velocity: { x: 0, y: 0 },
                target: null,
                lastSeen: Date.now(),
                currentTask: null,
                suspicion: 0
            };
            
            this.players.set(aiPlayer.id, aiPlayer);
            
            // Ajouter aussi au renderer
            if (this.renderer && this.renderer.players) {
                this.renderer.players.set(aiPlayer.id, aiPlayer);
            }
        }
        
        console.log(`🤖 Created ${this.players.size} AI players`);
    }
    
    handleGameplayInput(e) {
        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'e':
            case ' ':
                this.handleUseAction();
                break;
            case 'r':
                this.handleReportAction();
                break;
            case 'q':
                this.handleKillAction();
                break;
            case 't':
                this.handleEmergencyMeeting();
                break;
            case 'v':
                if (this.gameMode === 'impostor') {
                    this.handleVentAction();
                }
                break;
            case 'tab':
                this.showTaskList();
                e.preventDefault();
                break;
        }
    }
    
    handleGameplayClick(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Vérifier les interactions avec les objets
        this.checkInteractions(x, y);
    }
    
    checkInteractions(x, y) {
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        const interactionRange = 60;
        
        // Vérifier les tâches
        for (const [taskId, task] of this.tasks) {
            if (task.completed) continue;
            
            const room = this.map.rooms[task.room];
            if (room && this.isPlayerInRoom(player, task.room)) {
                const taskX = room.x + room.width / 2;
                const taskY = room.y + room.height / 2;
                
                if (this.getDistance(x, y, taskX, taskY) < interactionRange) {
                    this.startTask(taskId);
                    return;
                }
            }
        }
        
        // Vérifier les vents (si imposteur)
        if (this.gameMode === 'impostor') {
            for (const vent of this.vents) {
                if (this.getDistance(x, y, vent.x, vent.y) < interactionRange) {
                    this.useVent(vent.id);
                    return;
                }
            }
        }
        
        // Vérifier les corps morts
        for (const body of this.deadBodies) {
            if (this.getDistance(x, y, body.x, body.y) < interactionRange) {
                this.reportBody(body);
                return;
            }
        }
    }
    
    handleUseAction() {
        console.log('🔧 Use action triggered');
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        // Trouver la tâche la plus proche
        let closestTask = null;
        let closestDistance = Infinity;
        
        for (const [taskId, task] of this.tasks) {
            if (task.completed) continue;
            
            const room = this.map.rooms[task.room];
            if (room && this.isPlayerInRoom(player, task.room)) {
                const taskX = room.x + room.width / 2;
                const taskY = room.y + room.height / 2;
                const distance = this.getDistance(player.x, player.y, taskX, taskY);
                
                if (distance < 80 && distance < closestDistance) {
                    closestDistance = distance;
                    closestTask = taskId;
                }
            }
        }
        
        if (closestTask) {
            this.startTask(closestTask);
        }
    }
    
    startTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.completed) return;
        
        console.log(`🔧 Starting task: ${task.name}`);
        
        // Créer l'interface de tâche
        this.createTaskInterface(task);
        
        // Simuler l'exécution de la tâche
        task.isActive = true;
        task.startTime = Date.now();
        
        setTimeout(() => {
            this.completeTask(taskId);
        }, task.duration);
    }
    
    createTaskInterface(task) {
        // Supprimer l'interface précédente
        const existingInterface = document.getElementById('task-interface');
        if (existingInterface) {
            existingInterface.remove();
        }
        
        // Créer la nouvelle interface
        const taskInterface = document.createElement('div');
        taskInterface.id = 'task-interface';
        taskInterface.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 300px;
            background: linear-gradient(135deg, #2c3e50, #34495e);
            border: 3px solid #3498db;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 30px rgba(52, 152, 219, 0.5);
        `;
        
        taskInterface.innerHTML = `
            <div style="text-align: center;">
                <h2 style="margin: 0 0 20px 0; color: #3498db;">${task.name}</h2>
                <div style="font-size: 18px; margin-bottom: 20px;">
                    Salle: ${this.getRoomDisplayName(task.room)}
                </div>
                <div style="background: #1a252f; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="font-size: 16px; margin-bottom: 10px;">Progression:</div>
                    <div style="background: #34495e; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div id="task-progress" style="background: linear-gradient(90deg, #27ae60, #2ecc71); height: 100%; width: 0%; transition: width 0.5s;"></div>
                    </div>
                </div>
                <button onclick="window.ultraSafeGame.gameplay.cancelTask('${task.id}')" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">Annuler (ESC)</button>
            </div>
        `;
        
        document.body.appendChild(taskInterface);
        
        // Animer la progression
        this.animateTaskProgress(task);
        
        // Écouter ESC pour annuler
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.cancelTask(task.id);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    animateTaskProgress(task) {
        const progressBar = document.getElementById('task-progress');
        if (!progressBar) return;
        
        const startTime = Date.now();
        const duration = task.duration;
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1) * 100;
            
            progressBar.style.width = progress + '%';
            
            if (progress < 100 && task.isActive) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        updateProgress();
    }
    
    completeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        task.completed = true;
        task.isActive = false;
        
        console.log(`✅ Task completed: ${task.name}`);
        
        // Supprimer l'interface
        const taskInterface = document.getElementById('task-interface');
        if (taskInterface) {
            taskInterface.remove();
        }
        
        // Vérifier si toutes les tâches sont terminées
        const completedTasks = Array.from(this.tasks.values()).filter(t => t.completed).length;
        const totalTasks = this.tasks.size;
        
        console.log(`📊 Tasks: ${completedTasks}/${totalTasks}`);
        
        if (completedTasks === totalTasks) {
            this.triggerCrewmateVictory();
        }
    }
    
    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        task.isActive = false;
        
        // Supprimer l'interface
        const taskInterface = document.getElementById('task-interface');
        if (taskInterface) {
            taskInterface.remove();
        }
        
        console.log(`❌ Task cancelled: ${task.name}`);
    }
    
    handleReportAction() {
        console.log('📢 Report action triggered');
        
        const player = Array.from(this.renderer.players.values()).find(p => p.isLocal);
        if (!player) return;
        
        // Chercher des corps à proximité
        for (const body of this.deadBodies) {
            if (this.getDistance(player.x, player.y, body.x, body.y) < 80) {
                this.reportBody(body);
                return;
            }
        }
        
        console.log('⚠️ No bodies found nearby');
    }
    
    handleEmergencyMeeting() {
        if (this.emergencyMeetings <= 0) {
            console.log('❌ No emergency meetings left');
            return;
        }
        
        console.log('🚨 Emergency meeting called!');
        this.emergencyMeetings--;
        this.startDiscussion('emergency');
    }
    
    reportBody(body) {
        console.log(`☠️ Body reported: ${body.playerName}`);
        this.startDiscussion('body', body);
    }
    
    startDiscussion(type, data = null) {
        this.gameState = 'discussion';
        this.isEmergency = true;
        
        // Créer l'interface de discussion
        this.createDiscussionInterface(type, data);
        
        // Arrêter tous les mouvements
        for (const [id, player] of this.renderer.players) {
            if (player.velocity) {
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
        }
    }
    
    createDiscussionInterface(type, data) {
        const discussionInterface = document.createElement('div');
        discussionInterface.id = 'discussion-interface';
        discussionInterface.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        const title = type === 'emergency' ? '🚨 REUNION D\'URGENCE' : `☠️ CORPS TROUVE: ${data ? data.playerName : 'Inconnu'}`;
        
        discussionInterface.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 48px; margin: 0; color: #e74c3c;">${title}</h1>
                <p style="font-size: 24px; margin: 10px 0;">Temps de discussion: 45 secondes</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                ${this.createPlayerGrid()}
            </div>
            <div style="text-align: center;">
                <button onclick="window.ultraSafeGame.gameplay.startVoting()" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 20px;
                    cursor: pointer;
                    margin: 10px;
                ">Commencer le Vote</button>
                <button onclick="window.ultraSafeGame.gameplay.skipVote()" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 20px;
                    cursor: pointer;
                    margin: 10px;
                ">Passer</button>
            </div>
        `;
        
        document.body.appendChild(discussionInterface);
        
        // Timer automatique
        setTimeout(() => {
            this.startVoting();
        }, 45000);
    }
    
    createPlayerGrid() {
        let grid = '';
        const allPlayers = Array.from(this.renderer.players.values()).filter(p => p.isAlive !== false);
        
        for (const player of allPlayers) {
            const colorStyle = this.getPlayerColorStyle(player.color);
            grid += `
                <div style="
                    background: ${colorStyle};
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    border: ${player.isLocal ? '3px solid #f1c40f' : '2px solid #34495e'};
                ">
                    <div style="font-size: 18px; font-weight: bold;">${player.name || 'Player'}</div>
                    <div style="font-size: 14px; margin-top: 5px;">${player.isLocal ? '(Vous)' : ''}</div>
                </div>
            `;
        }
        
        return grid;
    }
    
    getPlayerColorStyle(color) {
        const colors = {
            red: '#e74c3c',
            blue: '#3498db',
            green: '#27ae60',
            yellow: '#f1c40f',
            orange: '#e67e22',
            pink: '#e91e63',
            cyan: '#1abc9c',
            lime: '#2ecc71',
            purple: '#9b59b6',
            black: '#34495e'
        };
        
        return colors[color] || colors.red;
    }
    
    startVoting() {
        const discussionInterface = document.getElementById('discussion-interface');
        if (discussionInterface) {
            discussionInterface.remove();
        }
        
        this.createVotingInterface();
    }
    
    createVotingInterface() {
        // Interface de vote complète
        console.log('🗳️ Starting voting phase...');
        
        // Pour l'instant, simuler un vote rapide
        setTimeout(() => {
            this.endVoting();
        }, 15000);
    }
    
    endVoting() {
        console.log('📊 Voting ended');
        this.gameState = 'playing';
        this.isEmergency = false;
        
        // Supprimer les interfaces
        const votingInterface = document.getElementById('voting-interface');
        if (votingInterface) {
            votingInterface.remove();
        }
    }
    
    skipVote() {
        this.endVoting();
    }
    
    // Méthodes utilitaires
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    isPlayerInRoom(player, roomName) {
        const room = this.map.rooms[roomName];
        if (!room) return false;
        
        return (
            player.x >= room.x &&
            player.x <= room.x + room.width &&
            player.y >= room.y &&
            player.y <= room.y + room.height
        );
    }
    
    getCurrentRoom(player) {
        for (const [roomName, room] of Object.entries(this.map.rooms)) {
            if (this.isPlayerInRoom(player, roomName)) {
                return roomName;
            }
        }
        return 'corridor';
    }
    
    getRoomDisplayName(roomName) {
        const names = {
            cafeteria: 'Cafétéria',
            weapons: 'Armurerie',
            o2: 'O2',
            navigation: 'Navigation',
            shields: 'Boucliers',
            communications: 'Communications',
            storage: 'Stockage',
            electrical: 'Électricité',
            lowerEngine: 'Moteur Inférieur',
            upperEngine: 'Moteur Supérieur',
            security: 'Sécurité',
            reactor: 'Réacteur',
            medbay: 'Infirmerie',
            admin: 'Administration'
        };
        
        return names[roomName] || roomName;
    }
    
    triggerCrewmateVictory() {
        console.log('🎉 CREWMATES WIN!');
        this.gameState = 'ended';
        
        // Interface de victoire
        const victoryInterface = document.createElement('div');
        victoryInterface.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(39, 174, 96, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        
        victoryInterface.innerHTML = `
            <div>
                <h1 style="font-size: 72px; margin: 0;">🎉 VICTOIRE! 🎉</h1>
                <h2 style="font-size: 36px; margin: 20px 0;">Les Crewmates ont gagné!</h2>
                <p style="font-size: 24px;">Toutes les tâches ont été accomplies!</p>
                <button onclick="location.reload()" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 20px;
                    cursor: pointer;
                    margin-top: 30px;
                ">Nouvelle Partie</button>
            </div>
        `;
        
        document.body.appendChild(victoryInterface);
    }
    
    update(deltaTime) {
        // Mettre à jour l'IA
        this.updateAI(deltaTime);
        
        // Mettre à jour les sabotages
        this.updateSabotages(deltaTime);
        
        // Mettre à jour le timer de jeu
        this.gameTimer += deltaTime;
    }
    
    updateAI(deltaTime) {
        // Logique IA simple pour le mouvement aléatoire
        for (const [id, player] of this.players) {
            if (!player.isAI || !player.isAlive) continue;
            
            // Mouvement aléatoire occasionnel
            if (Math.random() < 0.01) {
                const speed = 100;
                player.velocity.x = (Math.random() - 0.5) * speed;
                player.velocity.y = (Math.random() - 0.5) * speed;
                
                // Arrêter après un moment
                setTimeout(() => {
                    if (player.velocity) {
                        player.velocity.x = 0;
                        player.velocity.y = 0;
                    }
                }, 1000 + Math.random() * 2000);
            }
        }
    }
    
    updateSabotages(deltaTime) {
        // Logique des sabotages (portes, lumières, etc.)
        for (const door of this.doors) {
            if (door.sabotaged && door.timer > 0) {
                door.timer -= deltaTime;
                if (door.timer <= 0) {
                    door.sabotaged = false;
                    console.log(`🚪 Door ${door.id} reopened`);
                }
            }
        }
    }
}

// Export global
window.AmongUsGameplay = AmongUsGameplay;

console.log('✅ Among Us Gameplay System loaded');
