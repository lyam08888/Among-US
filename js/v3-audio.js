// Among Us V3 - Advanced Audio System
class AmongUsV3Audio {
    constructor(engine) {
        this.engine = engine;
        this.isInitialized = false;
        
        // Audio context
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.voiceGain = null;
        
        // Audio settings
        this.settings = {
            masterVolume: 0.8,
            musicVolume: 0.6,
            sfxVolume: 0.8,
            voiceVolume: 0.9,
            muted: false,
            spatialAudio: true,
            reverb: true,
            compression: true
        };
        
        // Audio assets
        this.sounds = new Map();
        this.music = new Map();
        this.loadingPromises = new Map();
        
        // Currently playing
        this.currentMusic = null;
        this.activeSounds = new Map();
        
        // Audio effects
        this.effects = {
            reverb: null,
            compressor: null,
            lowpass: null,
            highpass: null
        };
        
        // Spatial audio
        this.listener = null;
        this.spatialSources = new Map();
        
        console.log('🔊 Audio system created');
        
        // Handle user interaction for audio context
        this.userInteractionHandled = false;
        this.setupUserInteractionHandler();
    }
    
    setupUserInteractionHandler() {
        const handleUserInteraction = () => {
            if (!this.userInteractionHandled && this.audioContext) {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        console.log('🔊 Audio context resumed after user interaction');
                        this.userInteractionHandled = true;
                    }).catch(error => {
                        console.warn('Failed to resume audio context:', error);
                    });
                } else {
                    this.userInteractionHandled = true;
                }
            }
        };
        
        // Add event listeners for user interaction
        ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, handleUserInteraction, { once: true });
        });
    }
    
    async initialize() {
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error('Web Audio API not supported');
            }
            
            this.audioContext = new AudioContextClass();
            
            // Wait for audio context to be ready
            if (this.audioContext.state === 'suspended') {
                console.log('🔊 Audio context suspended, will resume on user interaction');
            }
            
            // Verify audio context is working
            if (!this.audioContext.sampleRate) {
                throw new Error('Audio context sampleRate is undefined');
            }
            
            // Ensure audio context is in a valid state
            if (this.audioContext.state === 'closed') {
                throw new Error('Audio context is closed');
            }
            
            console.log(`🔊 Audio context created with sample rate: ${this.audioContext.sampleRate}Hz`);
            
            // Create gain nodes
            this.createGainNodes();
            
            // Create audio effects
            this.createAudioEffects();
            
            // Setup spatial audio
            this.setupSpatialAudio();
            
            // Load default sounds
            await this.loadDefaultSounds();
            
            // Immediately use preloaded resources to prevent browser warnings
            this.usePreloadedResources();
            
            this.isInitialized = true;
            console.log('🔊 Audio system initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize audio system:', error);
            // Create a fallback silent audio system
            this.createFallbackAudioSystem();
        }
    }
    
    createFallbackAudioSystem() {
        console.warn('🔇 Creating fallback silent audio system');
        this.isInitialized = true;
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.voiceGain = null;
        
        // Create empty sound maps
        this.sounds.clear();
        this.music.clear();
        
        // Override audio methods to be silent
        this.playSound = () => {};
        this.playMusic = () => {};
        this.stopSound = () => {};
        this.stopMusic = () => {};
        this.setVolume = () => {};
        this.update = () => {};
    }
    
    // Test method to verify audio system is working
    testAudioSystem() {
        console.log('🔊 Testing audio system...');
        console.log('Audio context state:', this.audioContext ? this.audioContext.state : 'null');
        console.log('Sample rate:', this.audioContext ? this.audioContext.sampleRate : 'null');
        console.log('Loaded sounds:', this.sounds.size);
        console.log('Loaded music:', this.music.size);
        console.log('Is initialized:', this.isInitialized);
        
        if (this.isInitialized && this.sounds.has('buttonClick')) {
            console.log('🔊 Audio system test: PASSED');
            return true;
        } else {
            console.log('🔊 Audio system test: FAILED');
            return false;
        }
    }
    
    createGainNodes() {
        // Master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.settings.masterVolume;
        this.masterGain.connect(this.audioContext.destination);
        
        // Music gain
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.settings.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        // SFX gain
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = this.settings.sfxVolume;
        this.sfxGain.connect(this.masterGain);
        
        // Voice gain
        this.voiceGain = this.audioContext.createGain();
        this.voiceGain.gain.value = this.settings.voiceVolume;
        this.voiceGain.connect(this.masterGain);
    }
    
    createAudioEffects() {
        // Reverb
        this.effects.reverb = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        // Compressor
        this.effects.compressor = this.audioContext.createDynamicsCompressor();
        this.effects.compressor.threshold.value = -24;
        this.effects.compressor.knee.value = 30;
        this.effects.compressor.ratio.value = 12;
        this.effects.compressor.attack.value = 0.003;
        this.effects.compressor.release.value = 0.25;
        
        // Filters
        this.effects.lowpass = this.audioContext.createBiquadFilter();
        this.effects.lowpass.type = 'lowpass';
        this.effects.lowpass.frequency.value = 20000;
        
        this.effects.highpass = this.audioContext.createBiquadFilter();
        this.effects.highpass.type = 'highpass';
        this.effects.highpass.frequency.value = 20;
        
        // Connect effects chain
        if (this.settings.compression) {
            this.masterGain.disconnect();
            this.masterGain.connect(this.effects.compressor);
            this.effects.compressor.connect(this.audioContext.destination);
        }
    }
    
    createReverbImpulse() {
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.1;
            }
        }
        
        this.effects.reverb.buffer = impulse;
    }
    
    setupSpatialAudio() {
        if (this.audioContext.listener) {
            this.listener = this.audioContext.listener;
            
            // Set listener orientation (forward and up vectors)
            if (this.listener.forwardX) {
                this.listener.forwardX.value = 0;
                this.listener.forwardY.value = 0;
                this.listener.forwardZ.value = -1;
                this.listener.upX.value = 0;
                this.listener.upY.value = 1;
                this.listener.upZ.value = 0;
            }
        }
    }
    
    async loadDefaultSounds() {
        if (!this.audioContext) {
            console.warn('Audio context not available, skipping sound loading');
            return;
        }
        
        const soundList = [
            { name: 'buttonClick', url: 'assets/sounds/button-click.mp3', fallbackUrl: 'assets/sounds/default-click.mp3', type: 'sfx' },
            { name: 'taskComplete', url: 'assets/sounds/task-complete.mp3', fallbackUrl: 'assets/sounds/default-complete.mp3', type: 'sfx' },
            { name: 'kill', url: 'assets/sounds/kill.mp3', fallbackUrl: 'assets/sounds/default-kill.mp3', type: 'sfx' },
            { name: 'emergency', url: 'assets/sounds/emergency.mp3', fallbackUrl: 'assets/sounds/default-emergency.mp3', type: 'sfx' },
            { name: 'sabotage', url: 'assets/sounds/sabotage.mp3', fallbackUrl: 'assets/sounds/default-sabotage.mp3', type: 'sfx' },
            { name: 'vent', url: 'assets/sounds/vent.mp3', fallbackUrl: 'assets/sounds/default-vent.mp3', type: 'sfx' },
            { name: 'footstep', url: 'assets/sounds/footstep.mp3', fallbackUrl: 'assets/sounds/default-footstep.mp3', type: 'sfx' },
            { name: 'ambient', url: 'assets/sounds/ambient.mp3', fallbackUrl: 'assets/sounds/default-ambient.mp3', type: 'music' },
            { name: 'lobby', url: 'assets/sounds/lobby.mp3', fallbackUrl: 'assets/sounds/default-lobby.mp3', type: 'music' },
            { name: 'discussion', url: 'assets/sounds/discussion.mp3', fallbackUrl: 'assets/sounds/default-discussion.mp3', type: 'music' }
        ];
        
        // Create fallback sounds if files don't exist
        for (let sound of soundList) {
            try {
                await this.loadSound(sound.name, sound.url, sound.type);
            } catch (error) {
                console.warn(`Failed to load ${sound.name}, trying fallback`);
                try {
                    await this.loadSound(sound.name, sound.fallbackUrl, sound.type);
                } catch (fallbackError) {
                    console.warn(`Failed to load fallback for ${sound.name}, creating synthetic sound`);
                    this.createSyntheticSound(sound.name, sound.type);
                }
            }
        }
    }
    
    createSyntheticSound(name, type) {
        if (!this.audioContext) {
            console.error('Audio context not initialized');
            return;
        }
        
        const audioContext = this.audioContext;
        const sampleRate = audioContext.sampleRate;
        
        if (!sampleRate) {
            console.error('Audio context sampleRate is undefined');
            return;
        }
        
        const duration = type === 'music' ? 4.0 : 0.5;
        const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Create different synthetic sounds based on the name
        switch(name) {
            case 'buttonClick':
                this.generateClickSound(channelData, sampleRate);
                break;
            case 'taskComplete':
                this.generateCompletionSound(channelData, sampleRate);
                break;
            case 'kill':
                this.generateDramaticSound(channelData, sampleRate);
                break;
            default:
                this.generateDefaultSound(channelData, sampleRate);
        }

        const soundData = {
            buffer,
            type,
            volume: 1.0,
            loop: type === 'music',
            spatial: false
        };

        if (type === 'music') {
            this.music.set(name, soundData);
        } else {
            this.sounds.set(name, soundData);
        }
    }

    generateClickSound(channelData, sampleRate) {
        const frequency = 800;
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-8 * t);
        }
    }

    generateCompletionSound(channelData, sampleRate) {
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            channelData[i] = frequencies.reduce((acc, freq, index) => {
                return acc + Math.sin(2 * Math.PI * freq * t) * Math.exp(-4 * t);
            }, 0) / frequencies.length;
        }
    }

    generateDramaticSound(channelData, sampleRate) {
        const frequency = 150;
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-2 * t);
        }
    }

    generateDefaultSound(channelData, sampleRate) {
        const frequency = 440;
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-4 * t);
        }
    }

    async loadSound(name, url, type = 'sfx') {
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }
        
        const promise = this.fetchAndDecodeAudio(url).then(buffer => {
            const soundData = {
                buffer,
                type,
                volume: 1.0,
                loop: false,
                spatial: false
            };
            
            if (type === 'music') {
                this.music.set(name, soundData);
            } else {
                this.sounds.set(name, soundData);
            }
            
            return soundData;
        });
        
        this.loadingPromises.set(name, promise);
        return promise;
    }
    
    async fetchAndDecodeAudio(url) {
        try {
            // First try to use preloaded resource
            const preloadedData = await this.tryPreloadedResource(url);
            if (preloadedData) {
                return this.audioContext.decodeAudioData(preloadedData);
            }
        } catch (error) {
            console.warn('Failed to use preloaded resource, falling back to fetch:', error);
        }
        
        // Fallback to regular fetch
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        return this.audioContext.decodeAudioData(arrayBuffer);
    }
    
    async tryPreloadedResource(url) {
        // Check if the resource was preloaded
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="audio"]');
        for (let link of preloadLinks) {
            if (link.href.includes(url) || url.includes(link.getAttribute('href'))) {
                try {
                    const response = await fetch(url, { cache: 'force-cache' });
                    if (response.ok) {
                        return await response.arrayBuffer();
                    }
                } catch (error) {
                    console.warn('Failed to use preloaded resource:', error);
                }
            }
        }
        return null;
    }
    
    usePreloadedResources() {
        // This method ensures preloaded resources are "used" to prevent browser warnings
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="audio"]');
        preloadLinks.forEach(link => {
            const url = link.getAttribute('href');
            if (url) {
                // Create a silent audio element to "use" the preloaded resource
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = 0;
                audio.src = url;
                
                // Load and immediately pause to mark as "used"
                audio.load();
                setTimeout(() => {
                    audio.pause();
                }, 100);
                
                console.log(`🔊 Marked preloaded resource as used: ${url}`);
            }
        });
    }
    
    createFallbackSound(name, type) {
        // Create procedural sounds as fallbacks
        const buffer = this.createProceduralSound(name);
        
        const soundData = {
            buffer,
            type,
            volume: 1.0,
            loop: false,
            spatial: false
        };
        
        if (type === 'music') {
            this.music.set(name, soundData);
        } else {
            this.sounds.set(name, soundData);
        }
    }
    
    createProceduralSound(name) {
        const sampleRate = this.audioContext.sampleRate;
        let duration, frequency, waveType;
        
        switch (name) {
            case 'buttonClick':
                duration = 0.1;
                frequency = 800;
                waveType = 'square';
                break;
            case 'taskComplete':
                duration = 0.5;
                frequency = 600;
                waveType = 'sine';
                break;
            case 'kill':
                duration = 1.0;
                frequency = 200;
                waveType = 'sawtooth';
                break;
            case 'emergency':
                duration = 2.0;
                frequency = 440;
                waveType = 'triangle';
                break;
            default:
                duration = 0.2;
                frequency = 440;
                waveType = 'sine';
        }
        
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3); // Exponential decay
            
            let sample = 0;
            switch (waveType) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                    break;
            }
            
            data[i] = sample * envelope * 0.3;
        }
        
        return buffer;
    }
    
    playSound(name, options = {}) {
        if (!this.isInitialized || this.settings.muted) return null;
        
        const soundData = this.sounds.get(name);
        if (!soundData) {
            console.warn(`Sound not found: ${name}`);
            return null;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = soundData.buffer;
        
        // Create gain node for this sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = (options.volume || soundData.volume) * this.settings.sfxVolume;
        
        // Setup audio chain
        let outputNode = gainNode;
        
        // Spatial audio
        if (options.spatial && this.settings.spatialAudio) {
            const panner = this.createSpatialSource(options.position);
            source.connect(panner);
            panner.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        // Effects
        if (options.reverb && this.settings.reverb) {
            const reverbGain = this.audioContext.createGain();
            reverbGain.gain.value = 0.3;
            gainNode.connect(reverbGain);
            reverbGain.connect(this.effects.reverb);
            this.effects.reverb.connect(this.sfxGain);
        }
        
        gainNode.connect(this.sfxGain);
        
        // Configure source
        source.loop = options.loop || soundData.loop;
        source.playbackRate.value = options.playbackRate || 1.0;
        
        // Start playback
        const startTime = this.audioContext.currentTime + (options.delay || 0);
        source.start(startTime);
        
        // Store reference
        const soundId = Date.now() + Math.random();
        this.activeSounds.set(soundId, {
            source,
            gainNode,
            name,
            startTime
        });
        
        // Auto-cleanup
        source.onended = () => {
            this.activeSounds.delete(soundId);
        };
        
        return soundId;
    }
    
    playMusic(name, options = {}) {
        if (!this.isInitialized) return null;
        
        // Stop current music
        if (this.currentMusic) {
            this.stopMusic();
        }
        
        const musicData = this.music.get(name);
        if (!musicData) {
            console.warn(`Music not found: ${name}`);
            return null;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = musicData.buffer;
        source.loop = options.loop !== false; // Default to loop
        
        // Create gain node
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = (options.volume || musicData.volume) * this.settings.musicVolume;
        
        // Fade in
        if (options.fadeIn) {
            gainNode.gain.value = 0;
            gainNode.gain.linearRampToValueAtTime(
                (options.volume || musicData.volume) * this.settings.musicVolume,
                this.audioContext.currentTime + options.fadeIn
            );
        }
        
        // Connect audio chain
        source.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Start playback
        source.start();
        
        this.currentMusic = {
            source,
            gainNode,
            name
        };
        
        return this.currentMusic;
    }
    
    stopMusic(fadeOut = 0) {
        if (!this.currentMusic) return;
        
        if (fadeOut > 0) {
            this.currentMusic.gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + fadeOut
            );
            
            setTimeout(() => {
                if (this.currentMusic) {
                    this.currentMusic.source.stop();
                    this.currentMusic = null;
                }
            }, fadeOut * 1000);
        } else {
            this.currentMusic.source.stop();
            this.currentMusic = null;
        }
    }
    
    stopSound(soundId) {
        const sound = this.activeSounds.get(soundId);
        if (sound) {
            sound.source.stop();
            this.activeSounds.delete(soundId);
        }
    }
    
    stopAllSounds() {
        for (let [id, sound] of this.activeSounds) {
            sound.source.stop();
        }
        this.activeSounds.clear();
    }
    
    createSpatialSource(position) {
        if (!this.listener) return null;
        
        const panner = this.audioContext.createPanner();
        
        // Configure panner
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 1000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set position
        if (position) {
            this.setSpatialPosition(panner, position.x, position.y, position.z || 0);
        }
        
        return panner;
    }
    
    setSpatialPosition(panner, x, y, z = 0) {
        if (panner.positionX) {
            panner.positionX.value = x;
            panner.positionY.value = y;
            panner.positionZ.value = z;
        } else {
            panner.setPosition(x, y, z);
        }
    }
    
    updateListenerPosition(x, y, z = 0) {
        if (!this.listener) return;
        
        if (this.listener.positionX) {
            this.listener.positionX.value = x;
            this.listener.positionY.value = y;
            this.listener.positionZ.value = z;
        } else {
            this.listener.setPosition(x, y, z);
        }
    }
    
    updateListenerOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ) {
        if (!this.listener) return;
        
        if (this.listener.forwardX) {
            this.listener.forwardX.value = forwardX;
            this.listener.forwardY.value = forwardY;
            this.listener.forwardZ.value = forwardZ;
            this.listener.upX.value = upX;
            this.listener.upY.value = upY;
            this.listener.upZ.value = upZ;
        } else {
            this.listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
        }
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.masterVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.settings.musicVolume;
        }
    }
    
    setSfxVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.settings.sfxVolume;
        }
    }
    
    setVoiceVolume(volume) {
        this.settings.voiceVolume = Math.max(0, Math.min(1, volume));
        if (this.voiceGain) {
            this.voiceGain.gain.value = this.settings.voiceVolume;
        }
    }
    
    mute() {
        this.settings.muted = true;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
    }
    
    unmute() {
        this.settings.muted = false;
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.masterVolume;
        }
    }
    
    toggleMute() {
        if (this.settings.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    
    // Audio effects
    setReverbLevel(level) {
        // Implementation would adjust reverb send level
    }
    
    setLowPassFilter(frequency) {
        if (this.effects.lowpass) {
            this.effects.lowpass.frequency.value = frequency;
        }
    }
    
    setHighPassFilter(frequency) {
        if (this.effects.highpass) {
            this.effects.highpass.frequency.value = frequency;
        }
    }
    
    // Settings
    applySetting(key, value) {
        switch (key) {
            case 'masterVolume':
                this.setMasterVolume(value);
                break;
            case 'musicVolume':
                this.setMusicVolume(value);
                break;
            case 'sfxVolume':
                this.setSfxVolume(value);
                break;
            case 'voiceVolume':
                this.setVoiceVolume(value);
                break;
            case 'spatialAudio':
                this.settings.spatialAudio = value;
                break;
            case 'reverb':
                this.settings.reverb = value;
                break;
            case 'compression':
                this.settings.compression = value;
                this.updateCompressionChain();
                break;
        }
    }
    
    updateCompressionChain() {
        // Reconnect audio chain based on compression setting
        if (this.settings.compression && this.effects.compressor) {
            this.masterGain.disconnect();
            this.masterGain.connect(this.effects.compressor);
            this.effects.compressor.connect(this.audioContext.destination);
        } else {
            this.masterGain.disconnect();
            this.masterGain.connect(this.audioContext.destination);
        }
    }
    
    // Utility methods
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
    }
    
    getAudioContext() {
        return this.audioContext;
    }
    
    isPlaying(name) {
        for (let [id, sound] of this.activeSounds) {
            if (sound.name === name) {
                return true;
            }
        }
        return false;
    }
    
    getCurrentMusic() {
        return this.currentMusic ? this.currentMusic.name : null;
    }
    
    getActiveSoundCount() {
        return this.activeSounds.size;
    }
    
    // Update method for engine integration
    update(deltaTime) {
        // Update spatial audio positions
        this.updateSpatialAudio();
        
        // Clean up finished sounds
        this.cleanupFinishedSounds();
        
        // Update audio effects based on game state
        this.updateAudioEffects(deltaTime);
    }
    
    updateSpatialAudio() {
        if (!this.settings.spatialAudio || !this.listener) return;
        
        // Update listener position based on camera/player position
        // This would be updated by the game engine with actual player position
        for (let [id, source] of this.spatialSources) {
            if (source.position && source.panner) {
                source.panner.positionX.value = source.position.x;
                source.panner.positionY.value = source.position.y;
                source.panner.positionZ.value = source.position.z || 0;
            }
        }
    }
    
    cleanupFinishedSounds() {
        // Remove finished sounds from active sounds map
        for (let [id, sound] of this.activeSounds) {
            if (sound.source.playbackState === 'finished') {
                this.activeSounds.delete(id);
            }
        }
    }
    
    updateAudioEffects(deltaTime) {
        // Update dynamic audio effects based on game state
        // This could include things like:
        // - Distance-based filtering
        // - Environmental reverb
        // - Dynamic range compression
        
        // Example: Update low-pass filter based on distance or game state
        if (this.effects.lowpass && this.engine) {
            // This would be updated based on actual game state
            const gameState = this.engine.gameState;
            if (gameState && gameState.currentScreen === 'game') {
                // Normal gameplay - full frequency range
                this.effects.lowpass.frequency.value = 20000;
            }
        }
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            activeSounds: this.activeSounds.size,
            currentMusic: this.currentMusic ? this.currentMusic.name : 'none',
            masterVolume: this.settings.masterVolume,
            muted: this.settings.muted
        };
    }
    
    // Cleanup
    destroy() {
        // Stop all sounds
        this.stopAllSounds();
        this.stopMusic();
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Clear references
        this.sounds.clear();
        this.music.clear();
        this.activeSounds.clear();
        this.spatialSources.clear();
        
        console.log('🔊 Audio system destroyed');
    }
}

// Export for use in other modules
window.AmongUsV3Audio = AmongUsV3Audio;