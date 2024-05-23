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
        super(null, layers);
    }

    onOpenScene() {
        this.startButton = new StartButtonEntity();
        this.background = new BackgroundEntity();
        this.background.initSprite(GameContext.getWidth(), GameContext.getHeight(), 'cyan');
    }

    calculate(scene, frameTime) {
        const entities = [];

        if (scene.startButton != null) {
            entities.push(scene.startButton);
        }

        if (scene.background != null) {
            entities.push(scene.background);
        }

        return entities;
    }

    afterDraw() {
    }
}