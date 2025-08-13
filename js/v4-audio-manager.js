/**
 * V4 Audio Manager - Robust audio loading with extension fallback
 * Handles cross-origin requests and credential mode issues
 */

class V4AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.loadedSounds = new Set();
        this.extensionFallbacks = ['.wav', '.mp3', '.ogg'];
        this.basePath = 'assets/sounds/';
        
        // Audio configuration
        this.config = {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            ambientVolume: 0.4
        };
    }

    /**
     * Initialize Web Audio API
     */
    async initializeAudio() {
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context if suspended (mobile browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('✅ Audio context initialized:', this.audioContext.state);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize audio context:', error);
            return false;
        }
    }

    /**
     * Resolve audio URL with extension fallback
     */
    async resolveAudioUrl(baseName) {
        for (const ext of this.extensionFallbacks) {
            const url = `${this.basePath}${baseName}${ext}`;
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    cache: 'no-store',
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (response.ok) {
                    console.log(`✅ Found audio file: ${url}`);
                    return url;
                }
            } catch (error) {
                console.warn(`❌ Audio file not found: ${url}`);
            }
        }
        
        console.error(`❌ No audio file found for: ${baseName}`);
        return null;
    }

    /**
     * Load audio with proper cross-origin handling
     */
    async loadSound(name) {
        if (this.loadedSounds.has(name)) {
            return this.audioBuffers.get(name);
        }

        const url = await this.resolveAudioUrl(name);
        if (!url) {
            console.warn(`❌ Skipping missing audio: ${name}`);
            return null;
        }

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${url}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            
            // Ensure audio context is initialized
            if (!this.audioContext) {
                await this.initializeAudio();
            }

            // Decode audio data with proper error handling
            const audioBuffer = await this.audioContext.decodeAudioData(
                arrayBuffer.slice(0) // Prevent detached buffer issues
            );
            
            this.audioBuffers.set(name, audioBuffer);
            this.loadedSounds.add(name);
            
            console.log(`✅ Loaded audio: ${name}`);
            return audioBuffer;
            
        } catch (error) {
            console.error(`❌ Failed to load audio ${name}:`, error);
            return null;
        }
    }

    /**
     * Load multiple sounds with progress tracking
     */
    async loadSounds(soundNames) {
        console.log(`🎵 Loading ${soundNames.length} audio files...`);
        
        const results = await Promise.allSettled(
            soundNames.map(name => this.loadSound(name))
        );
        
        const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ Loaded ${loaded}/${soundNames.length} audio files`);
        
        return results;
    }

    /**
     * Play sound effect
     */
    playSound(name, options = {}) {
        const buffer = this.audioBuffers.get(name);
        if (!buffer || !this.audioContext) {
            console.warn(`❌ Cannot play sound: ${name}`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Apply volume
        const volume = options.volume || this.config.sfxVolume;
        gainNode.gain.value = volume * this.config.masterVolume;
        
        // Start playback
        source.start(this.audioContext.currentTime);
        
        return { source, gainNode };
    }

    /**
     * Play ambient sound loop
     */
    playAmbient(name, options = {}) {
        const buffer = this.audioBuffers.get(name);
        if (!buffer || !this.audioContext) {
            console.warn(`❌ Cannot play ambient: ${name}`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Apply volume
        const volume = options.volume || this.config.ambientVolume;
        gainNode.gain.value = volume * this.config.masterVolume;
        
        // Start playback
        source.start(this.audioContext.currentTime);
        
        return { source, gainNode };
    }

    /**
     * Update volume settings
     */
    updateVolume(type, value) {
        this.config[type] = value;
        console.log(`🔊 Updated ${type} volume: ${value}`);
    }

    /**
     * Get all loaded sounds
     */
    getLoadedSounds() {
        return Array.from(this.loadedSounds);
    }

    /**
     * Preload critical sounds
     */
    async preloadCriticalSounds() {
        const criticalSounds = [
            'ambient',
            'button-click',
            'footstep',
            'kill',
            'task-complete',
            'victory',
            'defeat',
            'emergency',
            'vent',
            'door-open',
            'door-close'
        ];

        return await this.loadSounds(criticalSounds);
    }
}

// Create global instance
window.v4AudioManager = new V4AudioManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = V4AudioManager;
}
