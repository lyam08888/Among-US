// Among Us V3 - Physics Engine
class AmongUsV3Physics {
    constructor(engine) {
        this.engine = engine;
        this.gravity = { x: 0, y: 0 }; // No gravity in space
        this.friction = 0.95;
        this.airResistance = 0.99;
        
        // Collision detection
        this.collisionBodies = new Map();
        this.staticBodies = new Map();
        this.triggers = new Map();
        
        // Spatial partitioning for optimization
        this.spatialGrid = null; // Will be initialized later
        
        // Physics settings
        this.settings = {
            maxVelocity: 500,
            minVelocity: 0.1,
            collisionIterations: 3,
            enableSpatialPartitioning: true,
            enableContinuousCollision: true,
            enablePredictiveCollision: true,
            enableDynamicFriction: true,
            particleSimulation: true,
            weatherEffects: true
        };
        
        // Advanced movement
        this.movementSystem = {
            acceleration: 2000,
            deceleration: 1500,
            turnSpeed: Math.PI,
            slideThreshold: 0.7,
            dashForce: 1000,
            dashCooldown: 2000,
            ventSpeed: 300
        };
        
        // Environmental effects
        this.environment = {
            snowAccumulation: 0,
            windForce: { x: 0, y: 0 },
            fogDensity: 0,
            temperature: 20,
            surfaces: new Map() // Different surface types affecting movement
        };
        
        // Initialize spatial grid after class definition is available
        this.initializeSpatialGrid();
        
        console.log('⚡ Physics engine initialized');
    }
    
    initializeSpatialGrid() {
        // This will be called after SpatialGrid class is defined
        try {
            this.spatialGrid = new SpatialGrid(100); // 100px grid cells
            console.log('✅ Spatial grid initialized');
        } catch (error) {
            console.error('❌ Failed to initialize spatial grid:', error);
            this.spatialGrid = null; // Fallback to no spatial partitioning
        }
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Update spatial grid
        if (this.settings.enableSpatialPartitioning) {
            this.updateSpatialGrid();
        }
        
        // Update physics bodies
        for (let [id, body] of this.collisionBodies) {
            this.updateBody(body, dt);
        }
        
        // Collision detection and resolution
        this.handleCollisions();
        
        // Update triggers
        this.handleTriggers();
    }
    
    updateBody(body, deltaTime) {
        if (!body.isActive || body.isStatic) return;
        
        // Apply forces
        body.velocity.x += body.force.x * body.invMass * deltaTime;
        body.velocity.y += body.force.y * body.invMass * deltaTime;
        
        // Apply gravity
        body.velocity.x += this.gravity.x * deltaTime;
        body.velocity.y += this.gravity.y * deltaTime;
        
        // Apply friction
        body.velocity.x *= Math.pow(this.friction, deltaTime);
        body.velocity.y *= Math.pow(this.friction, deltaTime);
        
        // Apply air resistance
        body.velocity.x *= Math.pow(this.airResistance, deltaTime);
        body.velocity.y *= Math.pow(this.airResistance, deltaTime);
        
        // Clamp velocity
        const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        if (speed > this.settings.maxVelocity) {
            const scale = this.settings.maxVelocity / speed;
            body.velocity.x *= scale;
            body.velocity.y *= scale;
        }
        
        // Stop very slow movement
        if (speed < this.settings.minVelocity) {
            body.velocity.x = 0;
            body.velocity.y = 0;
        }
        
        // Update position
        body.position.x += body.velocity.x * deltaTime;
        body.position.y += body.velocity.y * deltaTime;
        
        // Update bounding box
        this.updateBoundingBox(body);
        
        // Reset forces
        body.force.x = 0;
        body.force.y = 0;
    }
    
    updateBoundingBox(body) {
        switch (body.shape.type) {
            case 'circle':
                body.bounds = {
                    left: body.position.x - body.shape.radius,
                    right: body.position.x + body.shape.radius,
                    top: body.position.y - body.shape.radius,
                    bottom: body.position.y + body.shape.radius
                };
                break;
            case 'rectangle':
                body.bounds = {
                    left: body.position.x - body.shape.width / 2,
                    right: body.position.x + body.shape.width / 2,
                    top: body.position.y - body.shape.height / 2,
                    bottom: body.position.y + body.shape.height / 2
                };
                break;
            case 'polygon':
                this.updatePolygonBounds(body);
                break;
        }
    }
    
