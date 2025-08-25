// Among Us V4 - Système d'Interactions Avancé
console.log('🔧 Initializing Among Us Interaction System...');

class AmongUsInteractions {
    constructor(renderer, gameplay, animations) {
        this.renderer = renderer;
        this.gameplay = gameplay;
        this.animations = animations;
        this.interactables = new Map();
        this.activeInteraction = null;
        this.interactionRange = 80;
        this.hoverTarget = null;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Setting up interaction system...');
        
        this.createInteractables();
        this.setupEventListeners();
        this.createUI();
        
        console.log('✅ Interaction system initialized');
    }
    
    createInteractables() {
        console.log('🎯 Creating interactable objects...');
        
        // Créer les objets interactifs pour chaque salle
        this.createTaskInteractables();
        this.createVentInteractables();
        this.createDoorInteractables();
        this.createEmergencyButton();
        this.createSabotageTargets();
        this.createUtilityObjects();
    }
    
    createTaskInteractables() {
        console.log('📋 Creating task interactables...');
        
        // Tâches par salle avec positions spécifiques
        const taskPositions = {
            electrical: [
                { type: 'fix-wiring', x: 580, y: 560, name: 'Réparer Câblage' },
                { type: 'calibrate-distributor', x: 550, y: 540, name: 'Calibrer Distributeur' },
                { type: 'divert-power', x: 520, y: 580, name: 'Dévier Énergie' }
            ],
            weapons: [
                { type: 'download-data', x: 160, y: 200, name: 'Télécharger Données' },
                { type: 'clear-asteroids', x: 140, y: 180, name: 'Détruire Astéroïdes' }
            ],
            o2: [
                { type: 'empty-garbage', x: 150, y: 350, name: 'Vider Poubelles' },
                { type: 'clean-filter', x: 130, y: 330, name: 'Nettoyer Filtre' }
            ],
            navigation: [
                { type: 'chart-course', x: 640, y: 180, name: 'Tracer Route' },
                { type: 'download-data', x: 660, y: 200, name: 'Télécharger Données' }
            ],
            shields: [
                { type: 'prime-shields', x: 690, y: 340, name: 'Amorcer Boucliers' }
            ],
            communications: [
                { type: 'download-data', x: 180, y: 490, name: 'Télécharger Données' }
            ],
            storage: [
                { type: 'fuel-engines', x: 340, y: 540, name: 'Faire le Plein' },
                { type: 'empty-garbage', x: 360, y: 520, name: 'Vider Poubelles' }
            ],
            medbay: [
                { type: 'submit-scan', x: 540, y: 290, name: 'Scanner Médical' },
                { type: 'inspect-sample', x: 560, y: 270, name: 'Inspecter Échantillon' }
            ],
            admin: [
                { type: 'fix-wiring', x: 440, y: 440, name: 'Réparer Câblage' },
                { type: 'swipe-card', x: 420, y: 420, name: 'Carte d\'Accès' }
            ],
            cafeteria: [
                { type: 'fix-wiring', x: 440, y: 330, name: 'Réparer Câblage' },
                { type: 'empty-garbage', x: 460, y: 350, name: 'Vider Poubelles' }
            ],
            upperEngine: [
                { type: 'fuel-engines', x: 190, y: 90, name: 'Faire le Plein' },
                { type: 'align-engine', x: 210, y: 110, name: 'Aligner Moteur' }
            ],
            lowerEngine: [
                { type: 'fuel-engines', x: 190, y: 690, name: 'Faire le Plein' },
                { type: 'align-engine', x: 210, y: 710, name: 'Aligner Moteur' }
            ],
            reactor: [
                { type: 'start-reactor', x: 90, y: 400, name: 'Démarrer Réacteur' },
                { type: 'unlock-manifolds', x: 110, y: 420, name: 'Débloquer Collecteurs' }
            ],
            security: [
                { type: 'fix-wiring', x: 340, y: 440, name: 'Réparer Câblage' }
            ]
        };
        
        for (const [room, tasks] of Object.entries(taskPositions)) {
            for (const task of tasks) {
                const interactableId = `task_${room}_${task.type}`;
                this.interactables.set(interactableId, {
                    id: interactableId,
                    type: 'task',
                    subtype: task.type,
                    x: task.x,
                    y: task.y,
                    room: room,
                    name: task.name,
                    available: true,
                    completed: false,
                    icon: '📋',
                    color: '#3498db',
                    glowColor: '#2980b9'
                });
            }
        }
    }
    
