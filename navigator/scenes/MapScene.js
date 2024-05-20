class MapScene extends Scene {

    static BACKGROUND_LAYER = 'background';
    static ENTITY_LAYER = 'entity';
    static UI_LAYER = 'ui';
    constructor() {
        const layers = {};
        layers[MapScene.BACKGROUND_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[MapScene.ENTITY_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[MapScene.UI_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
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