class BattleScene extends Scene {
    static OBJECT_LAYER = 'object'
    static PROJECTILE_LAYER = 'projectile'
    constructor() {
        const layers = [
            RenderingController.BACKGROUND_LAYER,
            BattleScene.OBJECT_LAYER,
            RenderingController.UI_LAYER
        ];

        const camera = new Camera(new Vector2(), new Vector2(), GameContext.getWidth(), GameContext.getHeight());

        super(camera, layers);
    }

    onOpen() {
        TestBoxEntity.factory(10, new Vector2(GameContext.getWidth(), GameContext.getHeight()));
        this.player = new PlayerShipEntity();
        this.background = new BackgroundEntity();
        this.background.initSprite(GameContext.getWidth(), GameContext.getHeight(), '#151915');

        addEventListener("mousemove", (event) => {
            if (event.target !== GameContext.getCanvas()) return;
            const playerShip = this.player.getComponent(ShipPrefComponent).ship;
            playerShip.target = new Vector2(event.offsetX, event.offsetY);
        });

        addEventListener("click", (event) => {
            if (event.target !== GameContext.getCanvas()) return;

            // todo click by next screen button
        });
    }

    calculate(frameTime) {
        const entities = Object.values(EntityController.getAll());

        for (let i = 0, l = entities.length; i < l; i++) {
            entities[i].evaluate(frameTime);
        }
        return entities;
    }

    afterDraw() {
        CollisionController.evaluate();
        EntityController.removeGarbage();
    }
}