    updatePolygonBounds(body) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        for (let vertex of body.shape.vertices) {
            const x = body.position.x + vertex.x;
            const y = body.position.y + vertex.y;
            
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        
        body.bounds = {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY
        };
    }
    
    updateSpatialGrid() {
        if (!this.spatialGrid) {
            return; // Skip if spatial grid is not initialized
        }
        
        this.spatialGrid.clear();
        
        for (let [id, body] of this.collisionBodies) {
            if (body.isActive) {
                this.spatialGrid.insert(body);
            }
        }
    }
    
    handleCollisions() {
        const collisionPairs = this.getCollisionPairs();
        
        // Resolve collisions multiple times for stability
        for (let i = 0; i < this.settings.collisionIterations; i++) {
            for (let pair of collisionPairs) {
                this.resolveCollision(pair.bodyA, pair.bodyB);
            }
        }
    }
    
    getCollisionPairs() {
        const pairs = [];
        
        if (this.settings.enableSpatialPartitioning && this.spatialGrid) {
            // Use spatial grid for optimization
            const potentialPairs = this.spatialGrid.getPotentialCollisions();
            
            for (let pair of potentialPairs) {
                if (this.broadPhaseCollision(pair.bodyA, pair.bodyB)) {
                    pairs.push(pair);
                }
            }
        } else {
            // Brute force collision detection
            const bodies = Array.from(this.collisionBodies.values());
            
            for (let i = 0; i < bodies.length; i++) {
                for (let j = i + 1; j < bodies.length; j++) {
                    const bodyA = bodies[i];
                    const bodyB = bodies[j];
                    
                    if (bodyA.isActive && bodyB.isActive && 
                        this.broadPhaseCollision(bodyA, bodyB)) {
                        pairs.push({ bodyA, bodyB });
                    }
                }
            }
        }
        
        return pairs;
    }
    
    broadPhaseCollision(bodyA, bodyB) {
        // AABB collision check
        return !(bodyA.bounds.right < bodyB.bounds.left ||
                bodyA.bounds.left > bodyB.bounds.right ||
                bodyA.bounds.bottom < bodyB.bounds.top ||
                bodyA.bounds.top > bodyB.bounds.bottom);
    }
    
    resolveCollision(bodyA, bodyB) {
        const collision = this.detectCollision(bodyA, bodyB);
        if (!collision) return;
        
        // Separate bodies
        this.separateBodies(bodyA, bodyB, collision);
        
        // Resolve collision response
        this.resolveCollisionResponse(bodyA, bodyB, collision);
        
        // Emit collision event
        this.engine.emit('collision', {
            bodyA,
            bodyB,
            collision
        });
    }
    
    detectCollision(bodyA, bodyB) {
        // Circle-Circle collision
        if (bodyA.shape.type === 'circle' && bodyB.shape.type === 'circle') {
            return this.circleCircleCollision(bodyA, bodyB);
        }
        
        // Circle-Rectangle collision
        if ((bodyA.shape.type === 'circle' && bodyB.shape.type === 'rectangle') ||
            (bodyA.shape.type === 'rectangle' && bodyB.shape.type === 'circle')) {
            return this.circleRectangleCollision(bodyA, bodyB);
        }
        
        // Rectangle-Rectangle collision
        if (bodyA.shape.type === 'rectangle' && bodyB.shape.type === 'rectangle') {
            return this.rectangleRectangleCollision(bodyA, bodyB);
        }
        
        // Polygon collisions (SAT algorithm)
        return this.polygonCollision(bodyA, bodyB);
    }
    
