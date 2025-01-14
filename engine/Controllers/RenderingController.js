class RenderingController {

    static BACKGROUND_LAYER = 'background';
    static UI_LAYER = 'ui';

    static _instance;

    static init() {
        if (RenderingController._instance) {
            throw new Error("RenderingController is already initialized.");
        }

        RenderingController._instance = new RenderingController();
    }

    static getInstance() {
        return RenderingController._instance;
    }

    static animRedraw(that, time) {
        let entities = [];
        if (that.playToggle) {
            entities = that.before(time - that.startTime);
            that.startTime = time;
        }

        that.animationId = window.requestAnimationFrame((timeStamp) => {
            RenderingController.animRedraw(that, timeStamp);
        });
        if (!that.needRedraw) return;

        that.needRedraw = false;
        if (that.playToggle) {
            that.draw(entities);
        }

        that.needRedraw = true;
    }

    static clear(canvas, w, h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
    }

    real = null;
    realCtx = null;
    hidden = null;
    width = 0;
    height = 0;

    before = () => { return []; }; // Return list of entities
    after = () => {};

    scene = null;
    animationId = null;
    needRedraw = true;
    playToggle = true;
    renderToggle = true;
    startTime = 0;
    layers = {};
    layerOrder = [];


    constructor() {
        this.real = GameContext.getCanvas()
        this.realCtx = this.real.getContext('2d');
        this.hidden = document.createElement('canvas');
        this.ctx = this.hidden.getContext('2d');
        this.width = GameContext.getWidth();
        this.height = GameContext.getHeight();
    }

    initLayers(layerList) {
        for (let i = 0, l = layerList.length; i < l; i++) {
            if (layerList[i] === RenderingController.UI_LAYER) {
                this.layers[layerList[i]] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
                continue;
            }
            this.layers[layerList[i]] = new RenderingLayer(this.scene.camera.width, this.scene.camera.height);
        }
    }

    clearLayers() {
        for (let i = 0, l = this.layerOrder.length; i < l; i++) {
            this.layers[this.layerOrder[i]].clear();
        }
    }

    start(scene) {
        this.scene = scene;
        this.layerOrder = scene.layers;

        this.initLayers(scene.layers);

        this.before = scene.calculate;
        this.after = scene.afterDraw;

        RenderingController.animRedraw(this, 0);
    }

    stop() {
        this.scene = null;
        this.layerOrder = [];

        this.before = () => { return []; };
        this.after = () => {};

        window.cancelAnimationFrame(this.animationId);
    }

    draw(entities) {
        if (this.renderToggle) {
            this.render(entities);
            this.drawOnHidden();
            this.drawOnReal();
        }

        this.after();
    }

    render(entities) {
        this.clearLayers();
        // console.log(entities);
        for (let i = 0, l = entities.length; i < l; i++) {
            const entity = entities[i];
            const position = entity.getComponent(PositionComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const layer = this.layers[sprite.layer];
            const ctx = layer.getContext();

            let positionOnLayer;
            switch (sprite.layer) {
                case RenderingController.BACKGROUND_LAYER:
                case RenderingController.UI_LAYER:
                    positionOnLayer = position.pos;
                    break;
                default:
                    positionOnLayer = position.pos.sub(this.scene.camera.scenePosition);
            }

            ctx.save();
            ctx.translate(positionOnLayer.x, positionOnLayer.y);
            ctx.rotate(position.direction);
            ctx.drawImage(sprite.canvas, -sprite.pivot.x, -sprite.pivot.y);
            ctx.restore();

            if (debugToggle) {}
        }
    }

    drawOnHidden() {
        RenderingController.clear(this.hidden, this.width, this.height);
        const hidden = this.hidden.getContext('2d');

        for (let i = 0, l = this.layerOrder.length; i < l; i++) {
            const layer = this.layers[this.layerOrder[i]];
            switch (this.layerOrder[i]) {
                case RenderingController.BACKGROUND_LAYER:
                    hidden.drawImage(layer.getCanvas(), this.scene.camera.canvasPosition.x, this.scene.camera.canvasPosition.y);
                    break;
                case RenderingController.UI_LAYER:
                    hidden.drawImage(layer.getCanvas(), 0, 0);
                    break;
                default:
                    hidden.drawImage(layer.getCanvas(), this.scene.camera.canvasPosition.x, this.scene.camera.canvasPosition.y);
            }
        }

        hidden.strokeStyle = 'red';
        hidden.strokeRect(0, 0, this.width, this.height);
    }

    drawOnReal() {
        RenderingController.clear(this.real, this.width, this.height);
        this.realCtx.drawImage(this.hidden, 0, 0);
    }
}