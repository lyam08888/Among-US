// Among Us Interface - Cosmetics Module
class Cosmetics {
    constructor(app) {
        this.app = app;
        this.activeTab = 'colors';
        this.activeFilter = 'all';
        this.cosmeticData = this.generateCosmeticData();
        
        this.init();
    }
    
    init() {
        this.setupTabNavigation();
        this.setupFilterButtons();
        this.setupCosmeticGrid();
    }
    
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.cosmetics-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }
    
    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.cosmetics-filters .filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
    }
    
    setupCosmeticGrid() {
        const grid = document.getElementById('cosmetics-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const cosmeticItem = e.target.closest('.cosmetic-item');
                if (cosmeticItem) {
                    const cosmeticId = cosmeticItem.dataset.cosmeticId;
                    this.handleCosmeticClick(cosmeticId);
                }
            });
        }
    }
    
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.cosmetics-tabs .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        this.activeTab = tabId;
        this.updateDisplay();
    }
    
    setFilter(filter) {
        // Update active filter
        document.querySelectorAll('.cosmetics-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.activeFilter = filter;
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.renderCosmeticGrid();
        this.updateCurrencyDisplay();
    }
    
    renderCosmeticGrid() {
        const grid = document.getElementById('cosmetics-grid');
        if (!grid) return;
        
        const items = this.getFilteredItems();
        
        grid.innerHTML = items.map(item => this.createCosmeticItem(item)).join('');
        
        // Add loading animation
        grid.classList.add('loading');
        setTimeout(() => {
            grid.classList.remove('loading');
        }, 300);
    }
    
    getFilteredItems() {
        let items = this.cosmeticData[this.activeTab] || [];
        
        // Apply filter
        switch (this.activeFilter) {
            case 'owned':
                items = items.filter(item => this.isOwned(item.id));
                break;
            case 'not-owned':
                items = items.filter(item => !this.isOwned(item.id));
                break;
            case 'sale':
                items = items.filter(item => item.onSale);
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }
        
        return items;
    }
    
    createCosmeticItem(item) {
        const isOwned = this.isOwned(item.id);
        const isEquipped = this.isEquipped(item.id);
        const canAfford = this.canAfford(item.price);
        
        return `
            <div class="cosmetic-item ${isEquipped ? 'equipped' : ''} ${!isOwned && !canAfford ? 'locked' : ''}" 
                 data-cosmetic-id="${item.id}">
                <div class="cosmetic-preview" style="background-color: ${item.color || '#666'}">
                    ${item.emoji || item.name.charAt(0)}
                </div>
                <div class="cosmetic-name">${item.name}</div>
                ${item.rarity ? `<div class="rarity-chip ${item.rarity}">${item.rarity}</div>` : ''}
                ${item.onSale ? '<div class="sale-badge">PROMO</div>' : ''}
                <div class="cosmetic-price ${item.price === 0 ? 'free' : ''}">
                    ${item.price === 0 ? 'Gratuit' : `${item.price} 🪙`}
                </div>
                <div class="cosmetic-actions">
                    ${this.getCosmeticActionButton(item, isOwned, isEquipped, canAfford)}
                </div>
            </div>
        `;
    }
    
    getCosmeticActionButton(item, isOwned, isEquipped, canAfford) {
        if (isEquipped) {
            return '<button class="cosmetic-btn equipped" disabled>Équipé</button>';
        } else if (isOwned) {
            return '<button class="cosmetic-btn equip" onclick="cosmetics.equipItem(\'' + item.id + '\')">Équiper</button>';
        } else if (canAfford) {
            return '<button class="cosmetic-btn buy" onclick="cosmetics.buyItem(\'' + item.id + '\')">Acheter</button>';
        } else {
            return '<button class="cosmetic-btn locked" disabled>Insuffisant</button>';
        }
    }
    
    handleCosmeticClick(cosmeticId) {
        const item = this.findCosmeticById(cosmeticId);
        if (!item) return;
        
        if (this.isOwned(cosmeticId)) {
            if (this.isEquipped(cosmeticId)) {
                this.unequipItem(cosmeticId);
            } else {
                this.equipItem(cosmeticId);
            }
        } else {
            this.showPurchaseDialog(item);
        }
    }
    
    equipItem(cosmeticId) {
        const item = this.findCosmeticById(cosmeticId);
        if (!item || !this.isOwned(cosmeticId)) return;
        
        // Unequip current item of same type
        const currentEquipped = this.app.gameState.cosmetics.equipped[this.activeTab];
        if (currentEquipped && currentEquipped !== 'none') {
            // Unequip animation could go here
        }
        
        // Equip new item
        this.app.gameState.cosmetics.equipped[this.activeTab] = cosmeticId;
        
        this.updateDisplay();
        this.app.showToast(`${item.name} équipé!`, 'success');
        
        // Save to localStorage
        this.app.saveData();
    }
    
    unequipItem(cosmeticId) {
        const item = this.findCosmeticById(cosmeticId);
        if (!item) return;
        
        this.app.gameState.cosmetics.equipped[this.activeTab] = 'none';
        
        this.updateDisplay();
        this.app.showToast(`${item.name} déséquipé`, 'info');
        
        // Save to localStorage
        this.app.saveData();
    }
    
    buyItem(cosmeticId) {
        const item = this.findCosmeticById(cosmeticId);
        if (!item) return;
        
        if (!this.canAfford(item.price)) {
            this.app.showToast('Pas assez de pièces!', 'error');
            return;
        }
        
        // Deduct currency
        this.app.gameState.cosmetics.currency -= item.price;
        
        // Add to owned items
        if (!this.app.gameState.cosmetics.owned.includes(cosmeticId)) {
            this.app.gameState.cosmetics.owned.push(cosmeticId);
        }
        
        this.updateDisplay();
        this.app.showToast(`${item.name} acheté!`, 'success');
        
        // Auto-equip if nothing is equipped
        if (this.app.gameState.cosmetics.equipped[this.activeTab] === 'none') {
            setTimeout(() => {
                this.equipItem(cosmeticId);
            }, 500);
        }
        
        // Save to localStorage
        this.app.saveData();
    }
    
    showPurchaseDialog(item) {
        const canAfford = this.canAfford(item.price);
        
        const content = `
            <div class="purchase-dialog">
                <div class="item-preview">
                    <div class="cosmetic-preview large" style="background-color: ${item.color || '#666'}">
                        ${item.emoji || item.name.charAt(0)}
                    </div>
                    <h4>${item.name}</h4>
                    ${item.rarity ? `<div class="rarity-chip ${item.rarity}">${item.rarity}</div>` : ''}
                </div>
                <div class="item-details">
                    <p>${item.description || 'Un cosmétique unique pour personnaliser votre personnage.'}</p>
                    <div class="price-info">
                        <span class="price ${item.price === 0 ? 'free' : ''}">
                            ${item.price === 0 ? 'Gratuit' : `${item.price} 🪙`}
                        </span>
                        <span class="currency-balance">
                            Solde: ${this.app.gameState.cosmetics.currency} 🪙
                        </span>
                    </div>
                </div>
                <div class="purchase-actions">
                    ${canAfford ? 
                        `<button class="btn-large primary" onclick="cosmetics.confirmPurchase('${item.id}')">Acheter</button>` :
                        `<button class="btn-large" disabled>Pas assez de pièces</button>`
                    }
                    <button class="btn-large" onclick="app.closeModal()">Annuler</button>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Acheter un cosmétique');
    }
    
    confirmPurchase(cosmeticId) {
        this.buyItem(cosmeticId);
        this.app.closeModal();
    }
    
    isOwned(cosmeticId) {
        return this.app.gameState.cosmetics.owned.includes(cosmeticId);
    }
    
    isEquipped(cosmeticId) {
        return this.app.gameState.cosmetics.equipped[this.activeTab] === cosmeticId;
    }
    
    canAfford(price) {
        return this.app.gameState.cosmetics.currency >= price;
    }
    
    findCosmeticById(cosmeticId) {
        for (const category of Object.values(this.cosmeticData)) {
            const item = category.find(item => item.id === cosmeticId);
            if (item) return item;
        }
        return null;
    }
    
    updateCurrencyDisplay() {
        const currencyElements = document.querySelectorAll('.currency-display');
        currencyElements.forEach(element => {
            element.textContent = `${this.app.gameState.cosmetics.currency} 🪙`;
        });
    }
    
    generateCosmeticData() {
        return {
            colors: [
                { id: 'red', name: 'Rouge', color: '#ff6b6b', price: 0, rarity: 'common' },
                { id: 'blue', name: 'Bleu', color: '#4ecdc4', price: 0, rarity: 'common' },
                { id: 'green', name: 'Vert', color: '#96ceb4', price: 0, rarity: 'common' },
                { id: 'pink', name: 'Rose', color: '#ff9ff3', price: 0, rarity: 'common' },
                { id: 'orange', name: 'Orange', color: '#feca57', price: 0, rarity: 'common' },
                { id: 'yellow', name: 'Jaune', color: '#f9ca24', price: 0, rarity: 'common' },
                { id: 'black', name: 'Noir', color: '#2c2c54', price: 0, rarity: 'common' },
                { id: 'white', name: 'Blanc', color: '#f0f0f0', price: 0, rarity: 'common' },
                { id: 'purple', name: 'Violet', color: '#a55eea', price: 0, rarity: 'common' },
                { id: 'brown', name: 'Marron', color: '#8b4513', price: 0, rarity: 'common' },
                { id: 'cyan', name: 'Cyan', color: '#00d2d3', price: 0, rarity: 'common' },
                { id: 'lime', name: 'Lime', color: '#7bed9f', price: 0, rarity: 'common' }
            ],
            hats: [
                { id: 'none', name: 'Aucun', emoji: '🚫', price: 0, rarity: 'common' },
                { id: 'cap', name: 'Casquette', emoji: '🧢', price: 50, rarity: 'common' },
                { id: 'beanie', name: 'Bonnet', emoji: '🎩', price: 75, rarity: 'common' },
                { id: 'crown', name: 'Couronne', emoji: '👑', price: 200, rarity: 'rare' },
                { id: 'chef', name: 'Toque de chef', emoji: '👨‍🍳', price: 150, rarity: 'rare' },
                { id: 'pirate', name: 'Chapeau de pirate', emoji: '🏴‍☠️', price: 300, rarity: 'epic' },
                { id: 'wizard', name: 'Chapeau de sorcier', emoji: '🧙‍♂️', price: 500, rarity: 'legendary', onSale: true },
                { id: 'santa', name: 'Bonnet de Noël', emoji: '🎅', price: 100, rarity: 'rare' },
                { id: 'party', name: 'Chapeau de fête', emoji: '🎉', price: 80, rarity: 'common' }
            ],
            skins: [
                { id: 'none', name: 'Aucun', emoji: '🚫', price: 0, rarity: 'common' },
                { id: 'astronaut', name: 'Astronaute', emoji: '👨‍🚀', price: 100, rarity: 'common' },
                { id: 'hazmat', name: 'Combinaison hazmat', emoji: '🧑‍🔬', price: 150, rarity: 'rare' },
                { id: 'military', name: 'Militaire', emoji: '🪖', price: 200, rarity: 'rare' },
                { id: 'police', name: 'Policier', emoji: '👮', price: 175, rarity: 'rare' },
                { id: 'doctor', name: 'Docteur', emoji: '👨‍⚕️', price: 225, rarity: 'epic' },
                { id: 'ninja', name: 'Ninja', emoji: '🥷', price: 400, rarity: 'epic' },
                { id: 'robot', name: 'Robot', emoji: '🤖', price: 600, rarity: 'legendary' }
            ],
            visors: [
                { id: 'none', name: 'Aucune', emoji: '🚫', price: 0, rarity: 'common' },
                { id: 'glasses', name: 'Lunettes', emoji: '👓', price: 60, rarity: 'common' },
                { id: 'sunglasses', name: 'Lunettes de soleil', emoji: '🕶️', price: 80, rarity: 'common' },
                { id: 'monocle', name: 'Monocle', emoji: '🧐', price: 120, rarity: 'rare' },
                { id: 'goggles', name: 'Lunettes de protection', emoji: '🥽', price: 100, rarity: 'rare' },
                { id: 'eyepatch', name: 'Cache-œil', emoji: '🏴‍☠️', price: 150, rarity: 'rare' },
                { id: 'visor', name: 'Visière', emoji: '👨‍💼', price: 200, rarity: 'epic' }
            ],
            pets: [
                { id: 'none', name: 'Aucun', emoji: '🚫', price: 0, rarity: 'common' },
                { id: 'dog', name: 'Chien', emoji: '🐕', price: 150, rarity: 'common' },
                { id: 'cat', name: 'Chat', emoji: '🐱', price: 150, rarity: 'common' },
                { id: 'hamster', name: 'Hamster', emoji: '🐹', price: 100, rarity: 'common' },
                { id: 'bird', name: 'Oiseau', emoji: '🐦', price: 120, rarity: 'common' },
                { id: 'alien', name: 'Alien', emoji: '👽', price: 300, rarity: 'rare' },
                { id: 'robot_pet', name: 'Robot de compagnie', emoji: '🤖', price: 400, rarity: 'epic' },
                { id: 'dragon', name: 'Dragon', emoji: '🐉', price: 800, rarity: 'legendary', onSale: true }
            ],
            nameplates: [
                { id: 'none', name: 'Aucune', emoji: '🚫', price: 0, rarity: 'common' },
                { id: 'basic', name: 'Basique', emoji: '📛', price: 50, rarity: 'common' },
                { id: 'gold', name: 'Or', emoji: '🏆', price: 200, rarity: 'rare' },
                { id: 'diamond', name: 'Diamant', emoji: '💎', price: 500, rarity: 'epic' },
                { id: 'rainbow', name: 'Arc-en-ciel', emoji: '🌈', price: 750, rarity: 'legendary' },
                { id: 'fire', name: 'Feu', emoji: '🔥', price: 300, rarity: 'epic' },
                { id: 'ice', name: 'Glace', emoji: '❄️', price: 300, rarity: 'epic' }
            ]
        };
    }
    
    // Utility methods for cosmetic management
    getEquippedCosmetics() {
        return this.app.gameState.cosmetics.equipped;
    }
    
    getOwnedCosmetics() {
        return this.app.gameState.cosmetics.owned;
    }
    
    addCurrency(amount) {
        this.app.gameState.cosmetics.currency += amount;
        this.updateCurrencyDisplay();
        this.app.saveData();
    }
    
    // Daily free cosmetic
    claimDailyReward() {
        const lastClaim = localStorage.getItem('last-daily-claim');
        const today = new Date().toDateString();
        
        if (lastClaim !== today) {
            const reward = Math.floor(Math.random() * 100) + 50; // 50-150 coins
            this.addCurrency(reward);
            localStorage.setItem('last-daily-claim', today);
            this.app.showToast(`Récompense quotidienne: ${reward} 🪙`, 'success');
            return true;
        }
        
        return false;
    }
    
    // Cosmetic preview
    previewCosmetic(cosmeticId) {
        const item = this.findCosmeticById(cosmeticId);
        if (!item) return;
        
        // Create preview modal
        const content = `
            <div class="cosmetic-preview-modal">
                <h4>Aperçu: ${item.name}</h4>
                <div class="preview-character">
                    <div class="character-display">
                        <!-- Character preview would go here -->
                        <div class="character-base ${this.app.gameState.cosmetics.equipped.colors || 'red'}">
                            <div class="character-hat">${item.emoji || ''}</div>
                        </div>
                    </div>
                </div>
                <div class="preview-actions">
                    ${this.isOwned(cosmeticId) ? 
                        `<button class="btn-large primary" onclick="cosmetics.equipItem('${cosmeticId}'); app.closeModal();">Équiper</button>` :
                        `<button class="btn-large primary" onclick="cosmetics.buyItem('${cosmeticId}'); app.closeModal();">Acheter</button>`
                    }
                    <button class="btn-large" onclick="app.closeModal()">Fermer</button>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Aperçu cosmétique');
    }
    
    // Search functionality
    searchCosmetics(query) {
        const allItems = Object.values(this.cosmeticData).flat();
        return allItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
        );
    }
    
    // Sort functionality
    sortCosmetics(items, sortBy) {
        switch (sortBy) {
            case 'name':
                return items.sort((a, b) => a.name.localeCompare(b.name));
            case 'price':
                return items.sort((a, b) => a.price - b.price);
            case 'rarity':
                const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
                return items.sort((a, b) => (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0));
            case 'owned':
                return items.sort((a, b) => this.isOwned(b.id) - this.isOwned(a.id));
            default:
                return items;
        }
    }
    
    // Bulk operations
    equipRandomCosmetic(category) {
        const items = this.cosmeticData[category] || [];
        const ownedItems = items.filter(item => this.isOwned(item.id) && item.id !== 'none');
        
        if (ownedItems.length > 0) {
            const randomItem = ownedItems[Math.floor(Math.random() * ownedItems.length)];
            this.equipItem(randomItem.id);
        }
    }
    
    unequipAll() {
        Object.keys(this.app.gameState.cosmetics.equipped).forEach(category => {
            this.app.gameState.cosmetics.equipped[category] = 'none';
        });
        
        this.updateDisplay();
        this.app.showToast('Tous les cosmétiques déséquipés', 'info');
        this.app.saveData();
    }
}

// Make cosmetics available globally for onclick handlers
window.cosmetics = null;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cosmetics;
}