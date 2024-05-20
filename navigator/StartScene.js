class StartScene extends Scene {

    static BACKGROUND_LAYER = 'background';
    static UI_LAYER = 'ui';
    constructor() {
        const layers = {};
        layers[StartScene.BACKGROUND_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[StartScene.UI_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        super(null, layers);
    }

    onOpenScene() {

    }

    calculate(frameTime) {
        console.log('calculating');
        return [];
    }

    afterDraw() {
        console.log('after draw');
    }
}