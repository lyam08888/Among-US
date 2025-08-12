// Among Us V3 - Mobile Controls System
class MobileControls {
    constructor(engine) {
        this.engine = engine;
        this.isActive = false;
        this.joystick = null;
        this.actionButtons = new Map();
        
        // Touch tracking
        this.touches = new Map();
        this.joystickTouch = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 50;
        this.deadZone = 0.2;
        
        // Movement state
        this.movement = {
            x: 0,
            y: 0,
            isMoving: false
        };
        
        // UI state
        this.uiState = {
            taskListOpen: false,
            chatOpen: false,
            menuOpen: false
        };
        
        this.init();
    }
    
    init() {
        // Detect if device supports touch
        this.detectTouchDevice();
        
        if (this.isActive) {
            this.createMobileUI();
            this.setupEventListeners();
            console.log('📱 Mobile controls initialized');
        }
    }
    
    detectTouchDevice() {
        // Check for touch support
        this.isActive = (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0 ||
            window.matchMedia('(hover: none) and (pointer: coarse)').matches
        );
        
        // Also check screen size
        if (window.innerWidth <= 768) {
            this.isActive = true;
        }
    }
    
    createMobileUI() {
        // Create mobile controls container
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <!-- Movement Joystick -->
            <div class="movement-joystick" id="movement-joystick">
                <div class="joystick-base">
                    <div class="joystick-knob" id="joystick-knob"></div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="mobile-action-btn primary" id="use-btn" data-action="use">
                    <i class="fas fa-hand-paper"></i>
                </button>
                <button class="mobile-action-btn secondary" id="report-btn" data-action="report">
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
                <button class="mobile-action-btn danger" id="kill-btn" data-action="kill" style="display: none;">
                    <i class="fas fa-skull"></i>
                </button>
                <button class="mobile-action-btn" id="sabotage-btn" data-action="sabotage" style="display: none;">
                    <i class="fas fa-wrench"></i>
                </button>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions">
                <button class="quick-action-btn" data-action="emergency">
                    <i class="fas fa-bell"></i> Urgence
                </button>
                <button class="quick-action-btn" data-action="map">
                    <i class="fas fa-map"></i> Carte
                </button>
            </div>
            
            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" id="mobile-menu-toggle" data-action="toggle-menu">
                <i class="fas fa-bars"></i>
            </button>
            
            <!-- Mobile Chat Toggle -->
            <button class="mobile-chat-toggle" id="mobile-chat-toggle" data-action="toggle-chat">
                <i class="fas fa-comments"></i>
                <div class="notification-badge" id="chat-badge" style="display: none;">0</div>
            </button>
            
            <!-- Mobile Task Toggle -->
            <button class="mobile-task-toggle" id="mobile-task-toggle" data-action="toggle-tasks">
                <i class="fas fa-list"></i>
            </button>
        `;
        
        // Add to game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(mobileControls);
        }
        
        // Store references
        this.joystick = document.getElementById('movement-joystick');
        this.joystickKnob = document.getElementById('joystick-knob');
        
        // Store action buttons
        this.actionButtons.set('use', document.getElementById('use-btn'));
        this.actionButtons.set('report', document.getElementById('report-btn'));
        this.actionButtons.set('kill', document.getElementById('kill-btn'));
        this.actionButtons.set('sabotage', document.getElementById('sabotage-btn'));
    }
    
    setupEventListeners() {
        // Joystick events
        this.setupJoystickEvents();
        
        // Action button events
        this.setupActionButtonEvents();
        
        // UI toggle events
        this.setupUIToggleEvents();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.updateJoystickPosition();
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateJoystickPosition();
            }, 100);
        });
    }
    
    setupJoystickEvents() {
        if (!this.joystick) return;
        
        // Touch start
        this.joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.joystickTouch = touch.identifier;
            
            const rect = this.joystick.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            
            this.joystickKnob.classList.add('active');
            this.updateJoystickPosition(touch.clientX, touch.clientY);
        });
        
        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (this.joystickTouch === null) return;
            
            const touch = Array.from(e.touches).find(t => t.identifier === this.joystickTouch);
            if (touch) {
                e.preventDefault();
                this.updateJoystickPosition(touch.clientX, touch.clientY);
            }
        });
        
        // Touch end
        document.addEventListener('touchend', (e) => {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === this.joystickTouch);
            if (touch) {
                this.joystickTouch = null;
                this.joystickKnob.classList.remove('active');
                this.resetJoystick();
            }
        });
        
        // Mouse events for testing on desktop
        this.joystick.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.joystick.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            
            this.joystickKnob.classList.add('active');
            this.updateJoystickPosition(e.clientX, e.clientY);
            
            const handleMouseMove = (e) => {
                this.updateJoystickPosition(e.clientX, e.clientY);
            };
            
            const handleMouseUp = () => {
                this.joystickKnob.classList.remove('active');
                this.resetJoystick();
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }
    
    updateJoystickPosition(clientX, clientY) {
        if (!this.joystickCenter.x || !this.joystickCenter.y) return;
        
        const deltaX = clientX - this.joystickCenter.x;
        const deltaY = clientY - this.joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limit to joystick radius
        const limitedDistance = Math.min(distance, this.joystickRadius);
        const angle = Math.atan2(deltaY, deltaX);
        
        const knobX = Math.cos(angle) * limitedDistance;
        const knobY = Math.sin(angle) * limitedDistance;
        
        // Update knob position
        this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
        
        // Calculate movement values (-1 to 1)
        const normalizedDistance = limitedDistance / this.joystickRadius;
        
        if (normalizedDistance > this.deadZone) {
            this.movement.x = (knobX / this.joystickRadius);
            this.movement.y = (knobY / this.joystickRadius);
            this.movement.isMoving = true;
        } else {
            this.movement.x = 0;
            this.movement.y = 0;
            this.movement.isMoving = false;
        }
        
        // Send movement to engine
        this.sendMovementToEngine();
    }
    
    resetJoystick() {
        this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        this.movement.x = 0;
        this.movement.y = 0;
        this.movement.isMoving = false;
        this.sendMovementToEngine();
    }
    
    sendMovementToEngine() {
        if (this.engine && this.engine.emit) {
            this.engine.emit('mobileMovement', {
                x: this.movement.x,
                y: this.movement.y,
                isMoving: this.movement.isMoving
            });
        }
    }
    
    setupActionButtonEvents() {
        // Use button
        const useBtn = this.actionButtons.get('use');
        if (useBtn) {
            useBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerAction('use');
            });
            useBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerAction('use');
            });
        }
        
        // Report button
        const reportBtn = this.actionButtons.get('report');
        if (reportBtn) {
            reportBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerAction('report');
            });
            reportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerAction('report');
            });
        }
        
        // Kill button (for impostors)
        const killBtn = this.actionButtons.get('kill');
        if (killBtn) {
            killBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerAction('kill');
            });
            killBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerAction('kill');
            });
        }
        
        // Sabotage button (for impostors)
        const sabotageBtn = this.actionButtons.get('sabotage');
        if (sabotageBtn) {
            sabotageBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerAction('sabotage');
            });
            sabotageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerAction('sabotage');
            });
        }
    }
    
    setupUIToggleEvents() {
        // Menu toggle
        const menuToggle = document.getElementById('mobile-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }
        
        // Chat toggle
        const chatToggle = document.getElementById('mobile-chat-toggle');
        if (chatToggle) {
            chatToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleChat();
            });
        }
        
        // Task toggle
        const taskToggle = document.getElementById('mobile-task-toggle');
        if (taskToggle) {
            taskToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTasks();
            });
        }
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.triggerAction(action);
            });
        });
    }
    
    triggerAction(action) {
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Send action to engine
        if (this.engine && this.engine.emit) {
            this.engine.emit('mobileAction', { action });
        }
        
        console.log(`📱 Mobile action triggered: ${action}`);
    }
    
    toggleMenu() {
        this.uiState.menuOpen = !this.uiState.menuOpen;
        
        // Toggle settings modal or game menu
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            if (this.uiState.menuOpen) {
                settingsModal.classList.add('active');
            } else {
                settingsModal.classList.remove('active');
            }
        }
        
        this.triggerAction('toggle-menu');
    }
    
    toggleChat() {
        this.uiState.chatOpen = !this.uiState.chatOpen;
        
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            if (this.uiState.chatOpen) {
                chatContainer.classList.remove('collapsed');
            } else {
                chatContainer.classList.add('collapsed');
            }
        }
        
        // Clear chat badge
        const chatBadge = document.getElementById('chat-badge');
        if (chatBadge) {
            chatBadge.style.display = 'none';
            chatBadge.textContent = '0';
        }
        
        this.triggerAction('toggle-chat');
    }
    
    toggleTasks() {
        this.uiState.taskListOpen = !this.uiState.taskListOpen;
        
        const taskList = document.getElementById('task-list');
        if (taskList) {
            if (this.uiState.taskListOpen) {
                taskList.classList.add('open');
            } else {
                taskList.classList.remove('open');
            }
        }
        
        this.triggerAction('toggle-tasks');
    }
    
    // Update UI based on game state
    updateForGameState(gameState) {
        if (!this.isActive) return;
        
        // Show/hide impostor buttons
        const killBtn = this.actionButtons.get('kill');
        const sabotageBtn = this.actionButtons.get('sabotage');
        
        if (gameState.isImpostor) {
            if (killBtn) killBtn.style.display = 'flex';
            if (sabotageBtn) sabotageBtn.style.display = 'flex';
        } else {
            if (killBtn) killBtn.style.display = 'none';
            if (sabotageBtn) sabotageBtn.style.display = 'none';
        }
        
        // Update use button based on nearby interactables
        const useBtn = this.actionButtons.get('use');
        if (useBtn) {
            if (gameState.nearbyInteractable) {
                useBtn.style.display = 'flex';
                useBtn.classList.add('pulse');
            } else {
                useBtn.classList.remove('pulse');
            }
        }
    }
    
    // Show chat notification
    showChatNotification(count) {
        if (!this.isActive) return;
        
        const chatBadge = document.getElementById('chat-badge');
        if (chatBadge && count > 0) {
            chatBadge.style.display = 'flex';
            chatBadge.textContent = count.toString();
        }
    }
    
    // Enable/disable controls
    setEnabled(enabled) {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.style.pointerEvents = enabled ? 'auto' : 'none';
            mobileControls.style.opacity = enabled ? '1' : '0.5';
        }
    }
    
    // Cleanup
    destroy() {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.remove();
        }
        
        this.touches.clear();
        this.actionButtons.clear();
        this.joystickTouch = null;
        
        console.log('📱 Mobile controls destroyed');
    }
}

// Auto-initialize mobile controls when engine is ready
if (typeof window !== 'undefined') {
    window.MobileControls = MobileControls;
}