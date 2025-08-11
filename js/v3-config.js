// Among Us V3 - Game Configuration
const AmongUsV3Config = {
    // Game Version
    version: '3.0.0',
    buildDate: '2024-01-15',
    
    // Game Settings
    game: {
        maxPlayers: 15,
        minPlayers: 4,
        defaultImpostors: 2,
        maxImpostors: 3,
        
        // Timing (in seconds)
        killCooldown: 45,
        emergencyCooldown: 15,
        discussionTime: 15,
        votingTime: 120,
        
        // Vision and Movement
        playerSpeed: 1.0,
        crewmateVision: 1.0,
        impostorVision: 1.5,
        killDistance: 1.0,
        
        // Tasks
        commonTasks: 1,
        longTasks: 1,
        shortTasks: 2,
        visualTasks: true,
        taskBarUpdates: 'always', // always, meetings, never
        
        // Game Rules
        confirmEjects: true,
        emergencyMeetings: 1,
        anonymousVotes: false,
        discussionTime: 15,
        votingTime: 120
    },
    
    // Graphics Settings
    graphics: {
        targetFPS: 60,
        enableVSync: true,
        qualityLevel: 'high', // low, medium, high, ultra
        enableParticles: true,
        enableAnimations: true,
        enableShadows: true,
        enableGlow: true,
        
        // Canvas Settings
        canvasWidth: 1920,
        canvasHeight: 1080,
        pixelRatio: window.devicePixelRatio || 1,
        
        // Rendering
        enableCulling: true,
        cullingDistance: 1500,
        enableLOD: true,
        lodDistance: 500
    },
    
    // Audio Settings
    audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        voiceVolume: 1.0,
        
        // Audio Files
        sounds: {
            ambient: 'assets/sounds/ambient.mp3',
            buttonClick: 'assets/sounds/button-click.mp3',
            taskComplete: 'assets/sounds/task-complete.mp3',
            emergency: 'assets/sounds/emergency.mp3',
            kill: 'assets/sounds/kill.mp3'
        }
    },
    
    // UI Settings
    ui: {
        theme: 'dark',
        fontSize: 'medium', // small, medium, large
        uiScale: 1.0,
        showFPS: false,
        showPing: true,
        enableNotifications: true,
        notificationDuration: 3000,
        
        // Chat Settings
        chatEnabled: true,
        quickChatOnly: false,
        maxChatLength: 100,
        chatHistory: 50,
        
        // Accessibility
        colorBlindSupport: false,
        highContrast: false,
        reducedMotion: false
    },
    
    // Performance Settings
    performance: {
        adaptiveQuality: true,
        performanceMode: false,
        maxParticles: 1000,
        maxEntities: 100,
        
        // Memory Management
        enableMemoryOptimization: true,
        memoryCleanupInterval: 30000, // 30 seconds
        maxMemoryUsage: 500, // MB
        
        // Frame Rate
        minFPS: 30,
        maxFPS: 144,
        frameSkipping: false
    },
    
    // Network Settings
    networking: {
        simulatedLatency: 50, // ms
        simulatedPacketLoss: 0.01, // 1%
        maxPlayers: 15,
        heartbeatInterval: 5000, // 5 seconds
        timeoutDuration: 30000, // 30 seconds
        
        // Regions
        defaultRegion: 'auto',
        regions: {
            auto: { name: 'Auto', ping: 0 },
            eu: { name: 'Europe', ping: 23 },
            na: { name: 'North America', ping: 89 },
            as: { name: 'Asia', ping: 156 }
        }
    },
    
    // Player Colors
    colors: [
        { id: 'red', name: 'Rouge', hex: '#C51111' },
        { id: 'blue', name: 'Bleu', hex: '#132ED1' },
        { id: 'green', name: 'Vert', hex: '#117F2D' },
        { id: 'pink', name: 'Rose', hex: '#ED54BA' },
        { id: 'orange', name: 'Orange', hex: '#EF7D0D' },
        { id: 'yellow', name: 'Jaune', hex: '#F5F557' },
        { id: 'black', name: 'Noir', hex: '#3F474E' },
        { id: 'white', name: 'Blanc', hex: '#D6E0F0' },
        { id: 'purple', name: 'Violet', hex: '#6B2FBB' },
        { id: 'brown', name: 'Marron', hex: '#71491E' },
        { id: 'cyan', name: 'Cyan', hex: '#38FEDC' },
        { id: 'lime', name: 'Lime', hex: '#50EF39' }
    ],
    
    // Maps Configuration
    maps: {
        default: 'skeld',
        available: ['skeld', 'mira', 'polus'],
        
        skeld: {
            name: 'The Skeld',
            size: { width: 2000, height: 1200 },
            spawnPoint: { x: 900, y: 325 },
            emergencyButton: { x: 900, y: 300 }
        },
        
        mira: {
            name: 'Mira HQ',
            size: { width: 1800, height: 1000 },
            spawnPoint: { x: 500, y: 275 },
            emergencyButton: { x: 500, y: 275 }
        },
        
        polus: {
            name: 'Polus',
            size: { width: 2200, height: 1400 },
            spawnPoint: { x: 450, y: 375 },
            emergencyButton: { x: 500, y: 375 }
        }
    },
    
    // Task Definitions
    tasks: {
        categories: {
            common: { color: '#4CAF50', icon: 'fas fa-users' },
            short: { color: '#2196F3', icon: 'fas fa-clock' },
            long: { color: '#FF9800', icon: 'fas fa-hourglass-half' },
            visual: { color: '#9C27B0', icon: 'fas fa-eye' }
        },
        
        difficulty: {
            easy: { multiplier: 0.8, color: '#4CAF50' },
            medium: { multiplier: 1.0, color: '#FF9800' },
            hard: { multiplier: 1.3, color: '#f44336' }
        }
    },
    
    // Animation Settings
    animations: {
        enableTransitions: true,
        transitionDuration: 300,
        easingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Particle Effects
        particles: {
            taskComplete: { count: 15, duration: 1500 },
            playerDeath: { count: 25, duration: 2000 },
            emergencyMeeting: { count: 30, duration: 3000 },
            sabotage: { count: 20, duration: 2500 }
        }
    },
    
    // Debug Settings
    debug: {
        enabled: false,
        showPerformanceOverlay: false,
        showCollisionBoxes: false,
        showFPSCounter: false,
        enableConsoleLogging: true,
        logLevel: 'info', // error, warn, info, debug
        
        // Development Tools
        enableDevTools: false,
        enableGodMode: false,
        enableTeleport: false,
        skipIntro: false
    },
    
    // Localization
    localization: {
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en', 'es', 'de'],
        
        // Text Strings
        strings: {
            fr: {
                gameTitle: 'Among Us V3',
                quickPlay: 'Partie Rapide',
                createRoom: 'Créer une Partie',
                joinRoom: 'Rejoindre',
                settings: 'Paramètres',
                loading: 'Chargement...',
                connecting: 'Connexion...',
                gameStarted: 'Partie commencée',
                taskCompleted: 'Tâche terminée',
                emergencyMeeting: 'Réunion d\'urgence',
                voting: 'Vote en cours',
                victory: 'Victoire',
                defeat: 'Défaite'
            }
        }
    },
    
    // Storage Keys
    storage: {
        settings: 'amongus-v3-settings',
        playerData: 'amongus-v3-player',
        gameStats: 'amongus-v3-stats',
        achievements: 'amongus-v3-achievements'
    },
    
    // API Endpoints (for future multiplayer)
    api: {
        baseUrl: 'https://api.amongus-v3.com',
        endpoints: {
            auth: '/auth',
            rooms: '/rooms',
            players: '/players',
            stats: '/stats'
        }
    },
    
    // Feature Flags
    features: {
        enableMultiplayer: false,
        enableVoiceChat: false,
        enableCustomMaps: false,
        enableMods: false,
        enableAchievements: true,
        enableStatistics: true,
        enableReplay: false
    },
    
    // System Requirements
    requirements: {
        minRAM: 2, // GB
        recommendedRAM: 4, // GB
        minCPU: 'Dual Core 2.0 GHz',
        recommendedCPU: 'Quad Core 2.5 GHz',
        minGPU: 'Integrated Graphics',
        recommendedGPU: 'Dedicated Graphics Card',
        minBrowser: {
            chrome: 80,
            firefox: 75,
            safari: 13,
            edge: 80
        }
    }
};

