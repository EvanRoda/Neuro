class StartScene extends Scene {

    startButton = null;
    background = null;
    static OBJECT_LAYER = 'object'
    constructor() {
        const layers = [
            Renderer.BACKGROUND_LAYER,
            StartScene.OBJECT_LAYER,
            Renderer.UI_LAYER
        ];

        const camera = new Camera(new Vector2(), new Vector2(150, 175), 200, 200);

        addEventListener("mousemove", (event) => {
            camera.scenePosition = new Vector2(event.offsetX-100, event.offsetY-100);
            camera.canvasPosition = camera.scenePosition;
        });

        super(camera, layers);
    }

    onOpenScene() {
        TestBoxEntity.factory(10, new Vector2(GameContext.getWidth(), GameContext.getHeight()));

        this.startButton = new StartButtonEntity();
        this.background = new BackgroundEntity();
        this.background.initSprite(GameContext.getWidth(), GameContext.getHeight(), 'cyan');
    }

    calculate(scene, frameTime) {
        return Object.values(EntityController.getAll());
    }

    afterDraw() {
    }
}