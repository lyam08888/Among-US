class WireMinigame {
    constructor(taskSystem) {
        this.taskSystem = taskSystem;
        this.wires = [];
        this.difficulty = 1;
        this.isComplete = false;
        this.timeLimit = 30000; // 30 secondes
        this.remainingTime = this.timeLimit;
    }

    initialize(difficulty) {
        this.difficulty = difficulty;
        this.wires = this.generateWires();
        this.remainingTime = this.timeLimit;
        this.isComplete = false;
    }

    generateWires() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        const wires = [];
        const numWires = Math.min(3 + this.difficulty, 6);

        for (let i = 0; i < numWires; i++) {
            wires.push({
                id: i,
                color: colors[i % colors.length],
                startPos: { x: 50, y: 100 + i * 80 },
                endPos: { x: 450, y: 100 + Math.floor(Math.random() * numWires) * 80 },
                isConnected: false
            });
        }

        return wires;
    }

    handleInput(event) {
        // Logique de gestion des entrées
    }

    update(deltaTime) {
        this.remainingTime -= deltaTime;
        if (this.remainingTime <= 0) {
            this.fail("Time's up!");
            return;
        }

        // Vérifier la complétion
        this.isComplete = this.wires.every(wire => wire.isConnected);
    }

    render(ctx) {
        // Dessiner le fond
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 500, 600);

        // Dessiner les fils
        this.wires.forEach(wire => {
            ctx.strokeStyle = wire.color;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(wire.startPos.x, wire.startPos.y);
            if (wire.isConnected) {
                ctx.lineTo(wire.endPos.x, wire.endPos.y);
            }
            ctx.stroke();

            // Dessiner les points de connexion
            ctx.fillStyle = wire.color;
            ctx.beginPath();
            ctx.arc(wire.startPos.x, wire.startPos.y, 12, 0, Math.PI * 2);
            ctx.arc(wire.endPos.x, wire.endPos.y, 12, 0, Math.PI * 2);
            ctx.fill();
        });

        // Dessiner la barre de temps
        const timeBarWidth = 400;
        const timeBarHeight = 20;
        const timeRatio = this.remainingTime / this.timeLimit;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(50, 20, timeBarWidth, timeBarHeight);
        ctx.fillStyle = timeRatio > 0.3 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(50, 20, timeBarWidth * timeRatio, timeBarHeight);
    }
}

class CardSwipeMinigame {
    constructor(taskSystem) {
        this.taskSystem = taskSystem;
        this.card = {
            x: 100,
            y: 300,
            width: 200,
            height: 120,
            isDragging: false
        };
        this.reader = {
            x: 250,
            y: 300,
            width: 300,
            height: 40
        };
        this.swipeSpeed = 0;
        this.lastPos = 0;
        this.success = false;
    }

    initialize(difficulty) {
        this.difficulty = difficulty;
        this.success = false;
        this.card.x = 100;
        this.swipeSpeed = 0;
        
        // Ajuster la difficulté
        this.speedThreshold = {
            min: 0.3 + (difficulty * 0.1),
            max: 2.0 - (difficulty * 0.1)
        };
    }

    handleInput(event) {
        const mousePos = this.getMousePos(event);

        switch(event.type) {
            case 'mousedown':
                if (this.isOverCard(mousePos)) {
                    this.card.isDragging = true;
                    this.lastPos = mousePos.x;
                }
                break;
                
            case 'mousemove':
                if (this.card.isDragging) {
                    this.card.x = mousePos.x - this.card.width / 2;
                    this.swipeSpeed = (mousePos.x - this.lastPos) / 16.67; // 60 FPS
                    this.lastPos = mousePos.x;
                }
                break;
                
            case 'mouseup':
                if (this.card.isDragging) {
                    this.card.isDragging = false;
                    if (this.isCardInReader() && 
                        this.swipeSpeed >= this.speedThreshold.min && 
                        this.swipeSpeed <= this.speedThreshold.max) {
                        this.success = true;
                    } else {
                        this.card.x = 100; // Reset position
                        this.taskSystem.engine.audio.playSound('error');
                    }
                }
                break;
        }
    }

    update(deltaTime) {
        if (!this.card.isDragging && !this.success) {
            // Animation de retour
            const targetX = 100;
            this.card.x += (targetX - this.card.x) * 0.2;
        }
    }

    render(ctx) {
        // Fond
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, 800, 600);

        // Lecteur de carte
        ctx.fillStyle = '#34495e';
        ctx.fillRect(this.reader.x, this.reader.y, 
                    this.reader.width, this.reader.height);

        // Carte
        ctx.fillStyle = this.success ? '#27ae60' : '#ecf0f1';
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.card.x, this.card.y, 
                     this.card.width, this.card.height, 10);
        ctx.fill();
        ctx.stroke();

        // Bande magnétique
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.card.x + 20, this.card.y + 20, 
                    this.card.width - 40, 30);

        // Texte d'instruction
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.success ? 'Card Accepted!' : 'Swipe Card', 
                    400, 200);
    }

    isOverCard(pos) {
        return pos.x >= this.card.x && 
               pos.x <= this.card.x + this.card.width &&
               pos.y >= this.card.y && 
               pos.y <= this.card.y + this.card.height;
    }

    isCardInReader() {
        return this.card.x + this.card.width >= this.reader.x &&
               this.card.x <= this.reader.x + this.reader.width;
    }

    getMousePos(event) {
        const rect = this.taskSystem.engine.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}
