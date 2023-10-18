class Bullet extends Entity {

    parent;
    constructor(parent, x, y, direction) {
        super();
        this.parent = parent;

        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(ColliderComponent);

        this.initPosition(x, y, direction);
        this.initSprite();
        this.initCollider();
    }

    evaluate(frameTime) {
        this.move(frameTime);
    }

    initPosition(x, y, direction) {
        const position = this.getComponent(PositionComponent);
        position.x = x;
        position.y = y;
        position.direction = direction;
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(3, 4);
        sprite.setPivot(1.5, 2);
        const ctx = sprite.getContext();

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(1, 0);
        ctx.lineTo(2, 1);
        ctx.lineTo(2, 3);
        ctx.lineTo(0, 3);
        ctx.lineTo(0, 1);
        ctx.stroke();
    }

    initCollider() {
        const collider = this.getComponent(ColliderComponent);
        collider.radius = 2;
        collider.onCollision = (entity) => {
            // console.log("Target", entity, "Bullet", this);
            if (entity instanceof Bot) {
                entity.mustRemove = true;
                this.mustRemove = true;
                const learn = this.parent.getComponent(LearningComponent);
                if (this.parent.getComponent(FriendFoeComponent).isFriend(entity.getComponent(FriendFoeComponent))) {
                    learn.shot_friend();
                } else {
                    learn.shot_foe();
                }
            }
        }
    }

    move(frameTime) {
        const position = this.getComponent(PositionComponent);
        const shift = MAX_BULLET_SPEED * frameTime / 1000;

        const x = Math.cos(position.direction) * shift;
        const y = Math.sin(position.direction) * shift;

        position.x += x;
        position.y += y;
        if (position.x < 0 || position.x > WIDTH || position.y < 0 || position.y > HEIGHT) this.mustRemove = true;
    }
}