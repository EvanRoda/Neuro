const MAX_SPEED = 10;           // pixels per seconds
const MAX_WAITING_TIME = 1000;  // milliseconds

class Bot extends Entity {
    constructor(color, brain) {
        super();
        this.addComponent(new PositionComponent(this))
            .addComponent(new SpriteComponent(this, 22, 32))
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
        this.waitingTime -= frameTime;
        // Do not think and make in one frame
        if (this.waitingTime < 0) {
            // Brain run
            // Get reaction
            // Get waitingTime from waiting reaction neuron
        } else {
            // Make reaction
        }
    }

    static move_slow(self, frameTime) {
        const shift = (MAX_SPEED / 2) * frameTime / 1000;
        self.x += shift;
    }
    static move_fast(self, frameTime) {

    }
    static move_back(self, frameTime) {

    }
    static range_attack(self, frameTime) {

    }
    static melee_attack(self, frameTime) {

    }
    static rotate_left(self, frameTime) {

    }
    static rotate_right(self, frameTime) {

    }
    // special reaction to give a time to next execution of brain.run()
    static waiting(self, frameTime) {

    }
}