    circleCircleCollision(bodyA, bodyB) {
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bodyA.shape.radius + bodyB.shape.radius;
        
        if (distance < minDistance) {
            const overlap = minDistance - distance;
            const normalX = dx / distance;
            const normalY = dy / distance;
            
            return {
                overlap,
                normal: { x: normalX, y: normalY },
                contactPoint: {
                    x: bodyA.position.x + normalX * bodyA.shape.radius,
                    y: bodyA.position.y + normalY * bodyA.shape.radius
                }
            };
        }
        
        return null;
    }
    
    circleRectangleCollision(bodyA, bodyB) {
        let circle, rectangle;
        
        if (bodyA.shape.type === 'circle') {
            circle = bodyA;
            rectangle = bodyB;
        } else {
            circle = bodyB;
            rectangle = bodyA;
        }
        
        // Find closest point on rectangle to circle center
        const closestX = Math.max(rectangle.bounds.left, 
                                Math.min(circle.position.x, rectangle.bounds.right));
        const closestY = Math.max(rectangle.bounds.top, 
                                Math.min(circle.position.y, rectangle.bounds.bottom));
        
        const dx = circle.position.x - closestX;
        const dy = circle.position.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.shape.radius) {
            const overlap = circle.shape.radius - distance;
            const normalX = dx / distance;
            const normalY = dy / distance;
            
            return {
                overlap,
                normal: { x: normalX, y: normalY },
                contactPoint: { x: closestX, y: closestY }
            };
        }
        