// Configuration validation
AmongUsV3Config.validate = function() {
    const errors = [];
    
    // Validate game settings
    if (this.game.maxImpostors > Math.floor(this.game.maxPlayers / 2)) {
        errors.push('Too many impostors for max players');
    }
    
    if (this.game.killCooldown < 10) {
        errors.push('Kill cooldown too short');
    }
    
    // Validate graphics settings
    if (this.graphics.targetFPS < 30 || this.graphics.targetFPS > 144) {
        errors.push('Invalid target FPS');
    }
    
    // Validate audio settings
    if (this.audio.masterVolume < 0 || this.audio.masterVolume > 1) {
        errors.push('Invalid master volume');
    }
    
    return errors;
};

// Configuration loading and saving
AmongUsV3Config.load = function() {
    try {
        const saved = localStorage.getItem(this.storage.settings);
        if (saved) {
            const settings = JSON.parse(saved);
            this.merge(settings);
        }
    } catch (error) {
        console.warn('Failed to load configuration:', error);
    }
};

AmongUsV3Config.save = function() {
    try {
        const settings = {
            graphics: this.graphics,
            audio: this.audio,
            ui: this.ui,
            performance: this.performance,
            game: this.game
        };
        localStorage.setItem(this.storage.settings, JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save configuration:', error);
    }
};

AmongUsV3Config.merge = function(settings) {
    for (const [category, values] of Object.entries(settings)) {
        if (this[category] && typeof this[category] === 'object') {
            Object.assign(this[category], values);
        }
    }
};

AmongUsV3Config.reset = function() {
    localStorage.removeItem(this.storage.settings);
    location.reload();
};

// Export configuration
window.AmongUsV3Config = AmongUsV3Config;

// Auto-load configuration
document.addEventListener('DOMContentLoaded', () => {
    AmongUsV3Config.load();
    
    // Validate configuration
    const errors = AmongUsV3Config.validate();
    if (errors.length > 0) {
        console.warn('Configuration validation errors:', errors);
    }
    
    console.log('🔧 Configuration loaded:', AmongUsV3Config.version);
});