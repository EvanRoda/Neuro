class BattleScene extends Scene {
    static OBJECT_LAYER = 'object'
    static PROJECTILE_LAYER = 'projectile'
    constructor() {
        const layers = [
            Renderer.BACKGROUND_LAYER,
            BattleScene.OBJECT_LAYER,
            Renderer.UI_LAYER
        ];

        super(null, layers);
    }

    onOpenScene() {
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

    calculate(scene, frameTime) {
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