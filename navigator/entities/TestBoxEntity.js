class TestBoxEntity extends Entity {
    static W = 20;
    static H = 20;

    static factory(count, bounds) {
        const entities = [];
        for (let i = 0; i < count; i++) {
            const entity = new TestBoxEntity();
            entity.getComponent(PositionComponent).set(new Vector2(
                Math.random() * bounds.x,
                Math.random() * bounds.y / 3
            ));
            entities.push(entity);
        }
        return entities;
    }

    constructor() {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(RectColliderComponent);

        this.initSprite();
        this.initCollider();
        this.getComponent(PositionComponent);
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(TestBoxEntity.W, TestBoxEntity.H);
        sprite.setLayer(StartScene.OBJECT_LAYER);
        const ctx = sprite.getContext();

        ctx.fillStyle = 'rgb(96,48,27)';
        ctx.fillRect(0, 0, TestBoxEntity.W, TestBoxEntity.H);
    }

    initCollider() {
        const collider = this.getComponent(RectColliderComponent);
        collider.width = TestBoxEntity.W;
        collider.height = TestBoxEntity.H;
    }
}