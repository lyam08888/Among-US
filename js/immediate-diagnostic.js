// Diagnostic immédiat - placé en début de page
console.log('🚨 IMMEDIATE DIAGNOSTIC STARTING...');

// Diagnostic au chargement DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 DOM LOADED - DIAGNOSING...');
    
    // Force canvas visibility immediately
    setTimeout(() => {
        console.log('🔧 FORCING CANVAS VISIBILITY...');
        
        const canvas = document.getElementById('game-canvas') || document.querySelector('canvas');
        if (canvas) {
            console.log('✅ Canvas found:', canvas);
            
            // Force all styles
            canvas.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: #001122 !important;
                z-index: 9999 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            
            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Immediate test render
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear and draw test pattern
                ctx.fillStyle = '#001122';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Big red rectangle
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(100, 100, 400, 300);
                
                // White text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('AMONG US V4', canvas.width / 2, canvas.height / 2);
                ctx.fillText('CANVAS ACTIVE', canvas.width / 2, canvas.height / 2 + 60);
                
                console.log('✅ TEST PATTERN DRAWN');
            }
        } else {
            console.error('❌ NO CANVAS FOUND!');
            
            // Create emergency canvas
            const emergencyCanvas = document.createElement('canvas');
            emergencyCanvas.id = 'emergency-canvas';
            emergencyCanvas.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: #220000 !important;
                z-index: 10000 !important;
                display: block !important;
            `;
            emergencyCanvas.width = window.innerWidth;
            emergencyCanvas.height = window.innerHeight;
            
            document.body.appendChild(emergencyCanvas);
            
            const ctx = emergencyCanvas.getContext('2d');
            ctx.fillStyle = '#220000';
            ctx.fillRect(0, 0, emergencyCanvas.width, emergencyCanvas.height);
            
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('EMERGENCY CANVAS', emergencyCanvas.width / 2, emergencyCanvas.height / 2);
            ctx.fillText('Among Us V4 - Debug Mode', emergencyCanvas.width / 2, emergencyCanvas.height / 2 + 50);
            
            console.log('🚨 EMERGENCY CANVAS CREATED');
        }
    }, 100);
});

// Diagnostic immédiat même avant DOM
(function immediateCheck() {
    console.log('🚨 IMMEDIATE CHECK - Page loading...');
    
    // Check every 100ms for canvas
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`🔍 Attempt ${attempts} - Looking for canvas...`);
        
        const canvas = document.querySelector('canvas');
        if (canvas) {
            console.log('✅ Canvas found early!', canvas);
            clearInterval(checkInterval);
            
            // Force early render
            try {
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
                canvas.style.zIndex = '9999';
                canvas.width = window.innerWidth || 1024;
                canvas.height = window.innerHeight || 768;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#000044';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '32px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('EARLY CANVAS RENDER', canvas.width / 2, canvas.height / 2);
                }
            } catch (error) {
                console.error('❌ Early render failed:', error);
            }
        }
        
        if (attempts > 50) { // Stop after 5 seconds
            clearInterval(checkInterval);
            console.log('⏰ Stopped early checking after 5 seconds');
        }
    }, 100);
})();
