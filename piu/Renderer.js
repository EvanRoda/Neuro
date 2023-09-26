class Renderer {
    real = null;
    realCtx = null;
    hidden = null;
    width = 0;
    height = 0;

    before = () => { return []; }; // Return list of entities
    after = () => {};

    animationId = null;
    needRedraw = true;
    playToggle = true;
    renderToggle = true;
    startTime = 0;

    constructor(canvas, width, height, beforeDrawCallback, afterDrawCallback) {
        this.real = canvas;
        this.realCtx = this.real.getContext('2d');
        this.hidden = document.createElement('canvas');
        this.ctx = this.hidden.getContext('2d');
        this.width = width;
        this.height = height;
        this.before = beforeDrawCallback;
        this.after = afterDrawCallback;

    }

    start() {
        Renderer.animRedraw(this, 0);
    }

    static animRedraw(that, time) {
        let entities = [];
        if (that.playToggle) {
            entities = that.before(time - that.startTime);
            that.startTime = time;
        }

        that.animationId = window.requestAnimationFrame((timeStamp) => {
            Renderer.animRedraw(that, timeStamp);
        });
        if (!that.needRedraw) return;

        that.needRedraw = false;
        if (that.playToggle) {
            that.draw(entities);
            that.after();
        }

        that.needRedraw = true;
    }

    draw(entities) {
        if (this.renderToggle) {
            this.render(entities);
            this.redraw();
        }

        this.after();
    }

    render(entities) {
        Renderer.clear(this.hidden, this.width, this.height);
        const ctx = this.hidden.getContext('2d');

        for (let i = 0, l = entities.length; i < l; i++) {
            const entity = entities[i];
            const position = entity.getComponent(PositionComponent);
            const sprite = entity.getComponent(SpriteComponent);

            ctx.save();
            ctx.translate(position.x - sprite.pivot.x, position.y - sprite.pivot.y);
            ctx.rotate(position.direction + Math.PI / 2);
            ctx.drawImage(sprite.canvas, 0, 0);
            ctx.restore();
        }
    }

    redraw() {
        Renderer.clear(this.real, this.width, this.height);
        this.realCtx.drawImage(this.hidden, 0, 0);
    }

    static clear(canvas, w, h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px"
    }
}