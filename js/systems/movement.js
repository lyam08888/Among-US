class MovementSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.playerSpeed = 5;
        this.ventSpeed = 10;
        this.isVenting = false;
        this.lastPosition = { x: 0, y: 0 };
    }

    update(player, input) {
        if (this.isVenting) return this.handleVentMovement(player, input);
        return this.handleNormalMovement(player, input);
    }

    handleNormalMovement(player, input) {
        const newPosition = { ...player.position };
        const movement = { x: 0, y: 0 };

        // Calcul du mouvement basé sur l'input
        if (input.up) movement.y -= this.playerSpeed;
        if (input.down) movement.y += this.playerSpeed;
        if (input.left) movement.x -= this.playerSpeed;
        if (input.right) movement.x += this.playerSpeed;

        // Normalisation pour le mouvement diagonal
        if (movement.x !== 0 && movement.y !== 0) {
            const magnitude = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
            movement.x = (movement.x / magnitude) * this.playerSpeed;
            movement.y = (movement.y / magnitude) * this.playerSpeed;
        }

        newPosition.x += movement.x;
        newPosition.y += movement.y;

        // Vérification des collisions
        if (this.checkCollision(newPosition)) {
            return player.position;
        }

        // Mise à jour de la dernière position valide
        this.lastPosition = { ...player.position };
        return newPosition;
    }

    handleVentMovement(player, input) {
        // Logique spéciale pour le mouvement dans les vents
        // À implémenter selon les besoins
    }

    checkCollision(position) {
        // Vérification des limites de la map
        const currentRoom = this.gameState.getCurrentRoom();
        if (!currentRoom) return true;

        const bounds = currentRoom.dimensions;
        if (position.x < 0 || position.x > bounds.width ||
            position.y < 0 || position.y > bounds.height) {
            return true;
        }

        // Vérification des collisions avec les objets
        return this.checkObjectCollisions(position);
    }

    checkObjectCollisions(position) {
        const currentRoom = this.gameState.getCurrentRoom();
        if (!currentRoom.obstacles) return false;

        return currentRoom.obstacles.some(obstacle => {
            return this.isPointInObject(position, obstacle);
        });
    }

    isPointInObject(point, object) {
        return point.x >= object.x && point.x <= object.x + object.width &&
               point.y >= object.y && point.y <= object.y + object.height;
    }
}
