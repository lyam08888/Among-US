// Among Us V4 - Système Audio Avancé

// Extensions audio à essayer (dans l'ordre de priorité)
const AUDIO_EXTS = ['.wav', '.mp3', '.ogg'];

// Résolution du chemin réel d'un fichier audio
async function resolveAudioUrl(basePathWithoutExt) {
    for (const ext of AUDIO_EXTS) {
        const url = `${basePathWithoutExt}${ext}`;
        try {
            const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
            if (res.ok) return url;
        } catch(e) { 
            // Ignore les erreurs de réseau
        }
    }
    return null;
}

// Chargement robuste d'un ArrayBuffer
async function fetchArrayBufferSafe(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.arrayBuffer();
    } catch(e) {
        console.warn(`🔇 Failed to fetch: ${url}`, e);
        return null;
    }
}

class AdvancedAudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.ambientGain = null;
        this.voiceGain = null;
        this.isInitialized = false;
        this.pendingUserInteraction = true;
        
        // Stockage des sons
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.ambientSounds = new Map();
        this.loadedBuffers = new Map();
        this.pendingBuffers = new Map(); // Pour stocker les ArrayBuffers avant décodage
        
        // Sons en cours de lecture
        this.playingSounds = new Map();
        this.playingMusic = null;
        this.playingAmbient = new Map();
        
        // Configuration
        this.config = {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            ambientVolume: 0.4,
            voiceVolume: 0.9,
            spatialAudioEnabled: true,
            reverbEnabled: true,
            compressionEnabled: true
        };
        
        // Effets audio
        this.effects = {
            reverb: null,
            compressor: null,
            lowpass: null,
            highpass: null
        };
        
        // Système audio spatial
        this.spatialAudio = {
            listenerPosition: { x: 0, y: 0 },
            listenerOrientation: 0,
            maxDistance: 1000,
            rolloffFactor: 1,
            dopplerFactor: 1
        };
        
        // Définition des sons du jeu (sans extensions - seront résolues automatiquement)
        this.soundDefinitions = {
            // Sons d'interface
            'button-click': { file: 'button-click', volume: 0.6, category: 'sfx' },
            'button-hover': { file: 'button-hover', volume: 0.4, category: 'sfx' },
            'menu-open': { file: 'menu-open', volume: 0.5, category: 'sfx' },
            'menu-close': { file: 'menu-close', volume: 0.5, category: 'sfx' },
            
            // Sons de gameplay
            'footstep': { file: 'footstep', volume: 0.3, category: 'sfx', spatial: true },
            'task-complete': { file: 'task-complete', volume: 0.7, category: 'sfx' },
            'task-progress': { file: 'task-progress', volume: 0.5, category: 'sfx' },
            'emergency': { file: 'emergency', volume: 0.9, category: 'sfx' },
            'discussion': { file: 'discussion', volume: 0.8, category: 'sfx' },
            'voting': { file: 'voting', volume: 0.6, category: 'sfx' },
            'kill': { file: 'kill', volume: 0.8, category: 'sfx', spatial: true },
            'vent': { file: 'vent', volume: 0.7, category: 'sfx', spatial: true },
            'sabotage': { file: 'sabotage', volume: 0.8, category: 'sfx' },
            'door-open': { file: 'door-open', volume: 0.5, category: 'sfx', spatial: true },
            'door-close': { file: 'door-close', volume: 0.5, category: 'sfx', spatial: true },
            
            // Musiques
            'lobby': { file: 'lobby', volume: 0.6, category: 'music', loop: true },
            'gameplay': { file: 'gameplay', volume: 0.4, category: 'music', loop: true },
            'discussion-music': { file: 'discussion-music', volume: 0.5, category: 'music', loop: true },
            'victory': { file: 'victory', volume: 0.7, category: 'music', loop: false },
            'defeat': { file: 'defeat', volume: 0.7, category: 'music', loop: false },
            
            // Sons ambiants
            'ambient': { file: 'ambient', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-ship': { file: 'ambient-ship', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-electrical': { file: 'ambient-electrical', volume: 0.4, category: 'ambient', loop: true, spatial: true },
            'ambient-engine': { file: 'ambient-engine', volume: 0.5, category: 'ambient', loop: true, spatial: true },
            'ambient-medbay': { file: 'ambient-medbay', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-cafeteria': { file: 'ambient-cafeteria', volume: 0.2, category: 'ambient', loop: true, spatial: true },
            'ambient-reactor': { file: 'ambient-reactor', volume: 0.6, category: 'ambient', loop: true, spatial: true },
            'ambient-security': { file: 'ambient-security', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-weapons': { file: 'ambient-weapons', volume: 0.4, category: 'ambient', loop: true, spatial: true },
            'ambient-navigation': { file: 'ambient-navigation', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-o2': { file: 'ambient-o2', volume: 0.4, category: 'ambient', loop: true, spatial: true },
            'ambient-shields': { file: 'ambient-shields', volume: 0.4, category: 'ambient', loop: true, spatial: true },
            'ambient-comms': { file: 'ambient-comms', volume: 0.3, category: 'ambient', loop: true, spatial: true },
            'ambient-storage': { file: 'ambient-storage', volume: 0.2, category: 'ambient', loop: true, spatial: true }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🔊 Initializing Advanced Audio System...');
        
        try {
            // Préparer le système audio (sans créer le contexte)
            await this.prepareAudioSystem();
            
            // Attendre l'interaction utilisateur pour créer le contexte audio
            this.setupUserInteractionHandler();
            
            console.log('✅ Advanced Audio System prepared (waiting for user interaction)');
        } catch (error) {
            console.error('❌ Failed to initialize audio system:', error);
            throw error;
        }
    }
    
    async prepareAudioSystem() {
        // Charger les ArrayBuffers des sons sans créer le contexte audio
        await this.loadAllSoundBuffers();
    }
    
    setupUserInteractionHandler() {
        const initAudioOnInteraction = async () => {
            if (this.pendingUserInteraction) {
                try {
                    await this.initializeAudioContext();
                    this.createGainNodes();
                    this.createAudioEffects();
                    await this.decodePendingBuffers();
                    this.applyStoredVolumeSettings();
                    this.isInitialized = true;
                    this.pendingUserInteraction = false;
                    console.log('✅ Audio context initialized after user interaction');
                    
                    // Supprimer les écouteurs d'événements
                    document.removeEventListener('click', initAudioOnInteraction);
                    document.removeEventListener('touchstart', initAudioOnInteraction);
                    document.removeEventListener('keydown', initAudioOnInteraction);
                } catch (error) {
                    console.error('❌ Failed to initialize audio context:', error);
                }
            }
        };
        
        // Écouter les interactions utilisateur
        document.addEventListener('click', initAudioOnInteraction);
        document.addEventListener('touchstart', initAudioOnInteraction);
        document.addEventListener('keydown', initAudioOnInteraction);
    }
    
    async initializeAudioContext() {
        // Créer le contexte audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Reprendre le contexte si nécessaire (politique des navigateurs)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        console.log('🎵 Audio context initialized');
    }
    
    createGainNodes() {
        // Nœud de gain principal
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.config.masterVolume;
        this.masterGain.connect(this.audioContext.destination);
        
        // Nœuds de gain par catégorie
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.config.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = this.config.sfxVolume;
        this.sfxGain.connect(this.masterGain);
        
        this.ambientGain = this.audioContext.createGain();
        this.ambientGain.gain.value = this.config.ambientVolume;
        this.ambientGain.connect(this.masterGain);
        
        this.voiceGain = this.audioContext.createGain();
        this.voiceGain.gain.value = this.config.voiceVolume;
        this.voiceGain.connect(this.masterGain);
        
        console.log('🎛️ Gain nodes created');
    }
    
    createAudioEffects() {
        if (!this.config.reverbEnabled && !this.config.compressionEnabled) return;
        
        // Compresseur pour normaliser le volume
        if (this.config.compressionEnabled) {
            this.effects.compressor = this.audioContext.createDynamicsCompressor();
            this.effects.compressor.threshold.value = -24;
            this.effects.compressor.knee.value = 30;
            this.effects.compressor.ratio.value = 12;
            this.effects.compressor.attack.value = 0.003;
            this.effects.compressor.release.value = 0.25;
            
            // Insérer le compresseur avant la sortie
            this.masterGain.disconnect();
            this.masterGain.connect(this.effects.compressor);
            this.effects.compressor.connect(this.audioContext.destination);
        }
        
        // Filtres pour les effets spéciaux
        this.effects.lowpass = this.audioContext.createBiquadFilter();
        this.effects.lowpass.type = 'lowpass';
        this.effects.lowpass.frequency.value = 20000;
        
        this.effects.highpass = this.audioContext.createBiquadFilter();
        this.effects.highpass.type = 'highpass';
        this.effects.highpass.frequency.value = 20;
        
        console.log('🎚️ Audio effects created');
    }
    
    async loadAllSoundBuffers() {
        const loadPromises = [];
        
        for (const [soundId, definition] of Object.entries(this.soundDefinitions)) {
            loadPromises.push(this.loadSoundBuffer(soundId, definition));
        }
        
        const results = await Promise.all(loadPromises);
        const loaded = results.filter(Boolean).length;
        console.log(`🎵 Loaded ${loaded}/${Object.keys(this.soundDefinitions).length} sound buffers`);
    }
    
    async loadSoundBuffer(soundId, definition) {
        try {
            // Résoudre l'URL du fichier audio avec extension
            const baseUrl = `assets/sounds/${definition.file}`;
            const resolvedUrl = await resolveAudioUrl(baseUrl);
            
            if (!resolvedUrl) {
                console.warn(`🔇 Sound not found: ${soundId} (tried ${AUDIO_EXTS.join(', ')})`);
                return null;
            }
            
            // Charger l'ArrayBuffer
            const arrayBuffer = await fetchArrayBufferSafe(resolvedUrl);
            if (!arrayBuffer) {
                console.warn(`🔇 Failed to fetch: ${resolvedUrl}`);
                return null;
            }
            
            // Stocker l'ArrayBuffer pour décodage ultérieur
            this.pendingBuffers.set(soundId, {
                arrayBuffer: arrayBuffer,
                definition: definition,
                url: resolvedUrl
            });
            
            return true;
            
        } catch (error) {
            console.warn(`⚠️ Failed to load sound buffer ${soundId}:`, error);
            return null;
        }
    }
    
    async decodePendingBuffers() {
        const decodePromises = [];
        
        for (const [soundId, data] of this.pendingBuffers.entries()) {
            decodePromises.push(this.decodeSoundBuffer(soundId, data));
        }
        
        const results = await Promise.all(decodePromises);
        const decoded = results.filter(Boolean).length;
        console.log(`🎵 Decoded ${decoded}/${this.pendingBuffers.size} audio buffers`);
        
        // Nettoyer les buffers en attente
        this.pendingBuffers.clear();
    }
    
    async decodeSoundBuffer(soundId, data) {
        try {
            if (!this.audioContext) {
                console.warn(`⚠️ Audio context not available for decoding ${soundId}`);
                return null;
            }
            
            // Clone the ArrayBuffer to avoid DataCloneError
            const audioBuffer = await this.audioContext.decodeAudioData(data.arrayBuffer.slice(0));
            
            this.loadedBuffers.set(soundId, {
                buffer: audioBuffer,
                definition: data.definition,
                url: data.url
            });
            
            return true;
            
        } catch (error) {
            if (error?.name === 'DataCloneError' || error.message?.includes('detached ArrayBuffer')) {
                console.warn('DataCloneError: Cannot decode detached ArrayBuffer. Pass a copy using arrayBuffer.slice(0).');
            }
            console.warn(`⚠️ Failed to decode sound ${soundId}:`, error);
            // Créer un buffer silencieux comme fallback
            try {
                const silentBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
                this.loadedBuffers.set(soundId, {
                    buffer: silentBuffer,
                    definition: data.definition,
                    url: data.url
                });
                return true;
            } catch (e) {
                console.warn(`⚠️ Failed to create silent buffer for ${soundId}:`, e);
                return null;
            }
        }
    }
    
    // Méthode pour charger un son à la demande
    async loadSoundOnDemand(soundId) {
        if (!this.soundDefinitions[soundId]) {
            console.warn(`⚠️ Sound definition not found: ${soundId}`);
            return false;
        }
        
        if (this.loadedBuffers.has(soundId)) {
            return true; // Déjà chargé
        }
        
        const definition = this.soundDefinitions[soundId];
        
        // Charger l'ArrayBuffer
        const loaded = await this.loadSoundBuffer(soundId, definition);
        if (!loaded) return false;
        
        // Si le contexte audio est disponible, décoder immédiatement
        if (this.audioContext && this.pendingBuffers.has(soundId)) {
            const data = this.pendingBuffers.get(soundId);
            const decoded = await this.decodeSoundBuffer(soundId, data);
            this.pendingBuffers.delete(soundId);
            return decoded;
        }
        
        return true;
    }
    
    playSound(soundId, options = {}) {
        if (!this.isInitialized || !this.audioContext) {
            console.warn(`⚠️ Audio system not initialized yet, cannot play sound: ${soundId}`);
            return null;
        }
        
        let soundData = this.loadedBuffers.get(soundId);
        if (!soundData) {
            console.warn(`⚠️ Sound not found: ${soundId}, attempting to load on demand...`);
            // Tentative de chargement à la demande (asynchrone, ne bloque pas)
            this.loadSoundOnDemand(soundId).then(success => {
                if (success) {
                    console.log(`✅ Successfully loaded sound on demand: ${soundId}`);
                }
            }).catch(e => {
                console.warn(`⚠️ Failed to load sound on demand: ${soundId}`, e);
            });
            return null;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = soundData.buffer;
        
        // Créer un nœud de gain pour ce son
        const gainNode = this.audioContext.createGain();
        const volume = (options.volume !== undefined ? options.volume : soundData.definition.volume) || 1;
        gainNode.gain.value = volume;
        
        // Connecter à la bonne catégorie
        const categoryGain = this.getCategoryGain(soundData.definition.category);
        source.connect(gainNode);
        
        // Appliquer l'audio spatial si nécessaire
        if (soundData.definition.spatial && options.position && this.config.spatialAudioEnabled) {
            const pannerNode = this.createSpatialNode(options.position);
            gainNode.connect(pannerNode);
            pannerNode.connect(categoryGain);
        } else {
            gainNode.connect(categoryGain);
        }
        
        // Configurer la boucle
        source.loop = options.loop !== undefined ? options.loop : soundData.definition.loop || false;
        
        // Démarrer la lecture
        const startTime = this.audioContext.currentTime + (options.delay || 0);
        source.start(startTime);
        
        // Gérer la fin de lecture
        const playingSound = {
            source: source,
            gainNode: gainNode,
            soundId: soundId,
            startTime: startTime,
            options: options
        };
        
        if (!source.loop) {
            source.onended = () => {
                this.playingSounds.delete(playingSound);
            };
        }
        
        this.playingSounds.set(playingSound, playingSound);
        
        return playingSound;
    }
    
    playMusic(musicId, options = {}) {
        if (!this.isInitialized || !this.audioContext) {
            console.warn(`⚠️ Audio system not initialized yet, cannot play music: ${musicId}`);
            return null;
        }
        
        // Arrêter la musique actuelle
        if (this.playingMusic) {
            this.stopMusic();
        }
        
        const musicData = this.loadedBuffers.get(musicId);
        if (!musicData) {
            console.warn(`⚠️ Music not found: ${musicId}`);
            return null;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = musicData.buffer;
        source.loop = true;
        
        const gainNode = this.audioContext.createGain();
        const volume = options.volume !== undefined ? options.volume : musicData.definition.volume || 1;
        gainNode.gain.value = 0; // Commencer silencieux pour le fade-in
        
        source.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        source.start();
        
        // Fade-in
        const fadeTime = options.fadeTime || 2;
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeTime);
        
        this.playingMusic = {
            source: source,
            gainNode: gainNode,
            musicId: musicId,
            targetVolume: volume
        };
        
        console.log(`🎵 Playing music: ${musicId}`);
        return this.playingMusic;
    }
    
    stopMusic(fadeTime = 2) {
        if (!this.playingMusic) return;
        
        const music = this.playingMusic;
        
        // Fade-out
        music.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        
        // Arrêter après le fade-out
        setTimeout(() => {
            if (music.source) {
                music.source.stop();
            }
        }, fadeTime * 1000);
        
        this.playingMusic = null;
        console.log(`🎵 Stopped music: ${music.musicId}`);
    }
    
    playAmbientSound(soundId, position, options = {}) {
        // Vérifier si ce son ambiant est déjà en cours
        if (this.playingAmbient.has(soundId)) {
            return this.playingAmbient.get(soundId);
        }
        
        const ambientOptions = {
            ...options,
            position: position,
            loop: true,
            volume: options.volume || 0.3
        };
        
        const playingSound = this.playSound(soundId, ambientOptions);
        if (playingSound) {
            this.playingAmbient.set(soundId, playingSound);
        }
        
        return playingSound;
    }
    
    stopAmbientSound(soundId, fadeTime = 1) {
        const ambientSound = this.playingAmbient.get(soundId);
        if (!ambientSound) return;
        
        // Fade-out
        ambientSound.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        
        // Arrêter après le fade-out
        setTimeout(() => {
            if (ambientSound.source) {
                ambientSound.source.stop();
            }
            this.playingAmbient.delete(soundId);
        }, fadeTime * 1000);
    }
    
    createSpatialNode(position) {
        const pannerNode = this.audioContext.createPanner();
        
        // Configuration de l'audio spatial
        pannerNode.panningModel = 'HRTF';
        pannerNode.distanceModel = 'inverse';
        pannerNode.refDistance = 100;
        pannerNode.maxDistance = this.spatialAudio.maxDistance;
        pannerNode.rolloffFactor = this.spatialAudio.rolloffFactor;
        pannerNode.coneInnerAngle = 360;
        pannerNode.coneOuterAngle = 0;
        pannerNode.coneOuterGain = 0;
        
        // Positionner la source audio
        pannerNode.positionX.value = position.x;
        pannerNode.positionY.value = position.y;
        pannerNode.positionZ.value = 0;
        
        return pannerNode;
    }
    
    updateListenerPosition(position, orientation = 0) {
        if (!this.config.spatialAudioEnabled) return;
        
        this.spatialAudio.listenerPosition = position;
        this.spatialAudio.listenerOrientation = orientation;
        
        // Mettre à jour la position de l'écouteur
        const listener = this.audioContext.listener;
        
        if (listener.positionX) {
            // API moderne
            listener.positionX.value = position.x;
            listener.positionY.value = position.y;
            listener.positionZ.value = 0;
            
            // Orientation
            const forward = {
                x: Math.cos(orientation),
                y: Math.sin(orientation),
                z: 0
            };
            const up = { x: 0, y: 0, z: 1 };
            
            listener.forwardX.value = forward.x;
            listener.forwardY.value = forward.y;
            listener.forwardZ.value = forward.z;
            listener.upX.value = up.x;
            listener.upY.value = up.y;
            listener.upZ.value = up.z;
        } else {
            // API legacy
            listener.setPosition(position.x, position.y, 0);
            listener.setOrientation(
                Math.cos(orientation), Math.sin(orientation), 0,
                0, 0, 1
            );
        }
    }
    
    getCategoryGain(category) {
        switch (category) {
            case 'music': return this.musicGain;
            case 'sfx': return this.sfxGain;
            case 'ambient': return this.ambientGain;
            case 'voice': return this.voiceGain;
            default: return this.sfxGain;
        }
    }
    
    // Contrôles de volume
    setMasterVolume(volume) {
        this.config.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain && this.isInitialized) {
            this.masterGain.gain.value = this.config.masterVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.config.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain && this.isInitialized) {
            this.musicGain.gain.value = this.config.musicVolume;
        }
    }
    
    setSfxVolume(volume) {
        this.config.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain && this.isInitialized) {
            this.sfxGain.gain.value = this.config.sfxVolume;
        }
    }
    
    setAmbientVolume(volume) {
        this.config.ambientVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientGain && this.isInitialized) {
            this.ambientGain.gain.value = this.config.ambientVolume;
        }
    }
    
    setVoiceVolume(volume) {
        this.config.voiceVolume = Math.max(0, Math.min(1, volume));
        if (this.voiceGain && this.isInitialized) {
            this.voiceGain.gain.value = this.config.voiceVolume;
        }
    }
    
    applyStoredVolumeSettings() {
        if (this.isInitialized) {
            if (this.masterGain) this.masterGain.gain.value = this.config.masterVolume;
            if (this.musicGain) this.musicGain.gain.value = this.config.musicVolume;
            if (this.sfxGain) this.sfxGain.gain.value = this.config.sfxVolume;
            if (this.ambientGain) this.ambientGain.gain.value = this.config.ambientVolume;
            if (this.voiceGain) this.voiceGain.gain.value = this.config.voiceVolume;
        }
    }
    
    // Méthode utilitaire pour vérifier si le système audio est prêt
    isReady() {
        return this.isInitialized && this.audioContext && this.audioContext.state === 'running';
    }
    
    // Effets spéciaux
    applyLowPassFilter(frequency = 1000) {
        this.effects.lowpass.frequency.value = frequency;
        // Reconnecter avec le filtre
        this.masterGain.disconnect();
        this.masterGain.connect(this.effects.lowpass);
        this.effects.lowpass.connect(this.effects.compressor || this.audioContext.destination);
    }
    
    removeLowPassFilter() {
        this.effects.lowpass.frequency.value = 20000;
    }
    
    applyHighPassFilter(frequency = 200) {
        this.effects.highpass.frequency.value = frequency;
        // Reconnecter avec le filtre
        this.masterGain.disconnect();
        this.masterGain.connect(this.effects.highpass);
        this.effects.highpass.connect(this.effects.compressor || this.audioContext.destination);
    }
    
    removeHighPassFilter() {
        this.effects.highpass.frequency.value = 20;
    }
    
    // Méthodes utilitaires
    stopAllSounds() {
        for (const [sound] of this.playingSounds) {
            if (sound.source) {
                sound.source.stop();
            }
        }
        this.playingSounds.clear();
    }
    
    stopAllAmbientSounds() {
        for (const [soundId] of this.playingAmbient) {
            this.stopAmbientSound(soundId);
        }
    }
    
    pauseAll() {
        // Suspendre le contexte audio
        if (this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }
    
    resumeAll() {
        // Reprendre le contexte audio
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Méthodes de convenance pour le gameplay
    playFootstep(position) {
        return this.playSound('footstep', { position, volume: 0.3 });
    }
    
    playTaskComplete() {
        return this.playSound('task-complete', { volume: 0.7 });
    }
    
    playEmergencyMeeting() {
        return this.playSound('emergency', { volume: 0.9 });
    }
    
    playKillSound(position) {
        return this.playSound('kill', { position, volume: 0.8 });
    }
    
    playVentSound(position) {
        return this.playSound('vent', { position, volume: 0.7 });
    }
    
    playSabotageSound() {
        return this.playSound('sabotage', { volume: 0.8 });
    }
    
    playButtonClick() {
        return this.playSound('button-click', { volume: 0.6 });
    }
    
    // Gestion des états de jeu
    startLobbyMusic() {
        this.playMusic('lobby');
    }
    
    startGameplayMusic() {
        this.playMusic('gameplay');
    }
    
    startDiscussionMusic() {
        this.playMusic('discussion-music');
    }
    
    playVictoryMusic() {
        this.playMusic('victory', { loop: false });
    }
    
    playDefeatMusic() {
        this.playMusic('defeat', { loop: false });
    }
    
    // Nettoyage
    destroy() {
        this.stopAllSounds();
        this.stopMusic(0);
        this.stopAllAmbientSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🔊 Audio system destroyed');
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAudioSystem;
} else if (typeof window !== 'undefined') {
    window.AdvancedAudioSystem = AdvancedAudioSystem;
}