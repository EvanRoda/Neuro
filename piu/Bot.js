const MAX_SPEED = 10;           // pixels per seconds
const MAX_WAITING_TIME = 1000;  // milliseconds

class Bot extends Entity {
    uuid;
    brain;
    waitingTime = randomInt(MAX_WAITING_TIME);

    constructor(color, brain) {
        super(22, 32);
        this.uuid = generateUUID();
        this.brain = brain;
        this.createSprite(color)
    }

    createSprite(color) {
        const ctx = this.canvas.getContext('2d');
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

    static move_slow(self) {

    }
    static move_fast(self) {

    }
    static move_back(self) {

    }
    static range_attack(self) {

    }
    static melee_attack(self) {

    }
    static rotate_left(self) {

    }
    static rotate_right(self) {

    }
    // special reaction to give a time to next execution of brain.run()
    static waiting(self) {

    }
}