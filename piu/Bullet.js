class Bullet extends Entity {

    constructor() {
        super();
        this.addComponent(new PositionComponent(this))
            .addComponent(new SpriteComponent(this, 3, 4))
            .addComponent(new CircleColliderComponent(this, 2));

        this.createSprite();
    }

    evaluate(frameTime) {
        this.move(frameTime);
    }

    createSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.pivot = { x: 1.5, y: 2 };
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

    move(frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = MAX_SPEED * frameTime / 1000;

        const x = Math.cos(position.direction) * shift;
        const y = Math.sin(position.direction) * shift;

        position.x += x;
        position.y += y;
        if (position.x < 0 || position.x > WIDTH || position.y < 0 || position.y > HEIGHT) this.mustRemove = true;
    }
}