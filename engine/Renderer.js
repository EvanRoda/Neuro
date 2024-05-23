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
    layers = {}


    constructor(scene, layers) {
        this.real = GameContext.getCanvas()
        this.realCtx = this.real.getContext('2d');
        this.hidden = document.createElement('canvas');
        this.ctx = this.hidden.getContext('2d');
        this.width = GameContext.getWidth();
        this.height = GameContext.getHeight();
        this.scene = scene;
        this.layers = layers;
        this.camera = scene.camera;
        if (this.camera == null) {
            this.camera = new Camera(new Vector2(), new Vector2(), this.width, this.height);
        }

        this.before = scene.calculate;
        this.after = scene.afterDraw;
    }

    start() {
        Renderer.animRedraw(this, 0);
    }

    draw(entities) {
        if (this.renderToggle) {
            this.render(entities);
            this.redraw();
        }

        this.after();
    }

    render(entities) {
        console.log('render', entities);
        Renderer.clear(this.hidden, this.width, this.height);
        const ctx = this.hidden.getContext('2d');

        for (let i = 0, l = entities.length; i < l; i++) {
            const entity = entities[i];
            const position = entity.getComponent(PositionComponent);
            const sprite = entity.getComponent(SpriteComponent);

            ctx.save();
            ctx.translate(position.x, position.y);
            ctx.rotate(position.direction);
            ctx.drawImage(sprite.canvas, -sprite.pivot.x, -sprite.pivot.y);
            ctx.restore();

            if (debugToggle) {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(position.x, position.y, 2, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();

                ctx.save();
                ctx.translate(position.x, position.y);
                ctx.rotate(position.direction + Math.PI / 2);
                ctx.strokeStyle = 'blue';
                ctx.strokeRect(-sprite.pivot.x, -sprite.pivot.y, sprite.canvas.width, sprite.canvas.height);
                ctx.restore();

                const collider = entity.getComponent(ColliderComponent);
                if (collider) {

                    ctx.save();
                    ctx.translate(position.x, position.y);
                    ctx.rotate(position.direction + Math.PI / 2);
                    ctx.strokeStyle = 'green';
                    ctx.beginPath();
                    ctx.arc(collider.pivot.x, collider.pivot.y, collider.radius, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.restore();
                }

                const eye = entity.getComponent(EyesComponent);
                if (eye) {
                    ctx.save();
                    ctx.strokeStyle = 'red';
                    ctx.beginPath();
                    for (let i = 0, l = eye.rays.length; i < l; i++) {
                        const p2 = eye.rays[i].p2();
                        ctx.moveTo(position.x, position.y);
                        ctx.lineTo(p2.x, p2.y);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    redraw() {
        Renderer.clear(this.real, this.width, this.height);
        this.realCtx.drawImage(this.hidden, 0, 0);
    }
}