        return null;
    }
    
    rectangleRectangleCollision(bodyA, bodyB) {
        const overlapX = Math.min(bodyA.bounds.right, bodyB.bounds.right) - 
                        Math.max(bodyA.bounds.left, bodyB.bounds.left);
        const overlapY = Math.min(bodyA.bounds.bottom, bodyB.bounds.bottom) - 
                        Math.max(bodyA.bounds.top, bodyB.bounds.top);
        
        if (overlapX > 0 && overlapY > 0) {
            // Determine collision normal based on smallest overlap
            let normal, overlap;
            
            if (overlapX < overlapY) {
                overlap = overlapX;
                normal = {
                    x: bodyA.position.x < bodyB.position.x ? -1 : 1,
                    y: 0
                };
            } else {
                overlap = overlapY;
                normal = {
                    x: 0,
                    y: bodyA.position.y < bodyB.position.y ? -1 : 1
                };
            }
            
            return {
                overlap,
                normal,
                contactPoint: {
                    x: (Math.max(bodyA.bounds.left, bodyB.bounds.left) + 
                        Math.min(bodyA.bounds.right, bodyB.bounds.right)) / 2,
                    y: (Math.max(bodyA.bounds.top, bodyB.bounds.top) + 
                        Math.min(bodyA.bounds.bottom, bodyB.bounds.bottom)) / 2
                }
            };
        }
        
        return null;
    }
    
    polygonCollision(bodyA, bodyB) {
        // Simplified SAT (Separating Axis Theorem) implementation
        // For complex polygon collision detection
        // This is a placeholder - full SAT implementation would be more complex
        return null;
    }
    
    separateBodies(bodyA, bodyB, collision) {
        const totalMass = bodyA.mass + bodyB.mass;
        const separationA = (bodyB.mass / totalMass) * collision.overlap;
        const separationB = (bodyA.mass / totalMass) * collision.overlap;
        
        if (!bodyA.isStatic) {
            bodyA.position.x -= collision.normal.x * separationA;
            bodyA.position.y -= collision.normal.y * separationA;
        }
        
        if (!bodyB.isStatic) {
            bodyB.position.x += collision.normal.x * separationB;
            bodyB.position.y += collision.normal.y * separationB;
        }
    }
    
    resolveCollisionResponse(bodyA, bodyB, collision) {
        // Calculate relative velocity
        const relativeVelocityX = bodyB.velocity.x - bodyA.velocity.x;
        const relativeVelocityY = bodyB.velocity.y - bodyA.velocity.y;
        
        // Calculate relative velocity along collision normal
        const velocityAlongNormal = relativeVelocityX * collision.normal.x + 
                                   relativeVelocityY * collision.normal.y;
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate restitution (bounciness)
        const restitution = Math.min(bodyA.restitution, bodyB.restitution);
        
        // Calculate impulse scalar
        let impulse = -(1 + restitution) * velocityAlongNormal;
        impulse /= bodyA.invMass + bodyB.invMass;
        
        // Apply impulse
        const impulseX = impulse * collision.normal.x;
        const impulseY = impulse * collision.normal.y;
        
        if (!bodyA.isStatic) {
            bodyA.velocity.x -= impulseX * bodyA.invMass;
            bodyA.velocity.y -= impulseY * bodyA.invMass;
        }
        
        if (!bodyB.isStatic) {
            bodyB.velocity.x += impulseX * bodyB.invMass;
            bodyB.velocity.y += impulseY * bodyB.invMass;
        }
    }
    
    handleTriggers() {
        for (let [id, trigger] of this.triggers) {
            const bodiesInTrigger = this.getBodiesInTrigger(trigger);
            
            // Check for new entries
            for (let body of bodiesInTrigger) {
                if (!trigger.activeBodies.has(body.id)) {
                    trigger.activeBodies.add(body.id);
                    this.engine.emit('triggerEnter', { trigger, body });
                }
            }
            
            // Check for exits
            for (let bodyId of trigger.activeBodies) {
                const body = this.collisionBodies.get(bodyId);
                if (!body || !bodiesInTrigger.includes(body)) {
                    trigger.activeBodies.delete(bodyId);
                    this.engine.emit('triggerExit', { trigger, body });
                }
            }
        }
    }
    
    getBodiesInTrigger(trigger) {
        const bodiesInTrigger = [];
        
        for (let [id, body] of this.collisionBodies) {
            if (body.isActive && this.broadPhaseCollision(trigger, body)) {
                const collision = this.detectCollision(trigger, body);
                if (collision) {
                    bodiesInTrigger.push(body);
                }
            }
        }
        
        return bodiesInTrigger;
    }
    
    // Public API
    createBody(id, options = {}) {
        const body = {
            id,
            position: { x: options.x || 0, y: options.y || 0 },
            velocity: { x: 0, y: 0 },
            force: { x: 0, y: 0 },
            mass: options.mass || 1,
            invMass: options.mass ? 1 / options.mass : 0,
            restitution: options.restitution || 0.2,
            friction: options.friction || 0.3,
            isStatic: options.isStatic || false,
            isActive: true,
            shape: options.shape || { type: 'circle', radius: 10 },
            bounds: { left: 0, right: 0, top: 0, bottom: 0 },
            userData: options.userData || {}
        };
        
        this.updateBoundingBox(body);
        this.collisionBodies.set(id, body);
        
        return body;
    }
    
    createTrigger(id, options = {}) {
        const trigger = {
            id,
            position: { x: options.x || 0, y: options.y || 0 },
            shape: options.shape || { type: 'circle', radius: 10 },
            bounds: { left: 0, right: 0, top: 0, bottom: 0 },
            activeBodies: new Set(),
            userData: options.userData || {}
        };
        
        this.updateBoundingBox(trigger);
        this.triggers.set(id, trigger);
        
        return trigger;
    }
    
    removeBody(id) {
        this.collisionBodies.delete(id);
    }
    
    removeTrigger(id) {
        this.triggers.delete(id);
    }
    
    getBody(id) {
        return this.collisionBodies.get(id);
    }
    
    getTrigger(id) {
        return this.triggers.get(id);
    }
    
    applyForce(bodyId, forceX, forceY) {
        const body = this.collisionBodies.get(bodyId);
        if (body && !body.isStatic) {
            body.force.x += forceX;
            body.force.y += forceY;
        }
    }
    
    applyImpulse(bodyId, impulseX, impulseY) {
        const body = this.collisionBodies.get(bodyId);
        if (body && !body.isStatic) {
            body.velocity.x += impulseX * body.invMass;
            body.velocity.y += impulseY * body.invMass;
        }
    }
    
    setVelocity(bodyId, velocityX, velocityY) {
        const body = this.collisionBodies.get(bodyId);
        if (body && !body.isStatic) {
            body.velocity.x = velocityX;
            body.velocity.y = velocityY;
        }
    }
    
    setPosition(bodyId, x, y) {
        const body = this.collisionBodies.get(bodyId);
        if (body) {
            body.position.x = x;
            body.position.y = y;
            this.updateBoundingBox(body);
        }
    }
    
    raycast(startX, startY, endX, endY) {
        const results = [];
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return results;
        
        const dirX = dx / length;
        const dirY = dy / length;
        
        // Check intersection with all bodies
        for (let [id, body] of this.collisionBodies) {
            const intersection = this.rayBodyIntersection(
                startX, startY, dirX, dirY, length, body
            );
            
            if (intersection) {
                results.push({
                    body,
                    point: intersection.point,
                    distance: intersection.distance,
                    normal: intersection.normal
                });
            }
        }
        
        // Sort by distance
        results.sort((a, b) => a.distance - b.distance);
        
        return results;
    }
    
    rayBodyIntersection(startX, startY, dirX, dirY, maxDistance, body) {
        // Simplified ray-body intersection
        // Full implementation would handle different shape types
        if (body.shape.type === 'circle') {
            return this.rayCircleIntersection(startX, startY, dirX, dirY, maxDistance, body);
        }
        
        return null;
    }
    
    rayCircleIntersection(startX, startY, dirX, dirY, maxDistance, body) {
        const toCircleX = body.position.x - startX;
        const toCircleY = body.position.y - startY;
        
        const projectionLength = toCircleX * dirX + toCircleY * dirY;
        
        if (projectionLength < 0) return null;
        
        const closestX = startX + dirX * projectionLength;
        const closestY = startY + dirY * projectionLength;
        
        const distanceToCenter = Math.sqrt(
            (closestX - body.position.x) ** 2 + (closestY - body.position.y) ** 2
        );
        
        if (distanceToCenter > body.shape.radius) return null;
        
        const halfChord = Math.sqrt(body.shape.radius ** 2 - distanceToCenter ** 2);
        const intersectionDistance = projectionLength - halfChord;
        
        if (intersectionDistance < 0 || intersectionDistance > maxDistance) return null;
        
        const intersectionX = startX + dirX * intersectionDistance;
        const intersectionY = startY + dirY * intersectionDistance;
        
        const normalX = (intersectionX - body.position.x) / body.shape.radius;
        const normalY = (intersectionY - body.position.y) / body.shape.radius;
        
        return {
            point: { x: intersectionX, y: intersectionY },
            distance: intersectionDistance,
            normal: { x: normalX, y: normalY }
        };
    }
    
    destroy() {
        this.collisionBodies.clear();
        this.staticBodies.clear();
        this.triggers.clear();
        
        if (this.spatialGrid) {
            this.spatialGrid.clear();
        }
        
        console.log('⚡ Physics engine destroyed');
    }
}

