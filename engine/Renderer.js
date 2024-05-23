class Renderer {

    static BACKGROUND_LAYER = 'background';
    static UI_LAYER = 'ui';

    static animRedraw(that, time) {
        let entities = [];
        if (that.playToggle) {
            entities = that.before(that.scene, time - that.startTime);
            that.startTime = time;
        }

        that.animationId = window.requestAnimationFrame((timeStamp) => {
            Renderer.animRedraw(that, timeStamp);
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
    camera = null;
    layers = {};
    layerOrder = [];


    constructor(scene, layers) {
        this.real = GameContext.getCanvas()
        this.realCtx = this.real.getContext('2d');
        this.hidden = document.createElement('canvas');
        this.ctx = this.hidden.getContext('2d');
        this.width = GameContext.getWidth();
        this.height = GameContext.getHeight();
        this.scene = scene;
        this.layerOrder = layers;

        this.camera = scene.camera;
        if (this.camera == null) {
            this.camera = new Camera(new Vector2(), new Vector2(), this.width, this.height);
        }

        this.initLayers(layers);

        this.before = scene.calculate;
        this.after = scene.afterDraw;
    }

    initLayers(layerList) {
        for (let i = 0, l = layerList.length; i < l; i++) {
            if (layerList[i] === Renderer.UI_LAYER) {
                this.layers[layerList[i]] = new RenderingLayer(GameContext.getWidth(), GameContext.getHeight());
                continue;
            }
            this.layers[layerList[i]] = new RenderingLayer(this.camera.width, this.camera.height);
        }
    }

    clearLayers() {
        for (let i = 0, l = this.layerOrder.length; i < l; i++) {
            this.layers[this.layerOrder[i]].clear();
        }
    }

    start() {
        Renderer.animRedraw(this, 0);
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

        for (let i = 0, l = entities.length; i < l; i++) {
            const entity = entities[i];
            const position = entity.getComponent(PositionComponent);
            const sprite = entity.getComponent(SpriteComponent);
            const layer = this.layers[sprite.layer];
            const ctx = layer.getContext();

            let positionOnLayer;
            switch (sprite.layer) {
                case Renderer.BACKGROUND_LAYER:
                case Renderer.UI_LAYER:
                    positionOnLayer = position.pos;
                    break;
                default:
                    positionOnLayer = position.pos.sub(this.camera.scenePosition);
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
        Renderer.clear(this.hidden, this.width, this.height);
        const hidden = this.hidden.getContext('2d');

        for (let i = 0, l = this.layerOrder.length; i < l; i++) {
            const layer = this.layers[this.layerOrder[i]];
            switch (this.layerOrder[i]) {
                case Renderer.BACKGROUND_LAYER:
                    hidden.drawImage(layer.getCanvas(), this.camera.canvasPosition.x, this.camera.canvasPosition.y);
                    break;
                case Renderer.UI_LAYER:
                    hidden.drawImage(layer.getCanvas(), 0, 0);
                    break;
                default:
                    hidden.drawImage(layer.getCanvas(), this.camera.canvasPosition.x, this.camera.canvasPosition.y);
            }
        }
    }

    drawOnReal() {
        Renderer.clear(this.real, this.width, this.height);
        this.realCtx.drawImage(this.hidden, 0, 0);
    }
}