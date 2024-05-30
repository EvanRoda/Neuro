class TestBoxEntity extends Entity {
    static factory(count, bounds) {
        const entities = [];
        for (let i = 0; i < count; i++) {
            const entity = new TestBoxEntity();
            entity.getComponent(PositionComponent).set(new Vector2(
                Math.random() * bounds.x,
                Math.random() * bounds.y
            ));
            entities.push(entity);
        }
        return entities;
    }

    constructor() {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent);

        this.initSprite();
        this.getComponent(PositionComponent);
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(10, 10);
        sprite.setLayer(StartScene.OBJECT_LAYER);
        const ctx = sprite.getContext();

        ctx.fillStyle = 'black';
        ctx.strokeWidth = 3;
        ctx.strokeRect(0, 0, 10, 10);
    }
}