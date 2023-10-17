const MAX_SPEED = 10;               // pixels per seconds
const MAX_WAITING_TIME = 1000;      // milliseconds
const ROTATION_SPEED = Math.PI / 4; // radians per second
const RELOAD_TIME = 1000;

class Bot extends Entity {

    currentReaction = () => {}

    reload = RELOAD_TIME;
    constructor(color, brain) {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(ColliderComponent)
            .addComponent(EyesComponent)
            .addComponent(NeuroComponent);

        this.initSprite(color);
        this.getComponent(ColliderComponent).radius = 11;
        this.getComponent(EyesComponent).initRays(7, 100);
        this.getComponent(NeuroComponent).brain = brain;
    }

    initSprite(color) {
        const sprite = this.getComponent(SpriteComponent);
        sprite.setDimensions(22, 32);
        sprite.setPivot(11, 16);
        const ctx = sprite.getContext();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(11, 16, 10, 0, 2 * Math.PI);
        ctx.moveTo(11, 16);
        ctx.lineTo(11, 0);
        ctx.stroke();
    }

    evaluate(frameTime) {
        const neuro = this.getComponent(NeuroComponent);
        neuro.waitingTime -= frameTime;
        // Do not think and make in one frame
        if (neuro.waitingTime < 0) {
            // Brain run
            // Get reaction
            // Get waitingTime from waiting reaction neuron
            const rnd = Math.random();
            if (rnd < 0.33) {
                this.currentReaction = Bot.rotate_right;
            } else if (rnd < 0.66) {
                this.currentReaction = Bot.move_slow;
            } else {
                this.currentReaction = Bot.range_attack;
            }
            neuro.waitingTime = MAX_WAITING_TIME;
        } else {
            this.currentReaction(this, frameTime);
        }
    }

    static shift(position, shift) {
        const x = Math.cos(position.direction) * shift;
        const y = Math.sin(position.direction) * shift;

        position.x += x;
        if (position.x < 0) position.x = 0;
        if (position.x > WIDTH) position.x = WIDTH;

        position.y += y;
        if (position.y < 0) position.y = 0;
        if (position.y > HEIGHT) position.y = HEIGHT;
    }

    static rotate(position, shift) {
        position.direction -= shift;
        if (position.direction < 0) position.direction += (Math.PI * 2);
        if (position.direction > (2 * Math.PI)) position.direction -= (Math.PI * 2);
    }

    // REACTIONS

    static move_slow(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = (MAX_SPEED / 2) * frameTime / 1000;

        Bot.shift(position, shift);
    }
    static move_fast(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = MAX_SPEED * frameTime / 1000;

        Bot.shift(position, shift);
    }
    static move_back(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = (-MAX_SPEED / 2) * frameTime / 1000;

        Bot.shift(position, shift);
    }
    static range_attack(self, frameTime) {
        self.reload -= frameTime;
        if (self.reload < 0) {
            const position = self.getComponent(PositionComponent);
            const x = Math.cos(position.direction) * 16;
            const y = Math.sin(position.direction) * 16;
            new Bullet(position.x + x, position.y + y, position.direction);
            self.reload = RELOAD_TIME;
        }

    }
    static melee_attack(self, frameTime) {

    }
    static rotate_left(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = ROTATION_SPEED * frameTime / 1000;
        Bot.rotate(position, shift);
    }
    static rotate_right(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = ROTATION_SPEED * frameTime / 1000;
        Bot.rotate(position, shift);
    }
}