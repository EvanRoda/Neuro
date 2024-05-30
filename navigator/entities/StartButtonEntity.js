class StartButtonEntity extends Entity {
    constructor() {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(RectColliderComponent);

        this.initSprite();
        this.getComponent(PositionComponent).set(new Vector2(100, 100));
        this.getComponent(RectColliderComponent).width = 200;
        this.getComponent(RectColliderComponent).height = 50;
    }

    initSprite() {
        console.log('initSprite');
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(200, 50);
        sprite.setLayer(Renderer.UI_LAYER)
        const ctx = sprite.getContext();

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Start', 100, 25);
    }
}