class EditScene extends Scene {

    static BACKGROUND_LAYER = 'background';
    static ENTITY_LAYER = 'entity';
    static UI_LAYER = 'ui';
    constructor() {
        const layers = {};
        layers[EditScene.BACKGROUND_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[EditScene.ENTITY_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        layers[EditScene.UI_LAYER] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
        super(null, layers);
    }

    onOpen() {

    }

    calculate(frameTime) {
        console.log('calculating');
        return [];
    }

    afterDraw() {
        console.log('after draw');
    }
}