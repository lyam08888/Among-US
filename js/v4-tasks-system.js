// Among Us V4 - Tasks System
class TasksSystem {
    constructor(app) {
        this.app = app;
        this.activeTasks = new Map();
        this.taskDefinitions = new Map();
        this.currentTask = null;
        
        this.initializeTaskDefinitions();
    }
    
    initializeTaskDefinitions() {
        // Définir tous les types de tâches
        this.taskDefinitions.set('fix-wiring', {
            name: 'Réparer les câbles',
            description: 'Connectez les câbles de même couleur',
            duration: 3000,
            difficulty: 'easy',
            minigame: 'wiring',
            locations: ['electrical', 'admin', 'navigation']
        });
        
        this.taskDefinitions.set('swipe-card', {
            name: 'Scanner la carte',
            description: 'Glissez votre carte d\'identité',
            duration: 2000,
            difficulty: 'medium',
            minigame: 'cardswipe',
            locations: ['admin']
        });
        
        this.taskDefinitions.set('fuel-engines', {
            name: 'Faire le plein',
            description: 'Remplissez le réservoir de carburant',
            duration: 4000,
            difficulty: 'easy',
            minigame: 'fuel',
            locations: ['storage', 'upper-engine', 'lower-engine']
        });
        
        this.taskDefinitions.set('calibrate-distributor', {
            name: 'Calibrer distributeur',
            description: 'Alignez les curseurs sur la cible',
            duration: 5000,
            difficulty: 'hard',
            minigame: 'calibration',
            locations: ['electrical']
        });
        
        this.taskDefinitions.set('chart-course', {
            name: 'Tracer la route',
            description: 'Définissez la trajectoire du vaisseau',
            duration: 3000,
            difficulty: 'medium',
            minigame: 'navigation',
            locations: ['navigation']
        });
        
        this.taskDefinitions.set('inspect-sample', {
            name: 'Analyser échantillon',
            description: 'Attendez que l\'analyse se termine',
            duration: 60000,
            difficulty: 'easy',
            minigame: 'sample',
            locations: ['medbay']
        });
        
        this.taskDefinitions.set('empty-garbage', {
            name: 'Vider poubelles',
            description: 'Tirez le levier pour vider',
            duration: 2000,
            difficulty: 'easy',
            minigame: 'garbage',
            locations: ['cafeteria', 'o2']
        });
        
        this.taskDefinitions.set('download-data', {
            name: 'Télécharger données',
            description: 'Attendez la fin du téléchargement',
            duration: 8000,
            difficulty: 'easy',
            minigame: 'download',
            locations: ['electrical', 'navigation', 'communications']
        });
        
        this.taskDefinitions.set('align-engine', {
            name: 'Aligner moteur',
            description: 'Stabilisez la sortie du moteur',
            duration: 4000,
            difficulty: 'medium',
            minigame: 'engine',
            locations: ['upper-engine', 'lower-engine']
        });
        
        this.taskDefinitions.set('stabilize-steering', {
            name: 'Stabiliser direction',
            description: 'Maintenez le curseur au centre',
            duration: 6000,
            difficulty: 'hard',
            minigame: 'steering',
            locations: ['navigation']
        });
    }
    
    startTask(taskId, playerId) {
        const player = this.app.gameState.players.get(playerId);
        if (!player) return false;
        
        const task = player.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return false;
        
        const taskDef = this.taskDefinitions.get(task.type);
        if (!taskDef) return false;
        
        console.log(`🔧 Starting task: ${taskDef.name}`);
        
        this.currentTask = {
            ...task,
            definition: taskDef,
            playerId: playerId,
            startTime: Date.now(),
            progress: 0
        };
        
        // Afficher l'interface de la tâche
        this.showTaskInterface(this.currentTask);
        
        // Jouer le son de début de tâche
        this.app.audioSystem.playSound('task-progress');
        
        return true;
    }
    
    showTaskInterface(task) {
        // Créer l'interface de la tâche
        const taskInterface = this.createTaskInterface(task);
        document.body.appendChild(taskInterface);
        
        // Démarrer le mini-jeu approprié
        this.startMinigame(task);
    }
    
