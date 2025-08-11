// Among Us Interface - Navigation Module
class Navigation {
    constructor(app) {
        this.app = app;
        this.history = ['main-menu'];
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        this.setupNavigationListeners();
        this.setupBreadcrumbs();
    }
    
    setupNavigationListeners() {
        // Back button functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.goBack();
            }
        });
        
        // Browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.screen) {
                this.app.showScreen(e.state.screen);
            }
        });
        
        // Tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }
    
    setupBreadcrumbs() {
        // Create breadcrumb navigation if needed
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (breadcrumbContainer) {
            this.updateBreadcrumbs();
        }
    }
    
    navigateTo(screenId, addToHistory = true) {
        if (addToHistory) {
            this.addToHistory(screenId);
        }
        
        this.app.showScreen(screenId);
        this.updateBrowserHistory(screenId);
        this.updateBreadcrumbs();
    }
    
    addToHistory(screenId) {
        // Remove any forward history if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Add new screen to history
        this.history.push(screenId);
        this.currentIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 10) {
            this.history.shift();
            this.currentIndex--;
        }
    }
    
    goBack() {
        if (this.canGoBack()) {
            this.currentIndex--;
            const previousScreen = this.history[this.currentIndex];
            this.app.showScreen(previousScreen);
            this.updateBrowserHistory(previousScreen);
            this.updateBreadcrumbs();
            return true;
        }
        return false;
    }
    
    goForward() {
        if (this.canGoForward()) {
            this.currentIndex++;
            const nextScreen = this.history[this.currentIndex];
            this.app.showScreen(nextScreen);
            this.updateBrowserHistory(nextScreen);
            this.updateBreadcrumbs();
            return true;
        }
        return false;
    }
    
    canGoBack() {
        return this.currentIndex > 0;
    }
    
    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }
    
    updateBrowserHistory(screenId) {
        const state = { screen: screenId };
        const title = this.getScreenTitle(screenId);
        const url = `#${screenId}`;
        
        history.pushState(state, title, url);
    }
    
    updateBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;
        
        const currentScreen = this.history[this.currentIndex];
        const breadcrumbs = this.generateBreadcrumbs(currentScreen);
        
        breadcrumbContainer.innerHTML = breadcrumbs.map(crumb => 
            `<span class="breadcrumb ${crumb.active ? 'active' : ''}" 
                   ${!crumb.active ? `onclick="navigation.navigateTo('${crumb.screen}')"` : ''}>
                ${crumb.title}
            </span>`
        ).join('<span class="breadcrumb-separator">›</span>');
    }
    
    generateBreadcrumbs(currentScreen) {
        const breadcrumbs = [
            { screen: 'main-menu', title: 'Menu Principal', active: false }
        ];
        
        if (currentScreen !== 'main-menu') {
            breadcrumbs.push({
                screen: currentScreen,
                title: this.getScreenTitle(currentScreen),
                active: true
            });
        } else {
            breadcrumbs[0].active = true;
        }
        
        return breadcrumbs;
    }
    
    getScreenTitle(screenId) {
        const titles = {
            'main-menu': 'Menu Principal',
            'matchmaking-screen': 'Matchmaking Rapide',
            'lobby-screen': 'Salon de jeu',
            'cosmetics-screen': 'Cosmétiques',
            'missions-screen': 'Missions',
            'ranked-screen': 'Mode Classé',
            'settings-screen': 'Paramètres',
            'account-screen': 'Compte',
            'help-screen': 'Aide',
            'game-hud': 'En jeu'
        };
        
        return titles[screenId] || 'Among Us';
    }
    
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        if (e.shiftKey) {
            // Shift+Tab - go backwards
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
                nextIndex = focusableElements.length - 1;
            }
        } else {
            // Tab - go forwards
            nextIndex = currentIndex + 1;
            if (nextIndex >= focusableElements.length) {
                nextIndex = 0;
            }
        }
        
        e.preventDefault();
        focusableElements[nextIndex].focus();
    }
    
    getFocusableElements() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return [];
        
        const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(activeScreen.querySelectorAll(selector))
            .filter(el => this.isVisible(el));
    }
    
    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd + key combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        this.navigateTo('main-menu');
                        break;
                    case 'p':
                        e.preventDefault();
                        this.navigateTo('matchmaking-screen');
                        break;
                    case 'l':
                        e.preventDefault();
                        this.app.createLobby();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.navigateTo('cosmetics-screen');
                        break;
                    case 'm':
                        e.preventDefault();
                        this.navigateTo('missions-screen');
                        break;
                    case 's':
                        e.preventDefault();
                        this.navigateTo('settings-screen');
                        break;
                }
            }
            
            // Function keys
            switch (e.key) {
                case 'F1':
                    e.preventDefault();
                    this.navigateTo('help-screen');
                    break;
                case 'F2':
                    e.preventDefault();
                    this.navigateTo('settings-screen');
                    break;
            }
        });
    }
    
    // Mobile navigation gestures
    setupMobileGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipeGesture(startX, startY, endX, endY);
        });
    }
    
    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 100;
        
        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - go back
                this.goBack();
            } else {
                // Swipe left - go forward
                this.goForward();
            }
        }
    }
    
    // Screen transition animations
    animateScreenTransition(fromScreen, toScreen, direction = 'forward') {
        const fromElement = document.getElementById(fromScreen);
        const toElement = document.getElementById(toScreen);
        
        if (!fromElement || !toElement) return;
        
        // Set initial states
        if (direction === 'forward') {
            toElement.style.transform = 'translateX(100%)';
        } else {
            toElement.style.transform = 'translateX(-100%)';
        }
        
        toElement.style.opacity = '0';
        toElement.classList.add('active');
        
        // Animate transition
        requestAnimationFrame(() => {
            fromElement.style.transform = direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)';
            fromElement.style.opacity = '0';
            
            toElement.style.transform = 'translateX(0)';
            toElement.style.opacity = '1';
        });
        
        // Clean up after animation
        setTimeout(() => {
            fromElement.classList.remove('active');
            fromElement.style.transform = '';
            fromElement.style.opacity = '';
            toElement.style.transform = '';
            toElement.style.opacity = '';
        }, 300);
    }
    
    // Deep linking support
    handleDeepLink() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.navigateTo(hash, false);
        }
    }
    
    // Navigation state management
    saveNavigationState() {
        const state = {
            history: this.history,
            currentIndex: this.currentIndex
        };
        
        sessionStorage.setItem('navigation-state', JSON.stringify(state));
    }
    
    loadNavigationState() {
        const saved = sessionStorage.getItem('navigation-state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.history = state.history || ['main-menu'];
                this.currentIndex = state.currentIndex || 0;
            } catch (e) {
                console.warn('Could not load navigation state:', e);
            }
        }
    }
    
    // Accessibility improvements
    announceScreenChange(screenId) {
        const title = this.getScreenTitle(screenId);
        const announcement = `Navigué vers ${title}`;
        
        // Create or update screen reader announcement
        let announcer = document.getElementById('screen-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'screen-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = announcement;
    }
    
    // Focus management
    manageFocus(screenId) {
        const screen = document.getElementById(screenId);
        if (!screen) return;
        
        // Find the first focusable element or the main heading
        const firstFocusable = screen.querySelector('h1, h2, button:not([disabled]), input:not([disabled])');
        if (firstFocusable) {
            // Small delay to ensure screen transition is complete
            setTimeout(() => {
                firstFocusable.focus();
            }, 100);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}