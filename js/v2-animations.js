// Among Us V2 - Animations Manager
class AmongUsV2Animations {
    constructor() {
        this.activeAnimations = new Map();
        this.observers = new Map();
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scroll-fade-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
        }
    }
    
    initBackgroundAnimations() {
        this.createStars();
        this.createFloatingParticles();
        this.animatePlanets();
    }
    
    createStars() {
        const starsContainer = document.querySelector('.stars');
        if (!starsContainer) return;
        
        // Stars are created via CSS, but we can add dynamic twinkling
        const twinkleInterval = setInterval(() => {
            if (!document.querySelector('.stars')) {
                clearInterval(twinkleInterval);
                return;
            }
            
            // Random twinkle effect
            const opacity = 0.3 + Math.random() * 0.7;
            starsContainer.style.opacity = opacity;
        }, 2000 + Math.random() * 3000);
    }
    
    createFloatingParticles() {
        const container = document.querySelector('.space-background');
        if (!container) return;
        
        // Create floating particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            container.appendChild(particle);
        }
    }
    
    animatePlanets() {
        const planets = document.querySelectorAll('.planet');
        planets.forEach((planet, index) => {
            const duration = 8 + index * 2;
            const delay = index * 1;
            planet.style.animationDuration = duration + 's';
            planet.style.animationDelay = delay + 's';
        });
    }
    
    addStaggerAnimation(selector, delay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.classList.add('stagger-item');
            element.style.animationDelay = (index * delay) + 'ms';
        });
    }
    
    addScreenEntranceAnimation(screen) {
        screen.classList.add('screen-enter');
        
        // Remove class after animation
        setTimeout(() => {
            screen.classList.remove('screen-enter');
        }, 300);
    }
    
    addButtonPressEffect(button) {
        button.classList.add('button-ripple');
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // Add press animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    addSelectionEffect(element) {
        element.classList.add('success-pulse');
        
        setTimeout(() => {
            element.classList.remove('success-pulse');
        }, 600);
    }
    
    addErrorShake(element) {
        element.classList.add('error-shake');
        
        setTimeout(() => {
            element.classList.remove('error-shake');
        }, 300);
    }
    
    addSliderFeedback(slider) {
        const thumb = slider;
        thumb.style.transform = 'scale(1.2)';
        thumb.style.boxShadow = '0 0 20px rgba(0, 210, 211, 0.8)';
        
        setTimeout(() => {
            thumb.style.transform = '';
            thumb.style.boxShadow = '';
        }, 200);
    }
    
    addSpinAnimation(element) {
        element.classList.add('loading-spinner');
        
        setTimeout(() => {
            element.classList.remove('loading-spinner');
        }, 1000);
    }
    
    startProgressAnimation() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.offsetHeight; // Trigger reflow
            progressBar.style.animation = 'progressFill 30s linear forwards';
        }
    }
    
    stopProgressAnimation() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.animation = 'none';
        }
    }
    
    startLoadingAnimation() {
        const crewmate = document.querySelector('.loading-crewmate');
        if (crewmate) {
            crewmate.classList.add('loading-anim');
        }
    }
    
    stopLoadingAnimation() {
        const crewmate = document.querySelector('.loading-crewmate');
        if (crewmate) {
            crewmate.classList.remove('loading-anim');
        }
    }
    
    addHoverEffect(element) {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-2px)';
            element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
            element.style.boxShadow = '';
        });
    }
    
    addGlowEffect(element, color = 'rgba(0, 210, 211, 0.5)') {
        element.style.boxShadow = `0 0 20px ${color}`;
        
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 2000);
    }
    
    addTypewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        element.classList.add('typewriter');
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                element.classList.remove('typewriter');
            }
        }, speed);
    }
    
    addCountUpAnimation(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const startValue = start;
        const endValue = end;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    addShimmerEffect(element) {
        element.classList.add('shimmer');
        
        setTimeout(() => {
            element.classList.remove('shimmer');
        }, 2000);
    }
    
    addFloatAnimation(element, duration = 3000) {
        const startY = element.offsetTop;
        const amplitude = 10;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = (elapsed % duration) / duration;
            const y = Math.sin(progress * Math.PI * 2) * amplitude;
            
            element.style.transform = `translateY(${y}px)`;
            
            if (this.activeAnimations.has(element)) {
                requestAnimationFrame(animate);
            }
        };
        
        this.activeAnimations.set(element, true);
        requestAnimationFrame(animate);
    }
    
    stopFloatAnimation(element) {
        this.activeAnimations.delete(element);
        element.style.transform = '';
    }
    
    addPulseAnimation(element, color = 'rgba(0, 210, 211, 0.5)') {
        const pulseKeyframes = [
            { boxShadow: `0 0 0 0 ${color}` },
            { boxShadow: `0 0 0 10px rgba(0, 210, 211, 0)` }
        ];
        
        const pulseAnimation = element.animate(pulseKeyframes, {
            duration: 1000,
            iterations: 3,
            easing: 'ease-out'
        });
        
        return pulseAnimation;
    }
    
    addSlideInAnimation(element, direction = 'right') {
        const directions = {
            right: 'slideInFromRight',
            left: 'slideInFromLeft',
            top: 'slideInFromTop',
            bottom: 'slideInFromBottom'
        };
        
        element.classList.add(directions[direction] || directions.right);
        
        setTimeout(() => {
            element.classList.remove(directions[direction] || directions.right);
        }, 600);
    }
    
    addBounceAnimation(element) {
        element.classList.add('hover-bounce');
        
        setTimeout(() => {
            element.classList.remove('hover-bounce');
        }, 600);
    }
    
    addWobbleAnimation(element) {
        element.classList.add('wobble');
        
        setTimeout(() => {
            element.classList.remove('wobble');
        }, 1000);
    }
    
    observeElement(element) {
        if (this.scrollObserver) {
            this.scrollObserver.observe(element);
        }
    }
    
    unobserveElement(element) {
        if (this.scrollObserver) {
            this.scrollObserver.unobserve(element);
        }
    }
    
    // Utility method to create custom animations
    createCustomAnimation(element, keyframes, options = {}) {
        const defaultOptions = {
            duration: 1000,
            easing: 'ease',
            fill: 'forwards'
        };
        
        const animationOptions = { ...defaultOptions, ...options };
        return element.animate(keyframes, animationOptions);
    }
    
    // Method to handle reduced motion preferences
    respectsReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Safe animation method that respects user preferences
    safeAnimate(element, animationFunction) {
        if (!this.respectsReducedMotion()) {
            animationFunction();
        }
    }
    
    // Cleanup method
    cleanup() {
        // Stop all active animations
        this.activeAnimations.clear();
        
        // Disconnect observers
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        
        // Remove particles
        document.querySelectorAll('.particle').forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmongUsV2Animations;
}