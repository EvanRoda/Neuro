const MAX_BOT_SPEED = 20;           // pixels per seconds
const MAX_BULLET_SPEED = 100;       // pixels per seconds
const MAX_WAITING_TIME = 1000;      // milliseconds
const ROTATION_SPEED = Math.PI / 4; // radians per second
const RELOAD_TIME = 1000;
const RAYS_COUNT = 11;
const RAYS_LENGTH = 200;
class Bot extends Entity {

    currentReaction = () => {}

    reload = RELOAD_TIME;

    brainReactions = [
        Bot.move_slow,
        Bot.move_fast,
        Bot.move_back,
        Bot.strafe_left,
        Bot.strafe_right,
        Bot.range_attack,
        Bot.rotate_left,
        Bot.rotate_right,
    ];

    cerebellumReactions = [
        Bot.do,
        Bot.think,
    ];

    constructor(color, brain, cerebellum) {
        super();
        this.addComponent(PositionComponent)
            .addComponent(SpriteComponent)
            .addComponent(ColliderComponent)
            .addComponent(FriendFoeComponent)
            .addComponent(EyesComponent)
            .addComponent(LearningComponent)
            .addComponent(NeuroComponent);

        this.initSprite(color);
        this.getComponent(FriendFoeComponent).setTeam(color);
        this.getComponent(ColliderComponent).radius = 11;
        this.getComponent(EyesComponent).initRays(RAYS_COUNT, RAYS_LENGTH);
        this.getComponent(NeuroComponent).brain = brain;
        this.getComponent(NeuroComponent).cerebellum = cerebellum;
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
        const eye = this.getComponent(EyesComponent);

        const reaction = this.cerebellumReactions[neuro.cerebellum.run(eye.getShortIntersectionData())];

        reaction(this, frameTime);
    }

    static shift(position, shift) {
        const x = Math.cos(position.direction) * shift;
        const y = Math.sin(position.direction) * shift;

        position.add(x, y);
    }

    static rotate(position, shift) {
        position.direction -= shift;
        if (position.direction < 0) position.direction += (Math.PI * 2);
        if (position.direction > (2 * Math.PI)) position.direction -= (Math.PI * 2);
    }

    // REACTIONS

    static move_slow(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = (MAX_BOT_SPEED / 2) * frameTime / 1000;

        Bot.shift(position, shift);

        const learn = self.getComponent(LearningComponent);
        learn.shift();
    }
    static move_fast(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = MAX_BOT_SPEED * frameTime / 1000;

        Bot.shift(position, shift);

        const learn = self.getComponent(LearningComponent);
        learn.shift();
    }

    static strafe_right(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = 0.75 * MAX_BOT_SPEED * frameTime / 1000;
        const dir = position.direction + Math.PI * 0.5

        const dx = Math.cos(dir) * shift;
        const dy = Math.sin(dir) * shift;

        position.add(dx, dy);

        const learn = self.getComponent(LearningComponent);
        learn.shift();
    }

    static strafe_left(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = 0.75 * MAX_BOT_SPEED * frameTime / 1000;
        const dir = position.direction - Math.PI * 0.5;

        const dx = Math.cos(dir) * shift;
        const dy = Math.sin(dir) * shift;

        position.add(dx, dy);

        const learn = self.getComponent(LearningComponent);
        learn.shift();
    }
    static move_back(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = (-MAX_BOT_SPEED / 2) * frameTime / 1000;

        Bot.shift(position, shift);
        const learn = self.getComponent(LearningComponent);
        learn.shift();
    }
    static range_attack(self, frameTime) {
        self.reload -= frameTime;
        if (self.reload < 0) {
            const position = self.getComponent(PositionComponent);
            const x = Math.cos(position.direction) * 16;
            const y = Math.sin(position.direction) * 16;
            new Bullet(self, position.x + x, position.y + y, position.direction);
            self.reload = RELOAD_TIME;
            const learn = self.getComponent(LearningComponent);
            learn.range_attack();
        }
    }
    static melee_attack(self, frameTime) {

    }
    static rotate_left(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = ROTATION_SPEED * frameTime / 1000;
        Bot.rotate(position, shift);
        const learn = self.getComponent(LearningComponent);
        learn.rotate();
    }
    static rotate_right(self, frameTime) {
        const position = self.getComponent(PositionComponent);
        const shift = ROTATION_SPEED * frameTime / 1000;
        Bot.rotate(position, shift);
        const learn = self.getComponent(LearningComponent);
        learn.rotate();
    }

    static do(self, frameTime) {
        self.currentReaction(self, frameTime);
    }

    static think(self, frameTime) {
        const neuro = self.getComponent(NeuroComponent);
        const eye = self.getComponent(EyesComponent);
        const learn = self.getComponent(LearningComponent);

        learn.think();
        self.currentReaction = self.brainReactions[neuro.brain.run(eye.getIntersectionData())];
    }
}