// Among Us Interface - Settings Module
class Settings {
    constructor(app) {
        this.app = app;
        this.activeTab = 'display';
        this.pendingChanges = {};
        
        this.init();
    }
    
    init() {
        this.setupTabNavigation();
        this.setupSettingsListeners();
        this.loadSettings();
    }
    
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.settings-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }
    
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.settings-tabs .tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        this.activeTab = tabId;
        this.renderTabContent(tabId);
    }
    
    setupSettingsListeners() {
        // We'll set up listeners dynamically when content is rendered
    }
    
    updateDisplay() {
        this.renderTabContent(this.activeTab);
    }
    
    renderTabContent(tabId) {
        const contentContainer = document.querySelector('.settings-content');
        if (!contentContainer) return;
        
        let content = '';
        
        switch (tabId) {
            case 'display':
                content = this.renderDisplaySettings();
                break;
            case 'audio':
                content = this.renderAudioSettings();
                break;
            case 'controls':
                content = this.renderControlsSettings();
                break;
            case 'accessibility':
                content = this.renderAccessibilitySettings();
                break;
            case 'network':
                content = this.renderNetworkSettings();
                break;
            case 'system':
                content = this.renderSystemSettings();
                break;
        }
        
        contentContainer.innerHTML = content;
        this.setupTabSpecificListeners(tabId);
    }
    
    renderDisplaySettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>🖥️ Affichage</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Mode de qualité</div>
                        <div class="setting-description">Ajuste automatiquement les paramètres graphiques</div>
                    </div>
                    <div class="setting-control">
                        <div class="quality-options">
                            <button class="quality-option ${settings.qualityMode === 'performance' ? 'active' : ''}" 
                                    data-value="performance">Perf</button>
                            <button class="quality-option ${settings.qualityMode === 'balanced' ? 'active' : ''}" 
                                    data-value="balanced">Équilibré</button>
                            <button class="quality-option ${settings.qualityMode === 'quality' ? 'active' : ''}" 
                                    data-value="quality">Qualité</button>
                        </div>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Limite FPS</div>
                        <div class="setting-description">Limite le nombre d'images par seconde</div>
                    </div>
                    <div class="setting-control">
                        <select id="fps-cap" data-setting="fpsCap">
                            <option value="auto" ${settings.fpsCap === 'auto' ? 'selected' : ''}>Auto</option>
                            <option value="30" ${settings.fpsCap === 30 ? 'selected' : ''}>30 FPS</option>
                            <option value="45" ${settings.fpsCap === 45 ? 'selected' : ''}>45 FPS</option>
                            <option value="60" ${settings.fpsCap === 60 ? 'selected' : ''}>60 FPS</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Résolution d'affichage</div>
                        <div class="setting-description">Ajuste la netteté de l'affichage</div>
                    </div>
                    <div class="setting-control">
                        <input type="range" id="dpr-cap" min="1.0" max="2.0" step="0.25" 
                               value="${settings.dprCap}" data-setting="dprCap">
                        <span class="setting-value">${settings.dprCap}x</span>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Effets post-traitement</div>
                        <div class="setting-description">Active les effets visuels avancés</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="post-fx" ${settings.postFx ? 'checked' : ''} data-setting="postFx">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Mode d'écran</div>
                        <div class="setting-description">Plein écran ou fenêtré</div>
                    </div>
                    <div class="setting-control">
                        <select id="screen-mode" data-setting="screenMode">
                            <option value="fullscreen" ${settings.screenMode === 'fullscreen' ? 'selected' : ''}>Plein écran web</option>
                            <option value="windowed" ${settings.screenMode === 'windowed' ? 'selected' : ''}>Fenêtré</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Icônes daltonisme</div>
                        <div class="setting-description">Ajoute des symboles aux couleurs</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="colorblind-icons" ${settings.colorblindIcons ? 'checked' : ''} data-setting="colorblindIcons">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAudioSettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>🔊 Audio</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Volume principal</div>
                        <div class="setting-description">Volume général du jeu</div>
                    </div>
                    <div class="setting-control">
                        <div class="volume-control">
                            <input type="range" id="master-volume" min="0" max="100" 
                                   value="${settings.masterVolume}" data-setting="masterVolume" class="volume-slider">
                            <span class="volume-value">${settings.masterVolume}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Volume musique</div>
                        <div class="setting-description">Volume de la musique de fond</div>
                    </div>
                    <div class="setting-control">
                        <div class="volume-control">
                            <input type="range" id="music-volume" min="0" max="100" 
                                   value="${settings.musicVolume}" data-setting="musicVolume" class="volume-slider">
                            <span class="volume-value">${settings.musicVolume}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Volume effets sonores</div>
                        <div class="setting-description">Volume des bruitages du jeu</div>
                    </div>
                    <div class="setting-control">
                        <div class="volume-control">
                            <input type="range" id="sfx-volume" min="0" max="100" 
                                   value="${settings.sfxVolume}" data-setting="sfxVolume" class="volume-slider">
                            <span class="volume-value">${settings.sfxVolume}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Chat vocal</div>
                        <div class="setting-description">Active le chat vocal en jeu</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="voice-chat" ${settings.voiceChatEnabled ? 'checked' : ''} data-setting="voiceChatEnabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row ${!settings.voiceChatEnabled ? 'disabled' : ''}">
                    <div class="setting-info">
                        <div class="setting-label">Volume chat vocal</div>
                        <div class="setting-description">Volume des autres joueurs</div>
                    </div>
                    <div class="setting-control">
                        <div class="volume-control">
                            <input type="range" id="voice-volume" min="0" max="100" 
                                   value="${settings.voiceVolume}" data-setting="voiceVolume" class="volume-slider"
                                   ${!settings.voiceChatEnabled ? 'disabled' : ''}>
                            <span class="volume-value">${settings.voiceVolume}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-row ${!settings.voiceChatEnabled ? 'disabled' : ''}">
                    <div class="setting-info">
                        <div class="setting-label">Appuyer pour parler</div>
                        <div class="setting-description">Maintenir une touche pour parler</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="push-to-talk" ${settings.pushToTalk ? 'checked' : ''} 
                                   data-setting="pushToTalk" ${!settings.voiceChatEnabled ? 'disabled' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderControlsSettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>🎮 Contrôles</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Disposition tactile</div>
                        <div class="setting-description">Configuration des contrôles tactiles</div>
                    </div>
                    <div class="setting-control">
                        <select id="touch-layout" data-setting="touchLayout">
                            <option value="left" ${settings.touchLayout === 'left' ? 'selected' : ''}>Gauche classique</option>
                            <option value="right" ${settings.touchLayout === 'right' ? 'selected' : ''}>Droite classique</option>
                            <option value="custom" ${settings.touchLayout === 'custom' ? 'selected' : ''}>Personnalisé</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Vibrations</div>
                        <div class="setting-description">Intensité des vibrations tactiles</div>
                    </div>
                    <div class="setting-control">
                        <select id="haptics" data-setting="haptics">
                            <option value="off" ${settings.haptics === 'off' ? 'selected' : ''}>Désactivé</option>
                            <option value="light" ${settings.haptics === 'light' ? 'selected' : ''}>Faible</option>
                            <option value="medium" ${settings.haptics === 'medium' ? 'selected' : ''}>Moyen</option>
                            <option value="strong" ${settings.haptics === 'strong' ? 'selected' : ''}>Fort</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Chat rapide</div>
                        <div class="setting-description">Messages prédéfinis pour le chat</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="chat-quick" ${settings.chatQuick ? 'checked' : ''} data-setting="chatQuick">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Inverser joystick virtuel</div>
                        <div class="setting-description">Inverse les directions du joystick</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="invert-stick" ${settings.invertVirtualStick ? 'checked' : ''} data-setting="invertVirtualStick">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Raccourcis clavier</div>
                        <div class="setting-description">Personnaliser les touches</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-secondary" onclick="settings.showKeybindSettings()">Configurer</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAccessibilitySettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>♿ Accessibilité</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Taille du texte</div>
                        <div class="setting-description">Ajuste la taille de tous les textes</div>
                    </div>
                    <div class="setting-control">
                        <input type="range" id="text-scale" min="0.8" max="1.4" step="0.05" 
                               value="${settings.textScale}" data-setting="textScale">
                        <span class="setting-value">${Math.round(settings.textScale * 100)}%</span>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Réduire les mouvements</div>
                        <div class="setting-description">Limite les animations et transitions</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="reduce-motion" ${settings.reduceMotion ? 'checked' : ''} data-setting="reduceMotion">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Interface haute contraste</div>
                        <div class="setting-description">Améliore la visibilité des éléments</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="high-contrast" ${settings.highContrast ? 'checked' : ''} data-setting="highContrast">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Filtres de chat</div>
                        <div class="setting-description">Filtre automatiquement le contenu inapproprié</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="chat-filters" ${settings.chatFilters ? 'checked' : ''} data-setting="chatFilters">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Lecteur d'écran</div>
                        <div class="setting-description">Support pour les technologies d'assistance</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="screen-reader" ${settings.screenReader ? 'checked' : ''} data-setting="screenReader">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderNetworkSettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>🌐 Réseau</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Région préférée</div>
                        <div class="setting-description">Région de serveur par défaut</div>
                    </div>
                    <div class="setting-control">
                        <select id="default-region" data-setting="region">
                            <option value="auto" ${settings.region === 'auto' ? 'selected' : ''}>Auto</option>
                            <option value="eu-west" ${settings.region === 'eu-west' ? 'selected' : ''}>EU-Ouest</option>
                            <option value="us-east" ${settings.region === 'us-east' ? 'selected' : ''}>US-Est</option>
                            <option value="ap-south" ${settings.region === 'ap-south' ? 'selected' : ''}>AP-Sud</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Afficher le ping</div>
                        <div class="setting-description">Montre la latence réseau en jeu</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="show-ping" ${settings.showPing ? 'checked' : ''} data-setting="showPing">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Mode données limitées</div>
                        <div class="setting-description">Réduit l'utilisation de données</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="low-data-mode" ${settings.lowDataMode ? 'checked' : ''} data-setting="lowDataMode">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Test de connexion</div>
                        <div class="setting-description">Vérifier la qualité de votre connexion</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-secondary" onclick="settings.runConnectionTest()">Tester</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSystemSettings() {
        const settings = this.app.gameState.settings;
        
        return `
            <div class="settings-section">
                <h3>⚙️ Système</h3>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Langue</div>
                        <div class="setting-description">Langue de l'interface</div>
                    </div>
                    <div class="setting-control">
                        <select id="language" data-setting="language">
                            <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>Français</option>
                            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${settings.language === 'es' ? 'selected' : ''}>Español</option>
                            <option value="de" ${settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                            <option value="it" ${settings.language === 'it' ? 'selected' : ''}>Italiano</option>
                            <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Vider le cache</div>
                        <div class="setting-description">Supprime les fichiers temporaires</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-secondary" onclick="settings.clearCache()">Vider</button>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Réinitialiser tutoriels</div>
                        <div class="setting-description">Revoir tous les tutoriels</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-secondary" onclick="settings.resetTutorials()">Réinitialiser</button>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Sauvegarde automatique</div>
                        <div class="setting-description">Sauvegarde automatique des paramètres</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="auto-save" ${settings.autoSave !== false ? 'checked' : ''} data-setting="autoSave">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Exporter paramètres</div>
                        <div class="setting-description">Sauvegarder vos paramètres</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-secondary" onclick="settings.exportSettings()">Exporter</button>
                    </div>
                </div>
                
                <div class="setting-row">
                    <div class="setting-info">
                        <div class="setting-label">Importer paramètres</div>
                        <div class="setting-description">Restaurer des paramètres sauvegardés</div>
                    </div>
                    <div class="setting-control">
                        <input type="file" id="import-settings" accept=".json" style="display: none;" onchange="settings.importSettings(this)">
                        <button class="btn-secondary" onclick="document.getElementById('import-settings').click()">Importer</button>
                    </div>
                </div>
                
                <div class="setting-row danger-zone">
                    <div class="setting-info">
                        <div class="setting-label">Réinitialiser tous les paramètres</div>
                        <div class="setting-description">Remet tous les paramètres par défaut</div>
                    </div>
                    <div class="setting-control">
                        <button class="btn-danger" onclick="settings.resetAllSettings()">Réinitialiser</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupTabSpecificListeners(tabId) {
        // Range sliders
        document.querySelectorAll('input[type="range"][data-setting]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.handleSettingChange(e.target.dataset.setting, parseFloat(e.target.value));
                this.updateSliderDisplay(e.target);
            });
        });
        
        // Checkboxes
        document.querySelectorAll('input[type="checkbox"][data-setting]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.dataset.setting, e.target.checked);
                this.handleSpecialSettings(e.target.dataset.setting, e.target.checked);
            });
        });
        
        // Select dropdowns
        document.querySelectorAll('select[data-setting]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleSettingChange(e.target.dataset.setting, e.target.value);
            });
        });
        
        // Quality buttons
        document.querySelectorAll('.quality-option').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.quality-option').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.handleSettingChange('qualityMode', e.target.dataset.value);
                this.applyQualityPreset(e.target.dataset.value);
            });
        });
        
        // Volume sliders
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.updateVolumeDisplay(e.target);
            });
        });
    }
    
    handleSettingChange(settingKey, value) {
        // Update the app settings
        this.app.gameState.settings[settingKey] = value;
        
        // Apply the setting immediately
        this.applySetting(settingKey, value);
        
        // Save settings
        if (this.app.gameState.settings.autoSave !== false) {
            this.saveSettings();
        }
    }
    
    handleSpecialSettings(settingKey, value) {
        switch (settingKey) {
            case 'voiceChatEnabled':
                this.toggleVoiceChatSettings(value);
                break;
            case 'reduceMotion':
                this.applyReducedMotion(value);
                break;
            case 'highContrast':
                this.applyHighContrast(value);
                break;
            case 'textScale':
                this.applyTextScale(value);
                break;
        }
    }
    
    updateSliderDisplay(slider) {
        const valueSpan = slider.parentNode.querySelector('.setting-value');
        if (valueSpan) {
            let value = slider.value;
            let suffix = '';
            
            if (slider.id.includes('scale') || slider.id.includes('dpr')) {
                suffix = 'x';
                value = parseFloat(value).toFixed(1);
            } else if (slider.id.includes('volume')) {
                suffix = '%';
            }
            
            valueSpan.textContent = value + suffix;
        }
    }
    
    updateVolumeDisplay(slider) {
        const valueSpan = slider.parentNode.querySelector('.volume-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value + '%';
        }
    }
    
    applySetting(settingKey, value) {
        switch (settingKey) {
            case 'textScale':
                document.documentElement.style.fontSize = (16 * value) + 'px';
                break;
            case 'reduceMotion':
                document.body.classList.toggle('reduce-motion', value);
                break;
            case 'highContrast':
                document.body.classList.toggle('high-contrast', value);
                break;
            case 'colorblindIcons':
                document.body.classList.toggle('colorblind-icons', value);
                break;
            case 'language':
                this.changeLanguage(value);
                break;
        }
    }
    
    applyQualityPreset(preset) {
        const presets = {
            performance: {
                fpsCap: 30,
                dprCap: 1.0,
                postFx: false
            },
            balanced: {
                fpsCap: 60,
                dprCap: 1.25,
                postFx: true
            },
            quality: {
                fpsCap: 60,
                dprCap: 2.0,
                postFx: true
            }
        };
        
        const settings = presets[preset];
        if (settings) {
            Object.keys(settings).forEach(key => {
                this.handleSettingChange(key, settings[key]);
            });
            
            // Re-render the display tab to show updated values
            if (this.activeTab === 'display') {
                this.renderTabContent('display');
            }
        }
    }
    
    toggleVoiceChatSettings(enabled) {
        const voiceSettings = document.querySelectorAll('#voice-volume, #push-to-talk');
        voiceSettings.forEach(setting => {
            setting.disabled = !enabled;
            setting.closest('.setting-row').classList.toggle('disabled', !enabled);
        });
    }
    
    applyReducedMotion(enabled) {
        if (enabled) {
            document.body.classList.add('reduce-motion');
            // Disable CSS animations
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            style.id = 'reduce-motion-style';
            document.head.appendChild(style);
        } else {
            document.body.classList.remove('reduce-motion');
            const style = document.getElementById('reduce-motion-style');
            if (style) {
                style.remove();
            }
        }
    }
    
    applyHighContrast(enabled) {
        document.body.classList.toggle('high-contrast', enabled);
    }
    
    applyTextScale(scale) {
        document.documentElement.style.fontSize = (16 * scale) + 'px';
    }
    
    changeLanguage(language) {
        // In a real implementation, this would load language files
        this.app.showToast(`Langue changée: ${language}`, 'info');
    }
    
    // System actions
    clearCache() {
        try {
            // Clear various caches
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name);
                    });
                });
            }
            
            // Clear localStorage except settings
            const settings = localStorage.getItem('amongus-settings');
            const gameState = localStorage.getItem('amongus-gamestate');
            localStorage.clear();
            if (settings) localStorage.setItem('amongus-settings', settings);
            if (gameState) localStorage.setItem('amongus-gamestate', gameState);
            
            this.app.showToast('Cache vidé avec succès', 'success');
        } catch (e) {
            this.app.showToast('Erreur lors du vidage du cache', 'error');
        }
    }
    
    resetTutorials() {
        localStorage.removeItem('tutorials-completed');
        this.app.showToast('Tutoriels réinitialisés', 'success');
    }
    
    exportSettings() {
        const settings = {
            gameSettings: this.app.gameState.settings,
            cosmetics: this.app.gameState.cosmetics,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `among-us-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.app.showToast('Paramètres exportés', 'success');
    }
    
    importSettings(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                if (settings.gameSettings) {
                    this.app.gameState.settings = { ...this.app.gameState.settings, ...settings.gameSettings };
                }
                
                if (settings.cosmetics) {
                    this.app.gameState.cosmetics = { ...this.app.gameState.cosmetics, ...settings.cosmetics };
                }
                
                this.saveSettings();
                this.renderTabContent(this.activeTab);
                this.app.showToast('Paramètres importés avec succès', 'success');
            } catch (error) {
                this.app.showToast('Erreur lors de l\'importation', 'error');
            }
        };
        
        reader.readAsText(file);
        input.value = ''; // Reset file input
    }
    
    resetAllSettings() {
        this.app.showModal(`
            <div class="confirm-dialog">
                <h4>⚠️ Confirmer la réinitialisation</h4>
                <p>Cette action va remettre tous les paramètres à leur valeur par défaut. Cette action est irréversible.</p>
                <div class="confirm-actions">
                    <button class="btn-large danger" onclick="settings.confirmResetSettings()">Réinitialiser</button>
                    <button class="btn-large" onclick="app.closeModal()">Annuler</button>
                </div>
            </div>
        `, 'Réinitialiser les paramètres');
    }
    
    confirmResetSettings() {
        this.app.gameState.settings = this.app.getDefaultSettings();
        this.saveSettings();
        this.renderTabContent(this.activeTab);
        this.app.closeModal();
        this.app.showToast('Paramètres réinitialisés', 'success');
    }
    
    runConnectionTest() {
        this.app.showToast('Test de connexion en cours...', 'info');
        
        // Simulate connection test
        setTimeout(() => {
            const ping = Math.floor(Math.random() * 100) + 20;
            const downloadSpeed = Math.floor(Math.random() * 50) + 10;
            const uploadSpeed = Math.floor(Math.random() * 20) + 5;
            
            this.app.showModal(`
                <div class="connection-test-results">
                    <h4>📊 Résultats du test</h4>
                    <div class="test-result">
                        <span class="label">Ping:</span>
                        <span class="value ${ping < 50 ? 'good' : ping < 100 ? 'ok' : 'bad'}">${ping}ms</span>
                    </div>
                    <div class="test-result">
                        <span class="label">Téléchargement:</span>
                        <span class="value">${downloadSpeed} Mbps</span>
                    </div>
                    <div class="test-result">
                        <span class="label">Upload:</span>
                        <span class="value">${uploadSpeed} Mbps</span>
                    </div>
                    <div class="connection-quality">
                        <strong>Qualité: ${ping < 50 && downloadSpeed > 20 ? 'Excellente' : ping < 100 && downloadSpeed > 10 ? 'Bonne' : 'Moyenne'}</strong>
                    </div>
                    <button class="btn-large primary" onclick="app.closeModal()">Fermer</button>
                </div>
            `, 'Test de connexion');
        }, 3000);
    }
    
    showKeybindSettings() {
        const keybinds = {
            move_up: 'W',
            move_down: 'S',
            move_left: 'A',
            move_right: 'D',
            use: 'E',
            report: 'R',
            kill: 'Q',
            sabotage: 'F',
            map: 'Tab',
            chat: 'Enter'
        };
        
        const content = `
            <div class="keybind-settings">
                <h4>⌨️ Raccourcis clavier</h4>
                <div class="keybind-list">
                    ${Object.entries(keybinds).map(([action, key]) => `
                        <div class="keybind-row">
                            <span class="action-name">${this.getActionName(action)}</span>
                            <button class="keybind-button" data-action="${action}">${key}</button>
                        </div>
                    `).join('')}
                </div>
                <div class="keybind-actions">
                    <button class="btn-large" onclick="settings.resetKeybinds()">Réinitialiser</button>
                    <button class="btn-large primary" onclick="app.closeModal()">Fermer</button>
                </div>
            </div>
        `;
        
        this.app.showModal(content, 'Configuration des touches');
    }
    
    getActionName(action) {
        const names = {
            move_up: 'Haut',
            move_down: 'Bas',
            move_left: 'Gauche',
            move_right: 'Droite',
            use: 'Utiliser',
            report: 'Signaler',
            kill: 'Tuer',
            sabotage: 'Saboter',
            map: 'Carte',
            chat: 'Chat'
        };
        return names[action] || action;
    }
    
    resetKeybinds() {
        this.app.showToast('Raccourcis réinitialisés', 'success');
        this.showKeybindSettings(); // Refresh the modal
    }
    
    loadSettings() {
        // Settings are loaded by the main app
        this.applyAllSettings();
    }
    
    saveSettings() {
        this.app.saveData();
    }
    
    applyAllSettings() {
        const settings = this.app.gameState.settings;
        
        // Apply all settings that affect the UI immediately
        this.applySetting('textScale', settings.textScale);
        this.applySetting('reduceMotion', settings.reduceMotion);
        this.applySetting('highContrast', settings.highContrast);
        this.applySetting('colorblindIcons', settings.colorblindIcons);
    }
}

// Make settings available globally for onclick handlers
window.settings = null;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Settings;
}