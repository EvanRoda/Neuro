const MAX_SPEED = 10;               // pixels per seconds
const MAX_WAITING_TIME = 1000;      // milliseconds
const ROTATION_SPEED = Math.PI / 4; // radians per second

class Bot extends Entity {

    currentReaction = () => {}
    constructor(color, brain) {
        super();
        this.addComponent(new PositionComponent(this))
            .addComponent(new SpriteComponent(this, 22, 32))
            .addComponent(new CircleColliderComponent(this, 20))
            .addComponent(new NeuroComponent(this, brain));

        this.createSprite(color);
    }

    createSprite(color) {
        const ctx = this.getComponent(SpriteComponent).getContext();
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
            this.currentReaction = Bot.move_slow;
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