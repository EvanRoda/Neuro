class Obstacle extends Entity {
    constructor(x, y) {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(ColliderComponent);

        this.initPosition(x, y);
        this.initSprite();
        this.initCollider();
    }

    initPosition(x, y) {
        const position = this.getComponent(PositionComponent);
        position.x = x;
        position.y = y;
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(32, 32);
        sprite.setPivot(16, 16);
        const ctx = sprite.getContext();
        ctx.fillStyle = '#625757';
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, 2 * Math.PI);
        ctx.fill();
    }

    initCollider() {
        const collider = this.getComponent(ColliderComponent);
        collider.radius = 14;
        collider.onCollision = (entity) => {
            // console.log("Target", entity, "Bullet", this);
            if (entity instanceof Bullet) {
                entity.mustRemove = true;
            }
        }
    }
}