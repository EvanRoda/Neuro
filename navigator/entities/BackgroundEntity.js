class BackgroundEntity extends Entity {
    constructor() {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent);
    }

    initSprite(w, h, color) {
        console.log('initSprite');
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(w, h);
        sprite.setLayer(RenderingController.BACKGROUND_LAYER);
        const ctx = sprite.getContext();

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
    }
}