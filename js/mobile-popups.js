// Among Us V3 - Mobile Popup System
class MobilePopupSystem {
    constructor() {
        this.activePopups = new Map();
        this.popupStack = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.createPopupContainer();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('📱 Mobile popup system initialized');
    }
    
    createPopupContainer() {
        // Create main popup container if it doesn't exist
        if (!document.getElementById('mobile-popup-container')) {
            const container = document.createElement('div');
            container.id = 'mobile-popup-container';
            container.className = 'mobile-popup-container';
            document.body.appendChild(container);
        }
    }
    
    setupEventListeners() {
        // Handle back button on mobile
        window.addEventListener('popstate', (e) => {
            if (this.popupStack.length > 0) {
                e.preventDefault();
                this.closeTopPopup();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popupStack.length > 0) {
                this.closeTopPopup();
            }
        });
    }
    
    // Create a minimizable popup
    createMinimizablePopup(id, options = {}) {
        const popup = document.createElement('div');
        popup.className = 'mobile-popup minimizable';
        popup.id = `popup-${id}`;
        popup.innerHTML = `
            <div class="popup-header">
                <div class="popup-title">${options.title || 'Popup'}</div>
                <div class="popup-controls">
                    <button class="popup-minimize-btn" data-action="minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="popup-close-btn" data-action="close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="popup-content">
                ${options.content || ''}
            </div>
        `;
        
        // Add event listeners
        this.setupPopupEvents(popup, id);
        
        return popup;
    }
    
    // Create a floating action button popup
    createFloatingPopup(id, options = {}) {
        const popup = document.createElement('div');
        popup.className = 'mobile-popup floating';
        popup.id = `popup-${id}`;
        popup.innerHTML = `
            <div class="floating-trigger" data-action="toggle">
                <i class="${options.icon || 'fas fa-plus'}"></i>
                ${options.badge ? `<div class="floating-badge">${options.badge}</div>` : ''}
            </div>
            <div class="floating-menu">
                ${options.items ? options.items.map(item => `
                    <div class="floating-item" data-action="${item.action}">
                        <i class="${item.icon}"></i>
                        <span>${item.label}</span>
                    </div>
                `).join('') : ''}
            </div>
        `;
        
        this.setupPopupEvents(popup, id);
        return popup;
    }
    
    // Create a slide-up popup
    createSlideUpPopup(id, options = {}) {
        const popup = document.createElement('div');
        popup.className = 'mobile-popup slide-up';
        popup.id = `popup-${id}`;
        popup.innerHTML = `
            <div class="popup-overlay" data-action="close"></div>
            <div class="popup-panel">
                <div class="popup-handle"></div>
                <div class="popup-header">
                    <div class="popup-title">${options.title || 'Menu'}</div>
                </div>
                <div class="popup-content">
                    ${options.content || ''}
                </div>
            </div>
        `;
        
        this.setupPopupEvents(popup, id);
        return popup;
    }
    
