class StartScene extends Scene {

    startButton = null;
    constructor() {
        const layers = {};
        layers[Renderer.BACKGROUND_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[Renderer.UI_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        super(null, layers);
    }

    onOpenScene() {
        this.startButton = new StartButtonEntity();
    }

    calculate(scene, frameTime) {
        if (scene.startButton != null) {
            return [scene.startButton];
        }
        return [];
    }

    afterDraw() {
    }
}