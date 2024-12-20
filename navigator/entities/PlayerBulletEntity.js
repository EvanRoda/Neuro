class PlayerBulletEntity extends Entity {
    static W = 2;
    static H = 2;

    constructor(startPosition, direction, bulletPref) {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(BulletPrefComponent);

        this.initSprite();
        this.getComponent(PositionComponent).set(startPosition);
        this.getComponent(PositionComponent).setDir(direction);
        this.getComponent(BulletPrefComponent).set(bulletPref);
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(PlayerBulletEntity.W, PlayerBulletEntity.H);
        sprite.setLayer(StartScene.OBJECT_LAYER);
        sprite.setPivot(PlayerBulletEntity.W / 2, PlayerBulletEntity.H / 2);
        const ctx = sprite.getContext();

        ctx.fillStyle = '#9a3fd5';
        ctx.fillRect(0, 0, PlayerBulletEntity.W, PlayerBulletEntity.H);
    }

    evaluate(frameTime, screenBbox) {
        super.evaluate(frameTime);

        const pos = this.getComponent(PositionComponent);
        const bullet = this.getComponent(BulletPrefComponent);

        const shift = bullet.speed * frameTime / 1000;

        const x = Math.cos(pos.direction) * shift;
        const y = Math.sin(pos.direction) * shift;

        pos.add(new Vector2(x, y));
        if (!screenBbox.containsPoint(pos.pos)) this.mustRemove = true;
    }
}