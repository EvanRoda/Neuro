class ColliderComponent extends Component {
    radius = 0;
    pivot = {x: 0, y: 0};

    _bbox = null;
    _pos = null;

    onCollision = () => {};

    constructor(entity) {
        super(entity);
    }

    clear() {
        this._bbox = null;
        this._pos = null;
    }

    bbox() {
        if (!this._bbox) {
            const pos = this.position();

            this._bbox = new Bbox(
                pos.y - this.radius,
                pos.y + this.radius,
                pos.x - this.radius,
                pos.x + this.radius,
            )
        }

        return this._bbox;
    }

    position() {
        if (!this._pos) {
            const pos = this.entity.getComponent(PositionComponent);
            this._pos = {
                x: pos.x + this.pivot.x,
                y: pos.y + this.pivot.y
            };
        }

        return this._pos;
    }

    squareOfDistance(point) {
        const a = this.position();
        const b = point;
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }

    isIntersect(other) {
        return this.bbox().isIntersect(other.bbox())
            && ((this.radius + other.radius) ** 2 >= this.squareOfDistance(other.position()));
    }

    containsPoint(point) {
        return this.bbox().containsPoint(point) && (this.radius ** 2 >= this.squareOfDistance(point));
    }
}

class PositionComponent extends Component {
    pos = new Vector2();
    direction = 0; // in radians from 0 to 2 * Math.PI
    constructor(entity) {
        super(entity);
    }

    set(vec) {
        this.pos = vec;
    }

    add(vec) {
        this.pos = this.pos.add(vec);
    }
}

class SpriteComponent extends Component {
    canvas = null;
    layer;
    pivot = {x: 0, y: 0};

    constructor(entity) {
        super(entity);
        this.canvas = document.createElement('canvas');
    }

    setDimensions(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px"
    }

    setPivot(x, y) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    setLayer(layer) {
        this.layer = layer;
    }

    getContext() {
        return this.canvas.getContext('2d');
    }
}