    createVentInteractables() {
        console.log('🌪️ Creating vent interactables...');
        
        if (this.gameplay && this.gameplay.vents) {
            for (const vent of this.gameplay.vents) {
                this.interactables.set(vent.id, {
                    id: vent.id,
                    type: 'vent',
                    x: vent.x,
                    y: vent.y,
                    room: vent.room,
                    name: 'Conduit d\'Aération',
                    available: true,
                    connected: vent.connected,
                    icon: '🌪️',
                    color: '#34495e',
                    glowColor: '#2c3e50',
                    impostorOnly: true
                });
            }
        }
    }
    
    createDoorInteractables() {
        console.log('🚪 Creating door interactables...');
        
        if (this.gameplay && this.gameplay.doors) {
            for (const door of this.gameplay.doors) {
                this.interactables.set(door.id, {
                    id: door.id,
                    type: 'door',
                    x: door.x,
                    y: door.y,
                    room: door.room,
                    name: 'Porte',
                    available: true,
                    sabotaged: door.sabotaged,
                    icon: '🚪',
                    color: door.sabotaged ? '#e74c3c' : '#95a5a6',
                    glowColor: door.sabotaged ? '#c0392b' : '#7f8c8d'
                });
            }
        }
    }
    
    createEmergencyButton() {
        console.log('🚨 Creating emergency button...');
        
        this.interactables.set('emergency_button', {
            id: 'emergency_button',
            type: 'emergency',
            x: 450,
            y: 350, // Centre de la cafétéria
            room: 'cafeteria',
            name: 'Bouton d\'Urgence',
            available: true,
            icon: '🚨',
            color: '#e74c3c',
            glowColor: '#c0392b',
            scale: 1.5
        });
    }
    
    createSabotageTargets() {
        console.log('⚡ Creating sabotage targets...');
        
        const sabotageTargets = [
            { id: 'sabotage_lights', x: 570, y: 550, room: 'electrical', name: 'Sabotage Lumières', icon: '💡' },
            { id: 'sabotage_o2', x: 160, y: 340, room: 'o2', name: 'Sabotage O2', icon: '💨' },
            { id: 'sabotage_comms', x: 190, y: 480, room: 'communications', name: 'Sabotage Communications', icon: '📡' },
            { id: 'sabotage_reactor', x: 100, y: 410, room: 'reactor', name: 'Sabotage Réacteur', icon: '☢️' }
        ];
        
        for (const sabotage of sabotageTargets) {
            this.interactables.set(sabotage.id, {
                id: sabotage.id,
                type: 'sabotage',
                x: sabotage.x,
                y: sabotage.y,
                room: sabotage.room,
                name: sabotage.name,
                available: true,
                icon: sabotage.icon,
                color: '#e67e22',
                glowColor: '#d35400',
                impostorOnly: true
            });
        }
    }
    
    createUtilityObjects() {
        console.log('🔧 Creating utility objects...');
        
        const utilityObjects = [
            { id: 'security_cameras', x: 330, y: 460, room: 'security', name: 'Caméras de Sécurité', icon: '📹' },
            { id: 'admin_table', x: 430, y: 450, room: 'admin', name: 'Table d\'Administration', icon: '🗺️' },
            { id: 'vitals', x: 550, y: 310, room: 'medbay', name: 'Signes Vitaux', icon: '💓' }
        ];
        
        for (const utility of utilityObjects) {
            this.interactables.set(utility.id, {
                id: utility.id,
                type: 'utility',
                x: utility.x,
                y: utility.y,
                room: utility.room,
                name: utility.name,
                available: true,
                icon: utility.icon,
                color: '#9b59b6',
                glowColor: '#8e44ad'
            });
        }
    }
    
    setupEventListeners() {
        console.log('👂 Setting up interaction event listeners...');
        
        if (this.renderer && this.renderer.canvas) {
            this.renderer.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.renderer.canvas.addEventListener('click', (e) => this.handleClick(e));
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }
    }
    
