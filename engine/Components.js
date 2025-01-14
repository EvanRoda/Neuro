class ColliderComponent extends Component {
    pivot = new Vector2();

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
        return null;
    }

    position() {
        if (!this._pos) {
            const pos = this.entity.getComponent(PositionComponent).pos;
            this._pos = pos.sub(this.pivot)
        }

        return this._pos;
    }

    isIntersect(other) {
        return false;
    }

    containsPoint(point) {
        return false;
    }

    static circleIntersectRect(circle, rect) {
        const rectBbox = rect.bbox();
        const circlePosition = circle.position();

        const closestX = Math.max(rectBbox.left, Math.min(circlePosition.x, rectBbox.right));
        const closestY = Math.max(rectBbox.top, Math.min(circlePosition.y, rectBbox.bottom));

        const distanceX = circlePosition.x - closestX;
        const distanceY = circlePosition.y - closestY;

        return (distanceX ** 2 + distanceY ** 2) < (circle.radius ** 2);
    }
}

class CircleColliderComponent extends ColliderComponent {
    radius = 0;

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

    squareOfDistance(point) {
        const a = this.position();
        const b = point;
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }

    isIntersect(other) {
        if (other instanceof RectColliderComponent) {
            return ColliderComponent.circleIntersectRect(this, other);
        } else if (other instanceof CircleColliderComponent) {
            return this.bbox().isIntersect(other.bbox())
                && ((this.radius + other.radius) ** 2 >= this.squareOfDistance(other.position()));
        }

        return false;
    }

    containsPoint(point) {
        return this.bbox().containsPoint(point) && (this.radius ** 2 >= this.squareOfDistance(point));
    }
}

class RectColliderComponent extends ColliderComponent {
    width = 0;
    height = 0;

    bbox() {
        if (!this._bbox) {
            const pos = this.position();

            this._bbox = new Bbox(
                pos.y,
                pos.y + this.height,
                pos.x,
                pos.x + this.width,
            )
        }

        return this._bbox;
    }

    isIntersect(other) {
        if (other instanceof CircleColliderComponent) {
            return ColliderComponent.circleIntersectRect(other, this);
        } else if (other instanceof RectColliderComponent) {
            return this.bbox().isIntersect(other.bbox());
        }

        return false;
    }

    containsPoint(point) {
        return this.bbox().containsPoint(point);
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

    setDir(direction) {
        this.direction = direction;
    }

    addDir(delta) {
        this.direction += delta;
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