    setupPopupEvents(popup, id) {
        // Handle popup controls
        popup.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (!action) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            switch (action) {
                case 'minimize':
                    this.minimizePopup(id);
                    break;
                case 'close':
                    this.closePopup(id);
                    break;
                case 'toggle':
                    this.togglePopup(id);
                    break;
                default:
                    // Emit custom action event
                    this.emitPopupAction(id, action, e);
            }
        });
        
        // Handle dragging for floating popups
        if (popup.classList.contains('floating')) {
            this.makeDraggable(popup);
        }
        
        // Handle swipe gestures for slide-up popups
        if (popup.classList.contains('slide-up')) {
            this.setupSwipeGestures(popup, id);
        }
    }
    
    makeDraggable(popup) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        const trigger = popup.querySelector('.floating-trigger');
        
        trigger.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = popup.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            popup.style.transition = 'none';
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            popup.style.left = (initialX + deltaX) + 'px';
            popup.style.top = (initialY + deltaY) + 'px';
        });
        
        document.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            popup.style.transition = '';
            
            // Snap to edges
            this.snapToEdge(popup);
        });
    }
    
    snapToEdge(popup) {
        const rect = popup.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let newX = rect.left;
        let newY = rect.top;
        
        // Snap to left or right edge
        if (rect.left < windowWidth / 2) {
            newX = 20;
        } else {
            newX = windowWidth - rect.width - 20;
        }
        
        // Keep within vertical bounds
        newY = Math.max(20, Math.min(newY, windowHeight - rect.height - 20));
        
        popup.style.left = newX + 'px';
        popup.style.top = newY + 'px';
    }
    
    setupSwipeGestures(popup, id) {
        const panel = popup.querySelector('.popup-panel');
        let startY, currentY, isDragging = false;
        
        panel.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            panel.style.transition = 'none';
        });
        
        panel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                panel.style.transform = `translateY(${deltaY}px)`;
            }
        });
        
        panel.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            panel.style.transition = '';
            
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
                this.closePopup(id);
            } else {
                panel.style.transform = '';
            }
        });
    }
    
    // Show popup
    showPopup(id, type = 'minimizable', options = {}) {
        if (this.activePopups.has(id)) {
            return this.activePopups.get(id);
        }
        
        let popup;
        
        switch (type) {
            case 'floating':
                popup = this.createFloatingPopup(id, options);
                break;
            case 'slide-up':
                popup = this.createSlideUpPopup(id, options);
                break;
            default:
                popup = this.createMinimizablePopup(id, options);
        }
        
        // Position popup
        if (options.position) {
            popup.style.left = options.position.x + 'px';
            popup.style.top = options.position.y + 'px';
        }
        
        // Add to container
        const container = document.getElementById('mobile-popup-container');
        container.appendChild(popup);
        
        // Store reference
        this.activePopups.set(id, {
            element: popup,
            type: type,
            options: options,
            isMinimized: false
        });
        
        // Add to stack
        this.popupStack.push(id);
        
        // Show with animation
        setTimeout(() => {
            popup.classList.add('active');
        }, 10);
        
        // Add to browser history for back button support
        if (type === 'slide-up') {
            history.pushState({ popup: id }, '', '');
        }
        
        this.emitPopupEvent('show', id);
        return popup;
    }
    
    // Close popup
    closePopup(id) {
        const popupData = this.activePopups.get(id);
        if (!popupData) return;
        
        const popup = popupData.element;
        popup.classList.remove('active');
        
        setTimeout(() => {
            popup.remove();
            this.activePopups.delete(id);
            
            // Remove from stack
            const index = this.popupStack.indexOf(id);
            if (index > -1) {
                this.popupStack.splice(index, 1);
            }
            
            this.emitPopupEvent('close', id);
        }, 300);
    }
    
    // Minimize popup
    minimizePopup(id) {
        const popupData = this.activePopups.get(id);
        if (!popupData) return;
        
        const popup = popupData.element;
        
        if (popupData.isMinimized) {
            popup.classList.remove('minimized');
            popupData.isMinimized = false;
            this.emitPopupEvent('restore', id);
        } else {
            popup.classList.add('minimized');
            popupData.isMinimized = true;
            this.emitPopupEvent('minimize', id);
        }
    }
    
    // Toggle popup
    togglePopup(id) {
        const popupData = this.activePopups.get(id);
        if (!popupData) return;
        
        const popup = popupData.element;
        
        if (popup.classList.contains('expanded')) {
            popup.classList.remove('expanded');
            this.emitPopupEvent('collapse', id);
        } else {
            popup.classList.add('expanded');
            this.emitPopupEvent('expand', id);
        }
    }
    
    // Close top popup
    closeTopPopup() {
        if (this.popupStack.length > 0) {
            const topId = this.popupStack[this.popupStack.length - 1];
            this.closePopup(topId);
        }
    }
    
    // Update popup content
    updatePopupContent(id, content) {
        const popupData = this.activePopups.get(id);
        if (!popupData) return;
        
        const contentElement = popupData.element.querySelector('.popup-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
    }
    
    // Update popup badge
    updatePopupBadge(id, badge) {
        const popupData = this.activePopups.get(id);
        if (!popupData) return;
        
        const badgeElement = popupData.element.querySelector('.floating-badge');
        if (badgeElement) {
            badgeElement.textContent = badge;
            badgeElement.style.display = badge ? 'flex' : 'none';
        }
    }
    
    // Event system
    emitPopupEvent(event, id, data = {}) {
        const customEvent = new CustomEvent(`popup:${event}`, {
            detail: { id, data }
        });
        document.dispatchEvent(customEvent);
    }
    
    emitPopupAction(id, action, originalEvent) {
        const customEvent = new CustomEvent('popup:action', {
            detail: { id, action, originalEvent }
        });
        document.dispatchEvent(customEvent);
    }
    
    // Utility methods
    isPopupActive(id) {
        return this.activePopups.has(id);
    }
    
    getActivePopups() {
        return Array.from(this.activePopups.keys());
    }
    
    closeAllPopups() {
        const ids = Array.from(this.activePopups.keys());
        ids.forEach(id => this.closePopup(id));
    }
    
    // Cleanup
    destroy() {
        this.closeAllPopups();
        const container = document.getElementById('mobile-popup-container');
        if (container) {
            container.remove();
        }
        console.log('📱 Mobile popup system destroyed');
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.MobilePopupSystem = MobilePopupSystem;
}