// Among Us V3 - Task System
class AmongUsV3Tasks {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Task system state
        this.tasks = new Map();
        this.playerTasks = new Map();
        this.completedTasks = new Map();
        this.taskProgress = 0;
        
        // Task definitions
        this.taskDefinitions = new Map();
        this.taskCategories = {
            COMMON: 'common',
            SHORT: 'short',
            LONG: 'long',
            VISUAL: 'visual',
            SPECIAL: 'special',
            SABOTAGE: 'sabotage'
        };
        
        // Task minigame components
        this.minigames = {
            wireConnection: new WireMinigame(this),
            cardSwipe: new CardSwipeMinigame(this),
            uploadData: new UploadMinigame(this),
            sampleAnalysis: new SampleAnalysisMinigame(this),
            asteroids: new AsteroidsMinigame(this),
            shields: new ShieldsMinigame(this),
            reactor: new ReactorMinigame(this),
            medbay: new MedbayMinigame(this)
        };
        
        // Task difficulty scaling
        this.difficultySystem = {
            enabled: true,
            currentLevel: 1,
            maxLevel: 5,
            adaptationRate: 0.1,
            factors: {
                completionTime: 1.0,
                failureRate: 1.0,
                complexity: 1.0
            }
        };
        
        // Task locations
        this.taskLocations = new Map();
        
        // Interactive task state
        this.currentTask = null;
        this.taskUI = null;
        
