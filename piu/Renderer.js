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
        Renderer.animRedraw(this);
    }

    static animRedraw(that) {
        let entities = [];
        if (that.playToggle) {
            entities = that.before();
        }

        that.animationId = window.requestAnimationFrame(() => {
            Renderer.animRedraw(that);
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

            ctx.save();
            ctx.translate(entity.x - entity.center.x, entity.y - entity.center.y);
            ctx.rotate(entity.direction);
            ctx.drawImage(entity.canvas, 0, 0);
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