class PlayerShipEntity extends Entity {
    static W = 20;
    static H = 20;

    constructor() {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(ShipPrefComponent);

        this.initSprite();
        this.getComponent(PositionComponent).set(new Vector2(250, 800));
        this.getComponent(ShipPrefComponent).set(new ShipPref(
            100,
            100,
            new GunPref(),
            0.5));
    }

    initSprite() {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(PlayerShipEntity.W, PlayerShipEntity.H);
        sprite.setLayer(StartScene.OBJECT_LAYER);
        sprite.setPivot(PlayerShipEntity.W / 2, PlayerShipEntity.H / 2);
        const ctx = sprite.getContext();

        ctx.fillStyle = '#44af44';
        ctx.fillRect(0, 0, PlayerShipEntity.W, PlayerShipEntity.H);
    }

    evaluate(frameTime) {
        super.evaluate(frameTime);

        const pos = this.getComponent(PositionComponent);
        const playerShip = this.getComponent(ShipPrefComponent).ship;
        if (playerShip.target.sub(pos.pos).len() > playerShip.speed) {
            const move = playerShip.target
                .sub(pos.pos)
                .normalize()
                .scale(playerShip.speed);

            pos.add(move);
        } else {
            pos.set(playerShip.target);
        }
    }
}