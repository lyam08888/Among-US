// Among Us V2 - Components Manager
class AmongUsV2Components {
    constructor() {
        this.components = new Map();
        this.eventListeners = new Map();
    }
    
    // Toast Component
    createToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-v2 ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="toast-close-v2">&times;</button>
        `;
        
        // Add event listener for close button
        const closeBtn = toast.querySelector('.toast-close-v2');
        closeBtn.addEventListener('click', () => this.removeToast(toast));
        
        return { toast, duration };
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    // Modal Component
    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const defaultOptions = {
            closable: true,
            size: 'medium',
            backdrop: true
        };
        
        const config = { ...defaultOptions, ...options };
        
        modal.innerHTML = `
            <div class="modal-content-v2 ${config.size}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    ${config.closable ? '<button class="modal-close">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;
        
        // Add event listeners
        if (config.closable) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        if (config.backdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        }
        
        return modal;
    }
    
    showModal(modal) {
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    // Loading Component
    createLoadingSpinner(size = 'medium') {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${size}`;
        
        spinner.innerHTML = `
            <div class="spinner-crewmate">
                <div class="crewmate-body"></div>
                <div class="crewmate-visor"></div>
            </div>
        `;
        
        return spinner;
    }
    
    // Progress Bar Component
    createProgressBar(value = 0, max = 100, options = {}) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-v2';
        
        const defaultOptions = {
            showLabel: true,
            animated: true,
            color: 'primary'
        };
        
        const config = { ...defaultOptions, ...options };
        
        progressBar.innerHTML = `
            <div class="progress-track">
                <div class="progress-fill ${config.color} ${config.animated ? 'animated' : ''}" 
                     style="width: ${(value / max) * 100}%"></div>
            </div>
            ${config.showLabel ? `<div class="progress-label">${Math.round((value / max) * 100)}%</div>` : ''}
        `;
        
        return progressBar;
    }
    
    updateProgressBar(progressBar, value, max = 100) {
        const fill = progressBar.querySelector('.progress-fill');
        const label = progressBar.querySelector('.progress-label');
        
        const percentage = Math.round((value / max) * 100);
        
        if (fill) {
            fill.style.width = percentage + '%';
        }
        
        if (label) {
            label.textContent = percentage + '%';
        }
    }
    
    // Card Component
    createCard(title, content, options = {}) {
        const card = document.createElement('div');
        card.className = `card-v2 ${options.variant || 'default'}`;
        
        card.innerHTML = `
            ${options.image ? `<div class="card-image"><img src="${options.image}" alt="${title}"></div>` : ''}
            <div class="card-content">
                ${title ? `<h3 class="card-title">${title}</h3>` : ''}
                <div class="card-body">${content}</div>
                ${options.actions ? `<div class="card-actions">${options.actions}</div>` : ''}
            </div>
        `;
        
        return card;
    }
    
    // Button Component
    createButton(text, options = {}) {
        const button = document.createElement('button');
        
        const defaultOptions = {
            variant: 'primary',
            size: 'medium',
            disabled: false,
            icon: null,
            loading: false
        };
        
        const config = { ...defaultOptions, ...options };
        
        button.className = `btn-v2 ${config.variant} ${config.size}`;
        button.disabled = config.disabled || config.loading;
        
        let content = '';
        if (config.loading) {
            content = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        } else {
            if (config.icon) {
                content = `<i class="fas ${config.icon}"></i> `;
            }
            content += text;
        }
        
        button.innerHTML = content;
        
        return button;
    }
    
    // Input Component
    createInput(options = {}) {
        const container = document.createElement('div');
        container.className = 'input-group-v2';
        
        const defaultOptions = {
            type: 'text',
            placeholder: '',
            label: '',
            required: false,
            disabled: false,
            icon: null
        };
        
        const config = { ...defaultOptions, ...options };
        
        container.innerHTML = `
            ${config.label ? `<label class="input-label">${config.label}${config.required ? ' *' : ''}</label>` : ''}
            <div class="input-wrapper">
                ${config.icon ? `<i class="fas ${config.icon} input-icon"></i>` : ''}
                <input type="${config.type}" 
                       placeholder="${config.placeholder}"
                       class="input-field"
                       ${config.required ? 'required' : ''}
                       ${config.disabled ? 'disabled' : ''}>
            </div>
        `;
        
        return container;
    }
    
    // Dropdown Component
    createDropdown(options, selected = null, config = {}) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-v2';
        
        const defaultConfig = {
            placeholder: 'Sélectionner...',
            searchable: false,
            multiple: false
        };
        
        const settings = { ...defaultConfig, ...config };
        
        dropdown.innerHTML = `
            <div class="dropdown-trigger">
                <span class="dropdown-text">${selected ? selected.text : settings.placeholder}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-menu">
                ${settings.searchable ? '<input type="text" class="dropdown-search" placeholder="Rechercher...">' : ''}
                <div class="dropdown-options">
                    ${options.map(option => `
                        <div class="dropdown-option" data-value="${option.value}">
                            ${option.icon ? `<i class="fas ${option.icon}"></i>` : ''}
                            <span>${option.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupDropdownEvents(dropdown, settings);
        
        return dropdown;
    }
    
    setupDropdownEvents(dropdown, settings) {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const text = dropdown.querySelector('.dropdown-text');
        
        trigger.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const optionText = option.querySelector('span').textContent;
                
                text.textContent = optionText;
                dropdown.classList.remove('active');
                
                // Dispatch custom event
                dropdown.dispatchEvent(new CustomEvent('change', {
                    detail: { value, text: optionText }
                }));
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    // Slider Component
    createSlider(min, max, value, options = {}) {
        const container = document.createElement('div');
        container.className = 'slider-container-v2';
        
        const defaultOptions = {
            step: 1,
            label: '',
            showValue: true,
            unit: ''
        };
        
        const config = { ...defaultOptions, ...options };
        
        container.innerHTML = `
            ${config.label ? `<label class="slider-label">${config.label}</label>` : ''}
            <div class="slider-wrapper">
                <input type="range" 
                       class="slider-input"
                       min="${min}" 
                       max="${max}" 
                       value="${value}"
                       step="${config.step}">
                ${config.showValue ? `<div class="slider-value">${value}${config.unit}</div>` : ''}
            </div>
        `;
        
        // Add event listener
        const slider = container.querySelector('.slider-input');
        const valueDisplay = container.querySelector('.slider-value');
        
        if (valueDisplay) {
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value + config.unit;
            });
        }
        
        return container;
    }
    
    // Toggle Switch Component
    createToggle(label, checked = false, options = {}) {
        const container = document.createElement('div');
        container.className = 'toggle-container-v2';
        
        const id = 'toggle-' + Math.random().toString(36).substr(2, 9);
        
        container.innerHTML = `
            <div class="toggle-wrapper">
                <input type="checkbox" id="${id}" class="toggle-input" ${checked ? 'checked' : ''}>
                <label for="${id}" class="toggle-switch">
                    <span class="toggle-slider"></span>
                </label>
                ${label ? `<label for="${id}" class="toggle-label">${label}</label>` : ''}
            </div>
        `;
        
        return container;
    }
    
    // Tabs Component
    createTabs(tabs, activeTab = 0) {
        const container = document.createElement('div');
        container.className = 'tabs-container-v2';
        
        container.innerHTML = `
            <div class="tabs-nav">
                ${tabs.map((tab, index) => `
                    <button class="tab-button ${index === activeTab ? 'active' : ''}" 
                            data-tab="${index}">
                        ${tab.icon ? `<i class="fas ${tab.icon}"></i>` : ''}
                        <span>${tab.title}</span>
                    </button>
                `).join('')}
            </div>
            <div class="tabs-content">
                ${tabs.map((tab, index) => `
                    <div class="tab-panel ${index === activeTab ? 'active' : ''}" 
                         data-panel="${index}">
                        ${tab.content}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners
        this.setupTabEvents(container);
        
        return container;
    }
    
    setupTabEvents(container) {
        const buttons = container.querySelectorAll('.tab-button');
        const panels = container.querySelectorAll('.tab-panel');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const tabIndex = button.dataset.tab;
                
                // Remove active class from all buttons and panels
                buttons.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const panel = container.querySelector(`[data-panel="${tabIndex}"]`);
                if (panel) {
                    panel.classList.add('active');
                }
                
                // Dispatch custom event
                container.dispatchEvent(new CustomEvent('tabchange', {
                    detail: { tabIndex: parseInt(tabIndex) }
                }));
            });
        });
    }
    
    // Notification Component
    createNotification(title, message, type = 'info', options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification-v2 ${type}`;
        
        const defaultOptions = {
            closable: true,
            autoClose: true,
            duration: 5000,
            position: 'top-right'
        };
        
        const config = { ...defaultOptions, ...options };
        
        const icon = this.getToastIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <h4 class="notification-title">${title}</h4>
                <p class="notification-message">${message}</p>
            </div>
            ${config.closable ? '<button class="notification-close">&times;</button>' : ''}
        `;
        
        // Add to container
        let container = document.querySelector(`.notification-container-${config.position}`);
        if (!container) {
            container = document.createElement('div');
            container.className = `notification-container-${config.position}`;
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Add event listeners
        if (config.closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.removeNotification(notification));
        }
        
        // Auto close
        if (config.autoClose) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, config.duration);
        }
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        return notification;
    }
    
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Utility method to register component
    registerComponent(name, component) {
        this.components.set(name, component);
    }
    
    // Utility method to get component
    getComponent(name) {
        return this.components.get(name);
    }
    
    // Cleanup method
    cleanup() {
        // Remove all event listeners
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        this.eventListeners.clear();
        this.components.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmongUsV2Components;
}