// Spatial Grid for collision optimization
class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }
    
    clear() {
        this.grid.clear();
    }
    
    getKey(x, y) {
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        return `${gridX},${gridY}`;
    }
    
    insert(body) {
        const minX = Math.floor(body.bounds.left / this.cellSize);
        const maxX = Math.floor(body.bounds.right / this.cellSize);
        const minY = Math.floor(body.bounds.top / this.cellSize);
        const maxY = Math.floor(body.bounds.bottom / this.cellSize);
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const key = `${x},${y}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(body);
            }
        }
    }
    
    getPotentialCollisions() {
        const pairs = [];
        const checked = new Set();
        
        for (let [key, bodies] of this.grid) {
            for (let i = 0; i < bodies.length; i++) {
                for (let j = i + 1; j < bodies.length; j++) {
                    const bodyA = bodies[i];
                    const bodyB = bodies[j];
                    const pairKey = `${Math.min(bodyA.id, bodyB.id)}-${Math.max(bodyA.id, bodyB.id)}`;
                    
                    if (!checked.has(pairKey)) {
                        checked.add(pairKey);
                        pairs.push({ bodyA, bodyB });
                    }
                }
            }
        }
        
        return pairs;
    }
}

// Export for use in other modules
window.AmongUsV3Physics = AmongUsV3Physics;