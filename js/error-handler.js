// Among Us V3 - Error Handler
// Simple error handling system

// Global error handler object
window.wr = {
    error: function(message, error) {
        console.error('❌', message, error);
        
        // Optional: Send error to analytics or logging service
        // this.logError(message, error);
        
        // Optional: Show user-friendly error message
        this.showUserError(message);
    },
    
    warn: function(message, details) {
        console.warn('⚠️', message, details);
    },
    
    info: function(message, details) {
        console.info('ℹ️', message, details);
    },
    
    showUserError: function(message) {
        // Only show critical errors to users
        if (message.includes('Failed to initialize')) {
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.textContent = 'Erreur de chargement du système audio';
                loadingText.style.color = '#ff6b6b';
            }
        }
    },
    
    logError: function(message, error) {
        // Here you could send errors to a logging service
        // For now, we'll just store them locally for debugging
        if (!window.errorLog) {
            window.errorLog = [];
        }
        
        window.errorLog.push({
            timestamp: new Date().toISOString(),
            message: message,
            error: error ? error.toString() : null,
            stack: error ? error.stack : null,
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        // Keep only last 50 errors
        if (window.errorLog.length > 50) {
            window.errorLog = window.errorLog.slice(-50);
        }
    }
};

// Global error handlers
window.addEventListener('error', function(event) {
    wr.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    wr.error('Unhandled promise rejection:', event.reason);
});

console.log('🛡️ Error handler initialized');