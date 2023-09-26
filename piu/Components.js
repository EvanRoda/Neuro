class Component {
    entity;
    constructor(entity) {
        this.entity = entity;
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

    constructor(entity, w, h) {
        super(entity);

        this.canvas = document.createElement('canvas');

        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px"

        this.pivot.x = w / 2;
        this.pivot.y = h / 2;
    }

    getContext() {
        return this.canvas.getContext('2d');
    }
}

class NeuroComponent extends Component {
    brain;
    waitingTime;

    constructor(entity, brain) {
        super(entity);
        this.brain = brain;
        this.waitingTime = randomInt(MAX_WAITING_TIME);
    }

    calcWaitingTime(elementIndex) {
        const rElements = this.brain.layers[this.brain.layers.length - 1].elements;
        if (rElements[elementIndex] === undefined) return null;
        this.waitingTime = MAX_WAITING_TIME * Math.abs(rElements[elementIndex].calculatedValue);
    }
}