        console.log('📋 Task system created');
    }
    
    async initialize() {
        try {
            // Initialize task definitions
            this.initializeTaskDefinitions();
            
            // Initialize task locations
            this.initializeTaskLocations();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Initialize task UI
            this.initializeTaskUI();
            
            this.isInitialized = true;
            console.log('📋 Task system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize task system:', error);
        }
    }
    
    initializeTaskDefinitions() {
        // Common Tasks (everyone gets these)
        this.taskDefinitions.set('admin-swipe-card', {
            id: 'admin-swipe-card',
            name: 'Admin: Swipe Card',
            category: this.taskCategories.COMMON,
            location: 'admin',
            duration: 3000,
            visual: false,
            description: 'Swipe your ID card at the admin panel',
            steps: ['Insert card', 'Swipe right', 'Wait for confirmation'],
            minigame: 'swipeCard'
        });
        
        this.taskDefinitions.set('electrical-fix-wiring', {
            id: 'electrical-fix-wiring',
            name: 'Electrical: Fix Wiring',
            category: this.taskCategories.COMMON,
            location: 'electrical',
            duration: 5000,
            visual: false,
            description: 'Connect the colored wires correctly',
            steps: ['Match wire colors', 'Connect left to right', 'Complete all connections'],
            minigame: 'fixWiring'
        });
        
        // Visual Tasks (others can see you doing these)
        this.taskDefinitions.set('medbay-submit-scan', {
            id: 'medbay-submit-scan',
            name: 'Medbay: Submit Scan',
            category: this.taskCategories.VISUAL,
            location: 'medbay',
            duration: 10000,
            visual: true,
            description: 'Submit to medical scan',
            steps: ['Step on scanner', 'Wait for scan', 'Review results'],
            minigame: 'medbayScan'
        });
        
        this.taskDefinitions.set('weapons-clear-asteroids', {
            id: 'weapons-clear-asteroids',
            name: 'Weapons: Clear Asteroids',
            category: this.taskCategories.VISUAL,
            location: 'weapons',
            duration: 15000,
            visual: true,
            description: 'Destroy incoming asteroids',
            steps: ['Aim at asteroids', 'Fire weapons', 'Clear all targets'],
            minigame: 'clearAsteroids'
        });
        
        // Short Tasks
        this.taskDefinitions.set('shields-prime-shields', {
            id: 'shields-prime-shields',
            name: 'Shields: Prime Shields',
            category: this.taskCategories.SHORT,
            location: 'shields',
            duration: 2000,
            visual: false,
            description: 'Activate shield systems',
            steps: ['Press red buttons', 'Wait for confirmation'],
            minigame: 'primeShields'
        });
        
        this.taskDefinitions.set('o2-clean-filter', {
            id: 'o2-clean-filter',
            name: 'O2: Clean O2 Filter',
            category: this.taskCategories.SHORT,
            location: 'o2',
            duration: 3000,
            visual: false,
            description: 'Clean the oxygen filter',
            steps: ['Remove old filter', 'Clean debris', 'Install new filter'],
            minigame: 'cleanFilter'
        });
        
        this.taskDefinitions.set('navigation-chart-course', {
            id: 'navigation-chart-course',
            name: 'Navigation: Chart Course',
            category: this.taskCategories.SHORT,
            location: 'navigation',
            duration: 4000,
            visual: false,
            description: 'Set navigation coordinates',
            steps: ['Enter coordinates', 'Confirm route', 'Engage autopilot'],
            minigame: 'chartCourse'
        });
        
        this.taskDefinitions.set('cafeteria-empty-garbage', {
            id: 'cafeteria-empty-garbage',
            name: 'Cafeteria: Empty Garbage',
            category: this.taskCategories.SHORT,
            location: 'cafeteria',
            duration: 2500,
            visual: false,
            description: 'Empty the garbage chute',
            steps: ['Pull lever', 'Wait for disposal'],
            minigame: 'emptyGarbage'
        });
        
        // Long Tasks
        this.taskDefinitions.set('reactor-start-reactor', {
            id: 'reactor-start-reactor',
            name: 'Reactor: Start Reactor',
            category: this.taskCategories.LONG,
            location: 'reactor',
            duration: 12000,
            visual: false,
            description: 'Start the reactor sequence',
            steps: ['Press buttons in sequence', 'Monitor temperature', 'Complete startup'],
            minigame: 'startReactor'
        });
        
        this.taskDefinitions.set('storage-fuel-engines', {
            id: 'storage-fuel-engines',
            name: 'Storage: Fuel Engines',
            category: this.taskCategories.LONG,
            location: 'storage',
            duration: 8000,
            visual: false,
            description: 'Refuel the ship engines',
            steps: ['Get fuel canister', 'Go to engines', 'Fill fuel tank'],
            minigame: 'fuelEngines',
            multiStep: true,
            steps: [
                { location: 'storage', action: 'Get fuel canister' },
                { location: 'upper-engine', action: 'Fill upper engine' },
                { location: 'lower-engine', action: 'Fill lower engine' }
            ]
        });
        
        this.taskDefinitions.set('communications-download-data', {
            id: 'communications-download-data',
            name: 'Communications: Download Data',
            category: this.taskCategories.LONG,
            location: 'communications',
            duration: 9000,
            visual: false,
            description: 'Download communication data',
            steps: ['Start download', 'Wait for completion', 'Upload to admin'],
            minigame: 'downloadData',
            multiStep: true,
            steps: [
                { location: 'communications', action: 'Start download' },
                { location: 'admin', action: 'Upload data' }
            ]
        });
    }
    
    initializeTaskLocations() {
        // Define task locations on the map
        this.taskLocations.set('admin', {
            name: 'Admin',
            position: { x: 1400, y: 300 },
            interactionRadius: 50,
            tasks: ['admin-swipe-card', 'communications-download-data']
        });
        
        this.taskLocations.set('electrical', {
            name: 'Electrical',
            position: { x: 800, y: 600 },
            interactionRadius: 50,
            tasks: ['electrical-fix-wiring']
        });
        
        this.taskLocations.set('medbay', {
            name: 'Medbay',
            position: { x: 1200, y: 400 },
            interactionRadius: 50,
            tasks: ['medbay-submit-scan']
        });
        
        this.taskLocations.set('weapons', {
            name: 'Weapons',
            position: { x: 1600, y: 200 },
            interactionRadius: 50,
            tasks: ['weapons-clear-asteroids']
        });
        
        this.taskLocations.set('shields', {
            name: 'Shields',
            position: { x: 1500, y: 500 },
            interactionRadius: 50,
            tasks: ['shields-prime-shields']
        });
        
        this.taskLocations.set('o2', {
            name: 'O2',
            position: { x: 1300, y: 200 },
            interactionRadius: 50,
            tasks: ['o2-clean-filter']
        });
        
        this.taskLocations.set('navigation', {
            name: 'Navigation',
            position: { x: 1700, y: 300 },
            interactionRadius: 50,
            tasks: ['navigation-chart-course']
        });
        
        this.taskLocations.set('reactor', {
            name: 'Reactor',
            position: { x: 600, y: 400 },
            interactionRadius: 50,
            tasks: ['reactor-start-reactor']
        });
        
        this.taskLocations.set('storage', {
            name: 'Storage',
            position: { x: 1000, y: 700 },
            interactionRadius: 50,
            tasks: ['storage-fuel-engines']
        });
        
        this.taskLocations.set('cafeteria', {
            name: 'Cafeteria',
            position: { x: 900, y: 300 },
            interactionRadius: 50,
            tasks: ['cafeteria-empty-garbage']
        });
        
        this.taskLocations.set('communications', {
            name: 'Communications',
            position: { x: 700, y: 200 },
            interactionRadius: 50,
            tasks: ['communications-download-data']
        });
    }
    
    setupEventHandlers() {
        // Listen to game events
        this.engine.on('gameStarted', this.handleGameStarted.bind(this));
        this.engine.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.engine.on('useButtonClicked', this.handleUseButtonClicked.bind(this));
        this.engine.on('taskInteraction', this.handleTaskInteraction.bind(this));
    }
    
    initializeTaskUI() {
        // Create task UI elements if they don't exist
        this.createTaskListUI();
        this.createTaskInteractionUI();
    }
    
    createTaskListUI() {
        let taskList = document.getElementById('task-list');
        if (!taskList) {
            taskList = document.createElement('div');
            taskList.id = 'task-list';
            taskList.className = 'task-list';
            taskList.innerHTML = `
                <div class="task-list-header">
                    <h3>Tâches</h3>
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="task-progress-fill"></div>
                        </div>
                        <span class="progress-text" id="task-progress-text">0/0</span>
                    </div>
                </div>
                <div class="task-list-content" id="task-list-content">
                    <!-- Tasks will be populated here -->
                </div>
            `;
            
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.appendChild(taskList);
            }
        }
    }
    
    createTaskInteractionUI() {
        let taskUI = document.getElementById('task-interaction-ui');
        if (!taskUI) {
            taskUI = document.createElement('div');
            taskUI.id = 'task-interaction-ui';
            taskUI.className = 'task-interaction-ui hidden';
            taskUI.innerHTML = `
                <div class="task-modal">
                    <div class="task-header">
                        <h3 id="task-title">Task Name</h3>
                        <button class="task-close" id="task-close-btn">×</button>
                    </div>
                    <div class="task-content">
                        <div class="task-description" id="task-description">
                            Task description goes here
                        </div>
                        <div class="task-minigame" id="task-minigame">
                            <!-- Minigame content -->
                        </div>
                        <div class="task-progress-bar">
                            <div class="progress-fill" id="task-interaction-progress"></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(taskUI);
            this.taskUI = taskUI;
            
            // Setup close button
            const closeBtn = taskUI.querySelector('#task-close-btn');
            closeBtn.addEventListener('click', () => {
                this.closeTaskUI();
            });
        }
    }
    
    // Task assignment and management
    assignTasksToPlayer(playerId, gameSettings) {
        const tasks = [];
        const taskDefs = Array.from(this.taskDefinitions.values());
        
        // Assign common tasks
        const commonTasks = taskDefs.filter(t => t.category === this.taskCategories.COMMON);
        const selectedCommon = commonTasks.slice(0, gameSettings.commonTasks || 1);
        tasks.push(...selectedCommon);
        
        // Assign short tasks
        const shortTasks = taskDefs.filter(t => t.category === this.taskCategories.SHORT);
        const shuffledShort = shortTasks.sort(() => Math.random() - 0.5);
        const selectedShort = shuffledShort.slice(0, gameSettings.shortTasks || 2);
        tasks.push(...selectedShort);
        
        // Assign long tasks
        const longTasks = taskDefs.filter(t => t.category === this.taskCategories.LONG);
        const shuffledLong = longTasks.sort(() => Math.random() - 0.5);
        const selectedLong = shuffledLong.slice(0, gameSettings.longTasks || 1);
        tasks.push(...selectedLong);
        
        // Add visual tasks if enabled
        if (gameSettings.visualTasks) {
            const visualTasks = taskDefs.filter(t => t.category === this.taskCategories.VISUAL);
            const selectedVisual = visualTasks.slice(0, 1);
            tasks.push(...selectedVisual);
        }
        
        // Create player task instances
        const playerTasks = tasks.map(taskDef => ({
            id: this.generateTaskInstanceId(),
            definitionId: taskDef.id,
            playerId: playerId,
            completed: false,
            progress: 0,
            currentStep: 0,
            startTime: null,
            completionTime: null,
            location: taskDef.location,
            name: taskDef.name,
            description: taskDef.description,
            category: taskDef.category,
            visual: taskDef.visual,
            multiStep: taskDef.multiStep || false,
            steps: taskDef.steps || []
        }));
        
        this.playerTasks.set(playerId, playerTasks);
        this.updateTaskListUI(playerId);
        
        console.log(`📋 Assigned ${playerTasks.length} tasks to player ${playerId}`);
        return playerTasks;
    }
    
    getPlayerTasks(playerId) {
        return this.playerTasks.get(playerId) || [];
    }
    
    getTasksAtLocation(location) {
        const locationData = this.taskLocations.get(location);
        return locationData ? locationData.tasks : [];
    }
    
    getAvailableTasksAtPosition(playerId, position) {
        const playerTasks = this.getPlayerTasks(playerId);
        const availableTasks = [];
        
        for (let [locationId, locationData] of this.taskLocations) {
            const distance = this.calculateDistance(position, locationData.position);
            
            if (distance <= locationData.interactionRadius) {
                // Check if player has tasks at this location
                const tasksAtLocation = playerTasks.filter(task => 
                    task.location === locationId && !task.completed
                );
                
                availableTasks.push(...tasksAtLocation);
            }
        }
        
        return availableTasks;
    }
    
    // Task interaction
    startTask(playerId, taskId) {
        const playerTasks = this.getPlayerTasks(playerId);
        const task = playerTasks.find(t => t.id === taskId);
        
        if (!task || task.completed) {
            console.warn(`Cannot start task ${taskId} for player ${playerId}`);
            return false;
        }
        
        task.startTime = Date.now();
        this.currentTask = task;
        
        // Show task UI
        this.showTaskUI(task);
        
        // Start task minigame
        this.startTaskMinigame(task);
        
        this.engine.emit('taskStarted', { playerId, task });
        console.log(`📋 Started task: ${task.name}`);
        
        return true;
    }
    
    completeTask(playerId, taskId) {
        const playerTasks = this.getPlayerTasks(playerId);
        const task = playerTasks.find(t => t.id === taskId);
        
        if (!task || task.completed) {
            console.warn(`Cannot complete task ${taskId} for player ${playerId}`);
            return false;
        }
        
        task.completed = true;
        task.progress = 100;
        task.completionTime = Date.now();
        
        // Update completed tasks map
        this.completedTasks.set(task.id, task);
        
        // Update task progress
        this.updateTaskProgress();
        
        // Update UI
        this.updateTaskListUI(playerId);
        this.closeTaskUI();
        
        // Emit events
        this.engine.emit('taskCompleted', { 
            playerId, 
            task,
            totalProgress: this.taskProgress
        });
        
        // Create visual effects
        this.engine.emit('taskCompletedEffect', {
            position: this.taskLocations.get(task.location)?.position,
            task: task
        });
        
        console.log(`📋 Completed task: ${task.name} (${this.taskProgress.toFixed(1)}% total)`);
        
        return true;
    }
    
    updateTaskProgress() {
        let totalTasks = 0;
        let completedTasks = 0;
        
        for (let [playerId, tasks] of this.playerTasks) {
            totalTasks += tasks.length;
            completedTasks += tasks.filter(t => t.completed).length;
        }
        
        this.taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Update progress UI
        const progressFill = document.getElementById('task-progress-fill');
        const progressText = document.getElementById('task-progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${this.taskProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completedTasks}/${totalTasks}`;
        }
    }
    
    // Task UI management
    showTaskUI(task) {
        if (!this.taskUI) return;
        
        const title = this.taskUI.querySelector('#task-title');
        const description = this.taskUI.querySelector('#task-description');
        
        if (title) title.textContent = task.name;
        if (description) description.textContent = task.description;
        
        this.taskUI.classList.remove('hidden');
    }
    
    closeTaskUI() {
        if (this.taskUI) {
            this.taskUI.classList.add('hidden');
        }
        
        this.currentTask = null;
    }
    
    updateTaskListUI(playerId) {
        const taskListContent = document.getElementById('task-list-content');
        if (!taskListContent) return;
        
        const playerTasks = this.getPlayerTasks(playerId);
        
        taskListContent.innerHTML = '';
        
        playerTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-icon">
                    <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-location">${this.taskLocations.get(task.location)?.name || task.location}</div>
                </div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
            `;
            
            taskListContent.appendChild(taskElement);
        });
    }
    
    // Task minigames
    startTaskMinigame(task) {
        const minigameContainer = document.getElementById('task-minigame');
        if (!minigameContainer) return;
        
        const taskDef = this.taskDefinitions.get(task.definitionId);
        if (!taskDef || !taskDef.minigame) return;
        
        switch (taskDef.minigame) {
            case 'swipeCard':
                this.createSwipeCardMinigame(minigameContainer, task);
                break;
            case 'fixWiring':
                this.createFixWiringMinigame(minigameContainer, task);
                break;
            case 'medbayScan':
                this.createMedbayScanMinigame(minigameContainer, task);
                break;
            case 'clearAsteroids':
                this.createClearAsteroidsMinigame(minigameContainer, task);
                break;
            case 'primeShields':
                this.createPrimeShieldsMinigame(minigameContainer, task);
                break;
            case 'cleanFilter':
                this.createCleanFilterMinigame(minigameContainer, task);
                break;
            case 'chartCourse':
                this.createChartCourseMinigame(minigameContainer, task);
                break;
            case 'startReactor':
                this.createStartReactorMinigame(minigameContainer, task);
                break;
            case 'fuelEngines':
                this.createFuelEnginesMinigame(minigameContainer, task);
                break;
            case 'downloadData':
                this.createDownloadDataMinigame(minigameContainer, task);
                break;
            case 'emptyGarbage':
                this.createEmptyGarbageMinigame(minigameContainer, task);
                break;
            default:
                this.createDefaultMinigame(minigameContainer, task);
        }
    }
    
    createSwipeCardMinigame(container, task) {
        container.innerHTML = `
            <div class="swipe-card-game">
                <div class="card-reader">
                    <div class="card-slot"></div>
                    <div class="swipe-instruction">Glissez la carte vers la droite</div>
                </div>
                <div class="id-card" id="swipe-card" draggable="true">
                    <div class="card-content">ID CARD</div>
                </div>
            </div>
        `;
        
        const card = container.querySelector('#swipe-card');
        let isDragging = false;
        let startX = 0;
        
        card.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            if (deltaX > 0) {
                card.style.transform = `translateX(${Math.min(deltaX, 200)}px)`;
                
                if (deltaX > 150) {
                    this.completeTask(task.playerId, task.id);
                    isDragging = false;
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                card.style.transform = 'translateX(0)';
                isDragging = false;
            }
        });
    }
    
    createFixWiringMinigame(container, task) {
        const colors = ['red', 'blue', 'yellow', 'pink'];
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        container.innerHTML = `
            <div class="wiring-game">
                <div class="wire-panel left-panel">
                    ${colors.map(color => `
                        <div class="wire-connector left" data-color="${color}">
                            <div class="wire-end ${color}"></div>
                        </div>
                    `).join('')}
                </div>
                <div class="wire-panel right-panel">
                    ${shuffledColors.map(color => `
                        <div class="wire-connector right" data-color="${color}">
                            <div class="wire-end ${color}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        let connections = 0;
        const leftConnectors = container.querySelectorAll('.wire-connector.left');
        const rightConnectors = container.querySelectorAll('.wire-connector.right');
        
        leftConnectors.forEach(left => {
            left.addEventListener('click', () => {
                const color = left.dataset.color;
                const matchingRight = Array.from(rightConnectors).find(right => 
                    right.dataset.color === color && !right.classList.contains('connected')
                );
                
                if (matchingRight) {
                    left.classList.add('connected');
                    matchingRight.classList.add('connected');
                    connections++;
                    
                    if (connections === colors.length) {
                        setTimeout(() => {
                            this.completeTask(task.playerId, task.id);
                        }, 500);
                    }
                }
            });
        });
    }
    
    createMedbayScanMinigame(container, task) {
        container.innerHTML = `
            <div class="medbay-scan-game">
                <div class="scanner-display">
                    <div class="scan-progress">
                        <div class="scan-line"></div>
                        <div class="scan-fill" id="scan-fill"></div>
                    </div>
                    <div class="scan-text">Analyse en cours...</div>
                </div>
            </div>
        `;
        
        const scanFill = container.querySelector('#scan-fill');
        let progress = 0;
        
        const scanInterval = setInterval(() => {
            progress += 2;
            scanFill.style.height = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(scanInterval);
                setTimeout(() => {
                    this.completeTask(task.playerId, task.id);
                }, 500);
            }
        }, 100);
    }
    
    createDefaultMinigame(container, task) {
        container.innerHTML = `
            <div class="default-task-game">
                <div class="task-animation">
                    <div class="loading-spinner"></div>
                    <div class="task-text">Exécution de la tâche...</div>
                </div>
                <button class="complete-task-btn" id="complete-task-btn">Terminer</button>
            </div>
        `;
        
        const completeBtn = container.querySelector('#complete-task-btn');
        completeBtn.addEventListener('click', () => {
            this.completeTask(task.playerId, task.id);
        });
    }
    
    // Event handlers
    handleGameStarted(data) {
        const { players, settings } = data;
        
        // Assign tasks to all crewmate players
        players.forEach(player => {
            if (player.role === 'crewmate') {
                this.assignTasksToPlayer(player.id, settings);
            }
        });
        
        this.updateTaskProgress();
    }
    
    handlePlayerMoved(data) {
        const { player } = data;
        
        // Check for nearby tasks
        const availableTasks = this.getAvailableTasksAtPosition(player.id, player.position);
        
        // Show/hide use button based on available tasks
        const useButton = document.getElementById('use-button');
        if (useButton) {
            if (availableTasks.length > 0) {
                useButton.style.display = 'block';
                useButton.textContent = `Use (${availableTasks.length})`;
            } else {
                useButton.style.display = 'none';
            }
        }
    }
    
    handleUseButtonClicked(data) {
        // Get current player (this would come from the game state)
        const currentPlayer = this.engine.getCurrentPlayer();
        if (!currentPlayer) return;
        
        const availableTasks = this.getAvailableTasksAtPosition(
            currentPlayer.id, 
            currentPlayer.position
        );
        
        if (availableTasks.length > 0) {
            // Start the first available task
            this.startTask(currentPlayer.id, availableTasks[0].id);
        }
    }
    
    handleTaskInteraction(data) {
        const { playerId, taskId, action } = data;
        
        switch (action) {
            case 'start':
                this.startTask(playerId, taskId);
                break;
            case 'complete':
                this.completeTask(playerId, taskId);
                break;
            case 'cancel':
                this.closeTaskUI();
                break;
        }
    }
    
    // Utility methods
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    generateTaskInstanceId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public API methods
    getTaskProgress() {
        return this.taskProgress;
    }
    
    getCompletedTasksCount() {
        return this.completedTasks.size;
    }
    
    getTotalTasksCount() {
        let total = 0;
        for (let tasks of this.playerTasks.values()) {
            total += tasks.length;
        }
        return total;
    }
    
    isAllTasksCompleted() {
        return this.taskProgress >= 100;
    }
    
    getTaskDefinition(taskId) {
        return this.taskDefinitions.get(taskId);
    }
    
    // Update method
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update current task progress if any
        if (this.currentTask && this.currentTask.startTime) {
            const elapsed = Date.now() - this.currentTask.startTime;
            const taskDef = this.taskDefinitions.get(this.currentTask.definitionId);
            
            if (taskDef) {
                const progress = Math.min((elapsed / taskDef.duration) * 100, 100);
                this.currentTask.progress = progress;
                
                // Update progress bar in UI
                const progressBar = document.getElementById('task-interaction-progress');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }
        }
    }
    
    // Cleanup
    destroy() {
        this.tasks.clear();
        this.playerTasks.clear();
        this.completedTasks.clear();
        this.taskDefinitions.clear();
        this.taskLocations.clear();
        
        this.currentTask = null;
        this.taskProgress = 0;
        
        // Remove UI elements
        const taskList = document.getElementById('task-list');
        if (taskList && taskList.parentNode) {
            taskList.parentNode.removeChild(taskList);
        }
        
        const taskUI = document.getElementById('task-interaction-ui');
        if (taskUI && taskUI.parentNode) {
            taskUI.parentNode.removeChild(taskUI);
        }
        
        this.isInitialized = false;
        console.log('📋 Task system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Tasks = AmongUsV3Tasks;