    createTaskInterface(task) {
        const container = document.createElement('div');
        container.className = 'v4-task-interface';
        container.id = 'task-interface';
        
        container.innerHTML = `
            <div class="v4-task-modal">
                <div class="v4-task-header">
                    <h3>${task.definition.name}</h3>
                    <button class="v4-task-close" onclick="tasksSystem.cancelTask()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="v4-task-content">
                    <p class="v4-task-description">${task.definition.description}</p>
                    <div class="v4-task-game" id="task-game-area">
                        <!-- Le mini-jeu sera inséré ici -->
                    </div>
                    <div class="v4-task-progress">
                        <div class="v4-progress-bar">
                            <div class="v4-progress-fill" id="task-progress-fill"></div>
                        </div>
                        <span class="v4-progress-text" id="task-progress-text">0%</span>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    }
    
    startMinigame(task) {
        const gameArea = document.getElementById('task-game-area');
        if (!gameArea) return;
        
        switch (task.definition.minigame) {
            case 'wiring':
                this.createWiringMinigame(gameArea);
                break;
            case 'cardswipe':
                this.createCardSwipeMinigame(gameArea);
                break;
            case 'fuel':
                this.createFuelMinigame(gameArea);
                break;
            case 'calibration':
                this.createCalibrationMinigame(gameArea);
                break;
            case 'navigation':
                this.createNavigationMinigame(gameArea);
                break;
            case 'sample':
                this.createSampleMinigame(gameArea);
                break;
            case 'garbage':
                this.createGarbageMinigame(gameArea);
                break;
            case 'download':
                this.createDownloadMinigame(gameArea);
                break;
            case 'engine':
                this.createEngineMinigame(gameArea);
                break;
            case 'steering':
                this.createSteeringMinigame(gameArea);
                break;
            default:
                this.createGenericMinigame(gameArea);
        }
    }
    
    createWiringMinigame(container) {
        const colors = ['red', 'blue', 'yellow', 'pink'];
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        container.innerHTML = `
            <div class="wiring-game">
                <div class="wiring-left">
                    ${colors.map((color, i) => `
                        <div class="wire-start ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
                <div class="wiring-right">
                    ${shuffledColors.map((color, i) => `
                        <div class="wire-end ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.setupWiringInteraction();
    }
    
    setupWiringInteraction() {
        let selectedWire = null;
        let connections = 0;
        
        document.querySelectorAll('.wire-start').forEach(wire => {
            wire.addEventListener('click', () => {
                if (selectedWire) selectedWire.classList.remove('selected');
                selectedWire = wire;
                wire.classList.add('selected');
            });
        });
        
        document.querySelectorAll('.wire-end').forEach(wire => {
            wire.addEventListener('click', () => {
                if (selectedWire && selectedWire.dataset.color === wire.dataset.color) {
                    selectedWire.classList.add('connected');
                    wire.classList.add('connected');
                    selectedWire = null;
                    connections++;
                    
                    this.updateTaskProgress(connections / 4);
                    
                    if (connections === 4) {
                        setTimeout(() => this.completeTask(), 500);
                    }
                }
            });
        });
    }
    
    createCardSwipeMinigame(container) {
        container.innerHTML = `
            <div class="cardswipe-game">
                <div class="card-reader">
                    <div class="card-slot"></div>
                    <div class="card" id="swipe-card">
                        <div class="card-content">ID CARD</div>
                    </div>
                </div>
                <p class="swipe-instruction">Glissez la carte vers la droite</p>
            </div>
        `;
        
        this.setupCardSwipeInteraction();
    }
    
    setupCardSwipeInteraction() {
        const card = document.getElementById('swipe-card');
        let isDragging = false;
        let startX = 0;
        
        card.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                if (deltaX > 0 && deltaX < 200) {
                    card.style.transform = `translateX(${deltaX}px)`;
                    this.updateTaskProgress(deltaX / 200);
                }
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                if (deltaX >= 180) {
                    this.completeTask();
                } else {
                    card.style.transform = 'translateX(0)';
                    this.updateTaskProgress(0);
                }
                isDragging = false;
            }
        });
    }
    
    createGenericMinigame(container) {
        container.innerHTML = `
            <div class="generic-task">
                <div class="task-spinner">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <p>Tâche en cours...</p>
            </div>
        `;
        
        // Progression automatique
        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.02;
            this.updateTaskProgress(progress);
            
            if (progress >= 1) {
                clearInterval(interval);
                this.completeTask();
            }
        }, 100);
    }
    
    updateTaskProgress(progress) {
        if (!this.currentTask) return;
        
        this.currentTask.progress = Math.max(0, Math.min(1, progress));
        
        const progressFill = document.getElementById('task-progress-fill');
        const progressText = document.getElementById('task-progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${this.currentTask.progress * 100}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.currentTask.progress * 100)}%`;
        }
    }
    
    completeTask() {
        if (!this.currentTask) return;
        
        console.log(`✅ Task completed: ${this.currentTask.definition.name}`);
        
        // Marquer la tâche comme terminée
        const player = this.app.gameState.players.get(this.currentTask.playerId);
        if (player) {
            const task = player.tasks.find(t => t.id === this.currentTask.id);
            if (task) {
                task.completed = true;
            }
        }
        
        // Jouer le son de tâche terminée
        this.app.audioSystem.playTaskComplete();
        
        // Notifier le système de jeu
        document.dispatchEvent(new CustomEvent('task-completed', {
            detail: {
                playerId: this.currentTask.playerId,
                taskId: this.currentTask.id
            }
        }));
        
        // Fermer l'interface après un délai
        setTimeout(() => {
            this.closeTaskInterface();
        }, 1000);
    }
    
    cancelTask() {
        console.log('❌ Task cancelled');
        this.closeTaskInterface();
    }
    
    closeTaskInterface() {
        const taskInterface = document.getElementById('task-interface');
        if (taskInterface) {
            taskInterface.remove();
        }
        
        this.currentTask = null;
    }
    
    // Méthodes utilitaires
    getTasksForPlayer(playerId) {
        const player = this.app.gameState.players.get(playerId);
        return player ? player.tasks : [];
    }
    
    getCompletedTasksCount(playerId) {
        const tasks = this.getTasksForPlayer(playerId);
        return tasks.filter(t => t.completed).length;
    }
    
    getTotalTasksCount(playerId) {
        const tasks = this.getTasksForPlayer(playerId);
        return tasks.length;
    }
    
    getTaskProgress(playerId) {
        const total = this.getTotalTasksCount(playerId);
        const completed = this.getCompletedTasksCount(playerId);
        return total > 0 ? completed / total : 0;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TasksSystem;
} else if (typeof window !== 'undefined') {
    window.TasksSystem = TasksSystem;
}