    createUI() {
        console.log('🖥️ Creating interaction UI...');
        
        // Créer l'interface d'interaction
        const interactionUI = document.createElement('div');
        interactionUI.id = 'interaction-ui';
        interactionUI.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            display: none;
            z-index: 1000;
            border: 2px solid #3498db;
            box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
        `;
        
        document.body.appendChild(interactionUI);
        
        // Créer l'indicateur de proximité
        const proximityIndicator = document.createElement('div');
        proximityIndicator.id = 'proximity-indicator';
        proximityIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 999;
        `;
        
        document.body.appendChild(proximityIndicator);
    }
    
    handleMouseMove(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.checkHover(x, y);
    }
    
    handleClick(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.handleInteraction(x, y);
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'e':
            case ' ':
                this.useNearestInteractable();
                break;
            case 'escape':
                this.cancelActiveInteraction();
                break;
        }
    }
    
    checkHover(x, y) {
        const player = this.getLocalPlayer();
        if (!player) return;
        
        let closestInteractable = null;
        let closestDistance = Infinity;
        
        for (const [id, interactable] of this.interactables) {
            if (!this.canInteractWith(player, interactable)) continue;
            
            const distance = this.getDistance(x, y, interactable.x, interactable.y);
            
            if (distance < 30 && distance < closestDistance) {
                closestDistance = distance;
                closestInteractable = interactable;
            }
        }
        
        if (closestInteractable !== this.hoverTarget) {
            this.hoverTarget = closestInteractable;
            this.updateHoverUI();
        }
    }
    
    handleInteraction(x, y) {
        const player = this.getLocalPlayer();
        if (!player) return;
        
        let closestInteractable = null;
        let closestDistance = Infinity;
        
        for (const [id, interactable] of this.interactables) {
            if (!this.canInteractWith(player, interactable)) continue;
            
            const distance = this.getDistance(x, y, interactable.x, interactable.y);
            
            if (distance < 40 && distance < closestDistance) {
                closestDistance = distance;
                closestInteractable = interactable;
            }
        }
        
        if (closestInteractable) {
            this.startInteraction(closestInteractable);
        }
    }
    
    useNearestInteractable() {
        const player = this.getLocalPlayer();
        if (!player) return;
        
        let closestInteractable = null;
        let closestDistance = Infinity;
        
        for (const [id, interactable] of this.interactables) {
            if (!this.canInteractWith(player, interactable)) continue;
            
            const distance = this.getDistance(player.x, player.y, interactable.x, interactable.y);
            
            if (distance < this.interactionRange && distance < closestDistance) {
                closestDistance = distance;
                closestInteractable = interactable;
            }
        }
        
        if (closestInteractable) {
            this.startInteraction(closestInteractable);
        }
    }
    
    canInteractWith(player, interactable) {
        if (!interactable.available) return false;
        
        // Vérifier si le joueur est imposteur pour les objets imposteur-only
        if (interactable.impostorOnly && !player.isImpostor) return false;
        
        // Vérifier si le joueur est dans la bonne salle
        const playerRoom = this.getCurrentRoom(player);
        if (interactable.room && playerRoom !== interactable.room) return false;
        
        return true;
    }
    
    startInteraction(interactable) {
        console.log(`🔧 Starting interaction with: ${interactable.name}`);
        
        this.activeInteraction = interactable;
        
        switch (interactable.type) {
            case 'task':
                this.startTaskInteraction(interactable);
                break;
            case 'vent':
                this.startVentInteraction(interactable);
                break;
            case 'door':
                this.startDoorInteraction(interactable);
                break;
            case 'emergency':
                this.startEmergencyInteraction(interactable);
                break;
            case 'sabotage':
                this.startSabotageInteraction(interactable);
                break;
            case 'utility':
                this.startUtilityInteraction(interactable);
                break;
        }
        
        // Créer effet visuel
        if (this.animations) {
            this.animations.createEffect('task_complete', interactable.x, interactable.y);
        }
    }
    
    startTaskInteraction(interactable) {
        // Créer interface de tâche spécialisée selon le type
        this.createTaskUI(interactable);
    }
    
    createTaskUI(interactable) {
        const taskType = interactable.subtype;
        
        // Créer interface spécialisée selon le type de tâche
        switch (taskType) {
            case 'fix-wiring':
                this.createWiringTaskUI(interactable);
                break;
            case 'download-data':
                this.createDownloadTaskUI(interactable);
                break;
            case 'calibrate-distributor':
                this.createCalibrateTaskUI(interactable);
                break;
            case 'submit-scan':
                this.createScanTaskUI(interactable);
                break;
            default:
                this.createGenericTaskUI(interactable);
                break;
        }
    }
    
    createWiringTaskUI(interactable) {
        const wireColors = ['red', 'blue', 'yellow', 'pink'];
        const leftWires = [...wireColors].sort(() => Math.random() - 0.5);
        const rightWires = [...wireColors].sort(() => Math.random() - 0.5);
        const connections = new Map();
        
        const taskUI = this.createBaseTaskUI(interactable, 'Réparer le Câblage');
        
        taskUI.innerHTML += `
            <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                <div id="left-wires" style="display: flex; flex-direction: column; gap: 10px;">
                    ${leftWires.map((color, i) => `
                        <div class="wire-left" data-color="${color}" style="
                            width: 60px;
                            height: 20px;
                            background: ${color};
                            border-radius: 10px;
                            cursor: pointer;
                            border: 2px solid #2c3e50;
                        "></div>
                    `).join('')}
                </div>
                <div id="right-wires" style="display: flex; flex-direction: column; gap: 10px;">
                    ${rightWires.map((color, i) => `
                        <div class="wire-right" data-color="${color}" style="
                            width: 60px;
                            height: 20px;
                            background: ${color};
                            border-radius: 10px;
                            cursor: pointer;
                            border: 2px solid #2c3e50;
                        "></div>
                    `).join('')}
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <div>Connectez les câbles de même couleur</div>
                <div id="wire-progress">0/${wireColors.length} connectés</div>
            </div>
        `;
        
        this.setupWiringLogic(taskUI, wireColors.length, interactable);
    }
    
    setupWiringLogic(taskUI, totalWires, interactable) {
        let selectedWire = null;
        let completedConnections = 0;
        
        const leftWires = taskUI.querySelectorAll('.wire-left');
        const rightWires = taskUI.querySelectorAll('.wire-right');
        const progressDiv = taskUI.querySelector('#wire-progress');
        
        leftWires.forEach(wire => {
            wire.addEventListener('click', () => {
                if (selectedWire) {
                    selectedWire.style.border = '2px solid #2c3e50';
                }
                selectedWire = wire;
                wire.style.border = '3px solid #f1c40f';
            });
        });
        
        rightWires.forEach(wire => {
            wire.addEventListener('click', () => {
                if (!selectedWire) return;
                
                if (selectedWire.dataset.color === wire.dataset.color) {
                    // Connexion correcte
                    selectedWire.style.background = '#27ae60';
                    wire.style.background = '#27ae60';
                    selectedWire.style.pointerEvents = 'none';
                    wire.style.pointerEvents = 'none';
                    
                    completedConnections++;
                    progressDiv.textContent = `${completedConnections}/${totalWires} connectés`;
                    
                    if (completedConnections === totalWires) {
                        setTimeout(() => {
                            this.completeTaskInteraction(interactable);
                        }, 500);
                    }
                } else {
                    // Connexion incorrecte
                    selectedWire.style.border = '3px solid #e74c3c';
                    wire.style.border = '3px solid #e74c3c';
                    
                    setTimeout(() => {
                        selectedWire.style.border = '2px solid #2c3e50';
                        wire.style.border = '2px solid #2c3e50';
                    }, 500);
                }
                
                selectedWire = null;
            });
        });
    }
    
    createDownloadTaskUI(interactable) {
        const taskUI = this.createBaseTaskUI(interactable, 'Télécharger les Données');
        
        taskUI.innerHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 20px;">📥</div>
                <div style="background: #2c3e50; padding: 20px; border-radius: 10px;">
                    <div>Téléchargement en cours...</div>
                    <div style="background: #34495e; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden;">
                        <div id="download-progress" style="background: linear-gradient(90deg, #3498db, #2980b9); height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <div id="download-percentage">0%</div>
                </div>
            </div>
        `;
        
        this.simulateDownload(taskUI, interactable);
    }
    
    simulateDownload(taskUI, interactable) {
        const progressBar = taskUI.querySelector('#download-progress');
        const percentageDiv = taskUI.querySelector('#download-percentage');
        let progress = 0;
        
        const downloadInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            progress = Math.min(progress, 100);
            
            progressBar.style.width = progress + '%';
            percentageDiv.textContent = Math.floor(progress) + '%';
            
            if (progress >= 100) {
                clearInterval(downloadInterval);
                setTimeout(() => {
                    this.completeTaskInteraction(interactable);
                }, 500);
            }
        }, 200);
        
        // Sauvegarder l'interval pour pouvoir l'annuler
        this.activeDownloadInterval = downloadInterval;
    }
    
    createCalibrateTaskUI(interactable) {
        const taskUI = this.createBaseTaskUI(interactable, 'Calibrer le Distributeur');
        
        taskUI.innerHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 20px;">⚙️</div>
                <div style="position: relative; width: 200px; height: 200px; margin: 0 auto; background: #2c3e50; border-radius: 50%; border: 5px solid #34495e;">
                    <div id="calibrate-target" style="
                        position: absolute;
                        width: 40px;
                        height: 40px;
                        background: #27ae60;
                        border-radius: 50%;
                        top: 80px;
                        left: 80px;
                        opacity: 0.5;
                    "></div>
                    <div id="calibrate-pointer" style="
                        position: absolute;
                        width: 4px;
                        height: 80px;
                        background: #e74c3c;
                        top: 20px;
                        left: 98px;
                        transform-origin: bottom center;
                        animation: rotate 2s linear infinite;
                    "></div>
                </div>
                <div style="margin-top: 20px;">
                    <button id="calibrate-button" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 10px;
                        font-size: 18px;
                        cursor: pointer;
                    ">STOP</button>
                </div>
                <div id="calibrate-attempts">Tentatives restantes: 3</div>
            </div>
            <style>
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        this.setupCalibrateLogic(taskUI, interactable);
    }
    
    setupCalibrateLogic(taskUI, interactable) {
        const button = taskUI.querySelector('#calibrate-button');
        const pointer = taskUI.querySelector('#calibrate-pointer');
        const attemptsDiv = taskUI.querySelector('#calibrate-attempts');
        let attempts = 3;
        let isCalibrating = true;
        
        button.addEventListener('click', () => {
            if (!isCalibrating) return;
            
            // Calculer l'angle actuel du pointeur
            const computedStyle = window.getComputedStyle(pointer);
            const transform = computedStyle.transform;
            
            // Zone de succès approximative (angle entre 60° et 120°)
            const currentTime = Date.now() % 2000; // Cycle de 2 secondes
            const angle = (currentTime / 2000) * 360;
            
            if (angle >= 60 && angle <= 120) {
                // Succès !
                pointer.style.animation = 'none';
                pointer.style.background = '#27ae60';
                isCalibrating = false;
                
                setTimeout(() => {
                    this.completeTaskInteraction(interactable);
                }, 500);
            } else {
                // Échec
                attempts--;
                attemptsDiv.textContent = `Tentatives restantes: ${attempts}`;
                
                if (attempts <= 0) {
                    this.cancelActiveInteraction();
                }
            }
        });
    }
    
    createScanTaskUI(interactable) {
        const taskUI = this.createBaseTaskUI(interactable, 'Scanner Médical');
        
        taskUI.innerHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 20px;">🔬</div>
                <div style="background: #2c3e50; padding: 20px; border-radius: 10px;">
                    <div>Scanner en cours...</div>
                    <div style="margin: 20px 0;">
                        <div style="font-size: 48px; color: #27ae60;">👤</div>
                        <div id="scan-progress" style="margin: 10px 0;">Analyse: 0%</div>
                    </div>
                    <div style="font-size: 12px; color: #95a5a6;">
                        Restez immobile pendant le scan
                    </div>
                </div>
            </div>
        `;
        
        this.simulateMedicalScan(taskUI, interactable);
    }
    
    simulateMedicalScan(taskUI, interactable) {
        const progressDiv = taskUI.querySelector('#scan-progress');
        let progress = 0;
        
        const scanInterval = setInterval(() => {
            progress += 10;
            progressDiv.textContent = `Analyse: ${progress}%`;
            
            if (progress >= 100) {
                clearInterval(scanInterval);
                progressDiv.textContent = 'Scan terminé ✅';
                
                setTimeout(() => {
                    this.completeTaskInteraction(interactable);
                }, 1000);
            }
        }, 1000); // 10 secondes au total
        
        this.activeScanInterval = scanInterval;
    }
    
    createGenericTaskUI(interactable) {
        const taskUI = this.createBaseTaskUI(interactable, interactable.name);
        
        taskUI.innerHTML += `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 20px;">${interactable.icon}</div>
                <div style="background: #2c3e50; padding: 20px; border-radius: 10px;">
                    <div>Tâche en cours...</div>
                    <div style="background: #34495e; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden;">
                        <div id="generic-progress" style="background: linear-gradient(90deg, #27ae60, #2ecc71); height: 100%; width: 0%; transition: width 0.5s;"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Complétion automatique après 3 secondes
        setTimeout(() => {
            const progressBar = taskUI.querySelector('#generic-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    this.completeTaskInteraction(interactable);
                }, 500);
            }
        }, 3000);
    }
    
    createBaseTaskUI(interactable, title) {
        const taskUI = document.createElement('div');
        taskUI.id = 'active-task-ui';
        taskUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            min-height: 400px;
            background: linear-gradient(135deg, #2c3e50, #34495e);
            border: 3px solid #3498db;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 30px rgba(52, 152, 219, 0.5);
        `;
        
        taskUI.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #3498db;">${title}</h2>
                <div style="font-size: 14px; color: #bdc3c7; margin-top: 5px;">
                    Salle: ${this.getRoomDisplayName(interactable.room)}
                </div>
            </div>
        `;
        
        document.body.appendChild(taskUI);
        return taskUI;
    }
    
    completeTaskInteraction(interactable) {
        console.log(`✅ Task completed: ${interactable.name}`);
        
        // Marquer comme terminé
        interactable.completed = true;
        interactable.available = false;
        
        // Supprimer l'interface
        this.cancelActiveInteraction();
        
        // Effet visuel de succès
        if (this.animations) {
            this.animations.createEffect('task_complete', interactable.x, interactable.y);
        }
        
        // Mettre à jour le gameplay
        if (this.gameplay && this.gameplay.completeTask) {
            this.gameplay.completeTask(interactable.id);
        }
    }
    
    startVentInteraction(interactable) {
        console.log(`🌪️ Using vent: ${interactable.id}`);
        
        // Interface de sélection de vent de destination
        this.createVentSelectionUI(interactable);
    }
    
    createVentSelectionUI(interactable) {
        const ventUI = document.createElement('div');
        ventUI.id = 'vent-selection-ui';
        ventUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: linear-gradient(135deg, #34495e, #2c3e50);
            border: 3px solid #e67e22;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        let ventOptions = '';
        for (const connectedVentId of interactable.connected) {
            const connectedVent = this.interactables.get(connectedVentId);
            if (connectedVent) {
                ventOptions += `
                    <button onclick="window.ultraSafeGame.interactions.travelToVent('${connectedVentId}')" style="
                        display: block;
                        width: 100%;
                        margin: 10px 0;
                        padding: 15px;
                        background: #e67e22;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        cursor: pointer;
                    ">
                        ${this.getRoomDisplayName(connectedVent.room)}
                    </button>
                `;
            }
        }
        
        ventUI.innerHTML = `
            <div style="text-align: center;">
                <h2 style="margin: 0 0 20px 0; color: #e67e22;">🌪️ Conduits d'Aération</h2>
                <p>Choisissez votre destination:</p>
                ${ventOptions}
                <button onclick="window.ultraSafeGame.interactions.cancelActiveInteraction()" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Annuler</button>
            </div>
        `;
        
        document.body.appendChild(ventUI);
    }
    
    travelToVent(targetVentId) {
        const targetVent = this.interactables.get(targetVentId);
        if (!targetVent) return;
        
        const player = this.getLocalPlayer();
        if (!player) return;
        
        console.log(`🌪️ Traveling to vent in: ${targetVent.room}`);
        
        // Téléporter le joueur
        player.x = targetVent.x;
        player.y = targetVent.y;
        
        // Effet visuel
        if (this.animations) {
            this.animations.createEffect('vent_smoke', targetVent.x, targetVent.y);
        }
        
        this.cancelActiveInteraction();
    }
    
    startEmergencyInteraction(interactable) {
        console.log('🚨 Emergency button pressed!');
        
        if (this.gameplay && this.gameplay.handleEmergencyMeeting) {
            this.gameplay.handleEmergencyMeeting();
        }
        
        this.cancelActiveInteraction();
    }
    
    startSabotageInteraction(interactable) {
        console.log(`⚡ Sabotage activated: ${interactable.name}`);
        
        // Logique de sabotage selon le type
        switch (interactable.id) {
            case 'sabotage_lights':
                this.sabotageLight();
                break;
            case 'sabotage_o2':
                this.sabotageO2();
                break;
            case 'sabotage_comms':
                this.sabotageComms();
                break;
            case 'sabotage_reactor':
                this.sabotageReactor();
                break;
        }
        
        this.cancelActiveInteraction();
    }
    
    sabotageLight() {
        console.log('💡 Lights sabotaged!');
        
        // Effet visuel d'assombrissement
        const overlay = document.createElement('div');
        overlay.id = 'lights-sabotage';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 100;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // Supprimer après 30 secondes
        setTimeout(() => {
            overlay.remove();
            console.log('💡 Lights restored');
        }, 30000);
    }
    
    sabotageO2() {
        console.log('💨 O2 sabotaged!');
        
        // Créer interface d'urgence O2
        const o2UI = document.createElement('div');
        o2UI.id = 'o2-emergency';
        o2UI.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            border: 3px solid #c0392b;
        `;
        
        o2UI.innerHTML = `
            <div style="text-align: center;">
                <h3 style="margin: 0;">⚠️ SABOTAGE O2 ⚠️</h3>
                <div id="o2-timer">30</div>
                <div>secondes restantes</div>
            </div>
        `;
        
        document.body.appendChild(o2UI);
        
        // Compte à rebours
        let timeLeft = 30;
        const timerInterval = setInterval(() => {
            timeLeft--;
            const timerDiv = document.getElementById('o2-timer');
            if (timerDiv) {
                timerDiv.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                o2UI.remove();
                console.log('💨 O2 depleted - Game Over!');
                // Logique de fin de jeu
            }
        }, 1000);
    }
    
    startUtilityInteraction(interactable) {
        switch (interactable.id) {
            case 'security_cameras':
                this.openSecurityCameras();
                break;
            case 'admin_table':
                this.openAdminTable();
                break;
            case 'vitals':
                this.openVitals();
                break;
        }
    }
    
    openSecurityCameras() {
        console.log('📹 Opening security cameras...');
        
        const cameraUI = document.createElement('div');
        cameraUI.id = 'security-cameras-ui';
        cameraUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 400px;
            background: #000;
            border: 3px solid #2ecc71;
            border-radius: 10px;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        cameraUI.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: #2ecc71;">📹 CAMÉRAS DE SÉCURITÉ</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div style="background: #1a1a1a; border: 1px solid #2ecc71; padding: 10px;">
                        <div>Cafétéria</div>
                        <div style="height: 80px; background: #333; margin: 5px 0;"></div>
                    </div>
                    <div style="background: #1a1a1a; border: 1px solid #2ecc71; padding: 10px;">
                        <div>Électricité</div>
                        <div style="height: 80px; background: #333; margin: 5px 0;"></div>
                    </div>
                    <div style="background: #1a1a1a; border: 1px solid #2ecc71; padding: 10px;">
                        <div>Infirmerie</div>
                        <div style="height: 80px; background: #333; margin: 5px 0;"></div>
                    </div>
                    <div style="background: #1a1a1a; border: 1px solid #2ecc71; padding: 10px;">
                        <div>Sécurité</div>
                        <div style="height: 80px; background: #333; margin: 5px 0;"></div>
                    </div>
                </div>
                <button onclick="window.ultraSafeGame.interactions.cancelActiveInteraction()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(cameraUI);
    }
    
    cancelActiveInteraction() {
        this.activeInteraction = null;
        
        // Supprimer toutes les interfaces actives
        const interfaces = [
            'active-task-ui',
            'vent-selection-ui',
            'security-cameras-ui',
            'admin-table-ui',
            'vitals-ui'
        ];
        
        interfaces.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
        
        // Arrêter les intervalles actifs
        if (this.activeDownloadInterval) {
            clearInterval(this.activeDownloadInterval);
            this.activeDownloadInterval = null;
        }
        
        if (this.activeScanInterval) {
            clearInterval(this.activeScanInterval);
            this.activeScanInterval = null;
        }
    }
    
    updateHoverUI() {
        const interactionUI = document.getElementById('interaction-ui');
        
        if (this.hoverTarget) {
            const player = this.getLocalPlayer();
            if (player) {
                const distance = this.getDistance(player.x, player.y, this.hoverTarget.x, this.hoverTarget.y);
                
                if (distance < this.interactionRange) {
                    interactionUI.style.display = 'block';
                    interactionUI.innerHTML = `
                        <span style="margin-right: 10px;">${this.hoverTarget.icon}</span>
                        ${this.hoverTarget.name}
                        <span style="margin-left: 10px; font-size: 12px; opacity: 0.7;">[E]</span>
                    `;
                } else {
                    interactionUI.style.display = 'none';
                }
            }
        } else {
            interactionUI.style.display = 'none';
        }
    }
    
    render(ctx) {
        if (!ctx) return;
        
        // Dessiner les objets interactifs
        for (const [id, interactable] of this.interactables) {
            if (!interactable.available || interactable.completed) continue;
            
            this.drawInteractable(ctx, interactable);
        }
        
        // Dessiner les indicateurs de proximité
        this.drawProximityIndicators(ctx);
    }
    
    drawInteractable(ctx, interactable) {
        const player = this.getLocalPlayer();
        if (!player) return;
        
        const distance = this.getDistance(player.x, player.y, interactable.x, interactable.y);
        const inRange = distance < this.interactionRange;
        
        ctx.save();
        ctx.translate(interactable.x, interactable.y);
        
        // Effet de glow si proche
        if (inRange) {
            ctx.shadowColor = interactable.glowColor;
            ctx.shadowBlur = 10;
        }
        
        // Dessiner l'icône de base
        ctx.fillStyle = interactable.color;
        ctx.beginPath();
        ctx.arc(0, 0, 15 * (interactable.scale || 1), 0, Math.PI * 2);
        ctx.fill();
        
        // Dessiner l'icône
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(interactable.icon, 0, 0);
        
        // Indicateur de disponibilité
        if (inRange && this.canInteractWith(player, interactable)) {
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
            
            // Animation de pulsation
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawProximityIndicators(ctx) {
        const player = this.getLocalPlayer();
        if (!player) return;
        
        for (const [id, interactable] of this.interactables) {
            if (!interactable.available || interactable.completed) continue;
            if (!this.canInteractWith(player, interactable)) continue;
            
            const distance = this.getDistance(player.x, player.y, interactable.x, interactable.y);
            
            if (distance < this.interactionRange) {
                // Dessiner une ligne vers l'objet
                ctx.save();
                ctx.strokeStyle = `rgba(241, 196, 15, ${1 - distance / this.interactionRange})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(player.x, player.y);
                ctx.lineTo(interactable.x, interactable.y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    
    // Méthodes utilitaires
    getLocalPlayer() {
        if (!this.renderer || !this.renderer.players) return null;
        return Array.from(this.renderer.players.values()).find(p => p.isLocal);
    }
    
    getCurrentRoom(player) {
        if (!this.gameplay || !this.gameplay.map) return 'corridor';
        
        for (const [roomName, room] of Object.entries(this.gameplay.map.rooms)) {
            if (
                player.x >= room.x &&
                player.x <= room.x + room.width &&
                player.y >= room.y &&
                player.y <= room.y + room.height
            ) {
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
    
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    update(deltaTime) {
        // Mettre à jour l'interface hover
        this.updateHoverUI();
        
        // Mettre à jour les objets interactifs
        for (const [id, interactable] of this.interactables) {
            if (interactable.type === 'door' && this.gameplay) {
                const door = this.gameplay.doors.find(d => d.id === id);
                if (door) {
                    interactable.sabotaged = door.sabotaged;
                    interactable.color = door.sabotaged ? '#e74c3c' : '#95a5a6';
                }
            }
        }
    }
}

// Export global
window.AmongUsInteractions = AmongUsInteractions;

console.log('✅ Among Us Interaction System loaded');
