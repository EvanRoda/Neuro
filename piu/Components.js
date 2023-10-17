class Component {
    entity;
    constructor(entity) {
        this.entity = entity;
    }
}

class EyesComponent extends Component {
    rays = [];

    constructor(entity) {
        super(entity);
    }

    initRays(number, distance) {
        const startAngle = - Math.PI / 2;
        const dAngle = Math.PI / (number - 1);

        for (let i = 0; i < number; i++) {
            const ray = new RayComponent(this.entity);
            ray.init(startAngle + (dAngle * i), distance)
            this.rays.push(ray);
        }
    }
    clear() {
        for (let i = 0, l = this.rays.length; i < l; i++) {
            this.rays[i].clear();
        }
    }
}

class RayComponent extends Component {
    dAngle = 0;
    distance = 0;
    intersected = null;

    _a = null;
    _b = null;
    _c = null;
    _p1 = null;
    _p2 = null;
    _direction = null;

    constructor(entity, ) {
        super(entity);
    }

    init(dAngle, distance) {
        this.dAngle = dAngle;
        this.distance = distance;
    }

    clear() {
        this._a = null;
        this._b = null;
        this._c = null;
        this._p1 = null;
        this._p2 = null;
        this._direction = null;
    }

    a() {
        if (!this._a) {
            this._a = Math.sin(this.direction()) * this.distance
        }
        return this._a;
    }

    b() {
        if (!this._b) {
            this._b = Math.cos(this.direction()) * this.distance;
        }
        return this._b;
    }

    c() {
        if (!this._c) {
            const p1 = this.p1();
            this._c = p1.y * this.b() - this.a() * p1.x;
        }
        return this._c;
    }

    p1() {
        if (!this._p1) {
            const pos = this.entity.getComponent(PositionComponent);
            this._p1 = {
                x: pos.x,
                y: pos.y
            };
        }

        return this._p1;
    }

    p2() {
        if (!this._p2) {
            const p1 = this.p1();
            this._p2 = {
                x: p1.x + this.b(),
                y: p1.y + this.a(),
            }
        }

        return this._p2;
    }

    direction() {
        if (!this._direction) {
            const pos = this.entity.getComponent(PositionComponent);
            this._direction = pos.direction + this.dAngle;
        }

        return this._direction;
    }

    putIntersected(otherCollider) {
        const collider = this.entity.getComponent(ColliderComponent);
        const dist = collider.squareOfDistance(otherCollider);
        if (!this.intersected || (this.intersected && dist < this.intersected.distance)) {
            this.intersected = {
                distance: dist,
                entity: otherCollider.entity,
            };
        }
    }

    isIntersect(otherCollider) {
        const p1 = this.p1();
        const p2 = this.p2();
        const a = this.a();
        const b = this.b();
        const c = this.c();

        const pos = otherCollider.position();
        // console.log('otherCollider pos: ', pos);
        if ((pos.x - p2.x) * (p1.x - p2.x) + (pos.y - p2.y) * (p1.y - p2.y) <= 0) {

            const dist = (pos.x - p2.x) ** 2 + (pos.y - p2.y) ** 2;
            // console.log('POINT 2 dist: ', dist, 'radius2: ', otherCollider.radius ** 2);
            return dist <= otherCollider.radius ** 2;
        }

        if ((pos.x - p1.x) * (p2.x - p1.x) + (pos.y - p1.y) * (p2.y - p1.y) <= 0) {
            const dist = (pos.x - p1.x) ** 2 + (pos.y - p1.y) ** 2;
            // console.log('POINT 1 dist: ', dist, 'radius2: ', otherCollider.radius ** 2);
            return dist <= otherCollider.radius ** 2;
        }

        const dist = Math.abs(a * pos.x + b * pos.y + c) / this.distance;
        // console.log('HEIGHT dist: ', dist, 'radius: ', otherCollider.radius);
        return dist <= otherCollider.radius;
    }
}

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
            const pos = this.entity.getComponent(PositionComponent);

            this._bbox = new Bbox(
                pos.y + this.pivot.y - this.radius,
                pos.y + this.pivot.y + this.radius,
                pos.x + this.pivot.x - this.radius,
                pos.x + this.pivot.x + this.radius,
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