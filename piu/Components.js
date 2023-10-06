class Component {
    entity;
    constructor(entity) {
        this.entity = entity;
    }
}

class ColliderComponent extends Component {
    radius = 0;
    pivot = {x: 0, y: 0};
    onCollision = () => {};

    constructor(entity) {
        super(entity);
    }

    bbox() {
        const pos = this.entity.getComponent(PositionComponent);

        return new Bbox(
            pos.y + this.pivot.y - this.radius,
            pos.y + this.pivot.y + this.radius,
            pos.x + this.pivot.x - this.radius,
            pos.x + this.pivot.x + this.radius,
        )
    }

    position() {
        const pos = this.entity.getComponent(PositionComponent);
        return {
            x: pos.x + this.pivot.x,
            y: pos.y + this.pivot.y
        };
    }

    squareOfDistance(other) {
        const a = this.position();
        const b = other.position();
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }

    isIntersect(other) {
        return this.bbox().isIntersect(other.bbox())
            && ((this.radius + other.radius) ** 2 >= this.squareOfDistance(other));
    }
}

class PositionComponent extends Component {
    x = 0;
    y = 0;
    direction = 0; // in radians from 0 to 2 * Math.PI
    constructor(entity) {
        super(entity);
    }
}

class SpriteComponent extends Component {
    canvas = null;
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

    getContext() {
        return this.canvas.getContext('2d');
    }
}

class NeuroComponent extends Component {
    brain;
    waitingTime;

    constructor(entity) {
        super(entity);
        this.waitingTime = randomInt(MAX_WAITING_TIME);
    }
}