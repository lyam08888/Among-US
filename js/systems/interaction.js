class InteractionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.interactionRange = 50; // Distance en pixels pour l'interaction
        this.currentInteractable = null;
        this.killCooldown = 45000; // 45 secondes
        this.lastKillTime = 0;
        this.ventCooldown = 20000; // 20 secondes
        this.lastVentTime = 0;
    }

    update(player) {
        if (!player) return;
        
        // Trouve l'objet interactif le plus proche
        this.currentInteractable = this.findNearestInteractable(player.position);
        
        // Met à jour l'interface utilisateur pour montrer l'interaction possible
        if (this.currentInteractable) {
            this.showInteractionPrompt(this.currentInteractable.type);
        } else {
            this.hideInteractionPrompt();
        }
    }

    interact(player) {
        if (!this.currentInteractable || !player) return false;

        switch (this.currentInteractable.type) {
            case 'task':
                return this.handleTaskInteraction(player, this.currentInteractable);
            case 'vent':
                return this.handleVentInteraction(player, this.currentInteractable);
            case 'emergencyButton':
                return this.handleEmergencyInteraction(player);
            case 'reportButton':
                return this.handleReportInteraction(player);
            case 'killButton':
                return this.handleKillInteraction(player);
            default:
                return false;
        }
    }

    findNearestInteractable(position) {
        const currentRoom = this.gameState.getCurrentRoom();
        if (!currentRoom || !currentRoom.interactables) return null;

        let nearest = null;
        let minDistance = this.interactionRange;

        currentRoom.interactables.forEach(interactable => {
            const distance = this.calculateDistance(position, interactable);
            if (distance < minDistance && this.canInteractWith(interactable)) {
                minDistance = distance;
                nearest = interactable;
            }
        });

        return nearest;
    }

    handleTaskInteraction(player, task) {
        if (!player.tasks.includes(task.id)) return false;
        
        // Vérifie si la tâche peut être effectuée
        if (task.requirements && !this.meetRequirements(player, task.requirements)) {
            return false;
        }

        // Lance l'animation ou le mini-jeu de la tâche
        this.gameState.startTask(task.id);
        return true;
    }

    handleVentInteraction(player, vent) {
        if (!player.isImpostor) return false;
        
        const currentTime = Date.now();
        if (currentTime - this.lastVentTime < this.ventCooldown) {
            return false;
        }

        this.lastVentTime = currentTime;
        this.gameState.enterVent(vent.id);
        return true;
    }

    handleKillInteraction(player) {
        if (!player.isImpostor) return false;

        const currentTime = Date.now();
        if (currentTime - this.lastKillTime < this.killCooldown) {
            return false;
        }

        const target = this.findNearestPlayer(player.position);
        if (!target || target.isImpostor) return false;

        this.lastKillTime = currentTime;
        this.gameState.killPlayer(target.id);
        return true;
    }

    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    canInteractWith(interactable) {
        // Vérifie si l'interaction est possible selon le type de joueur et l'état du jeu
        const player = this.gameState.getLocalPlayer();
        
        switch (interactable.type) {
            case 'vent':
                return player.isImpostor;
            case 'emergencyButton':
                return !this.gameState.isEmergencyButtonDisabled;
            case 'killButton':
                return player.isImpostor && !this.isKillOnCooldown();
            default:
                return true;
        }
    }

    isKillOnCooldown() {
        return Date.now() - this.lastKillTime < this.killCooldown;
    }

    showInteractionPrompt(type) {
        // Affiche l'indicateur d'interaction approprié
        this.gameState.ui.showInteractionPrompt(type);
    }

    hideInteractionPrompt() {
        // Cache l'indicateur d'interaction
        this.gameState.ui.hideInteractionPrompt();
    }
}
