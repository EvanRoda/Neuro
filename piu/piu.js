let renderer;
let canvas;

const WIDTH = 1281;
const HEIGHT = 961;
const TEAMS = [
    'red',
    'green'
];
const BOTS_IN_TEAM = 8;

const neuroFactory = new NeuroBuilder();

neuroFactory
    // todo: change sensors
    .addSensor(DIRECTION_HANDLER)
    .addSensor(DEFAULT_HANDLER)
    .addSensor(LIGHT_HANDLER)
    .addSensor(ENERGY_HANDLER)
    .addSensor(DIRECTION_HANDLER)
    .addSensor(LIGHT_HANDLER)
    .addSensor(BALANCER_HANDLER)

    .addHiddenLayers(4, 6)

    .addReaction(Bot.move_slow)
    .addReaction(Bot.move_fast)
    .addReaction(Bot.move_back)
    .addReaction(Bot.range_attack)
    .addReaction(Bot.melee_attack)
    .addReaction(Bot.rotate_left)
    .addReaction(Bot.rotate_right)
    .addReaction(Bot.nothing)

window.addEventListener('load', () => {
    console.log('page is fully loaded');

    initUI();
    createBots();
    renderer = new Renderer(canvas, WIDTH, HEIGHT, calculate, afterDraw);
    renderer.start();
});

function initUI() {
    canvas = document.getElementById("screen");
    canvas.addEventListener("click", () => {

    });
}

// Return list of Entities
function calculate(elapsedTime) {
    const objects = EntityController.getAll();
    const entities = [];
    for (const uuid in objects) {
        const entity = objects[uuid];
        entity.evaluate(elapsedTime);
        entities.push(entity);
    }

    return entities;
}

function afterDraw() {
    // ColliderProcessor
    const objects = EntityController.getAll();
    const colliders = [];
    for (const uuid in objects) {
        const entity = objects[uuid];
        const collider = entity.getComponent(ColliderComponent);
        if (collider) colliders.push(collider);
    }

    let first = colliders.pop();
    while (colliders.length) {
        for (let i = 0, l = colliders.length; i < l; i++) {
            const second = colliders[i];
            if (first.isIntersect(second)) {
                first.onCollision(second.entity);
                second.onCollision(first.entity);
            }
        }
        first = colliders.pop();
    }

    // GC
    EntityController.removeGarbage();
}

function createBots() {
    for (const team of TEAMS) {
        for (let i = 0; i < BOTS_IN_TEAM; i++) {
            const brain = neuroFactory.make();
            const bot = new Bot(team, brain);
            const position = bot.getComponent(PositionComponent);
            position.x = randomInt(WIDTH);
            position.y = randomInt(HEIGHT);
            position.direction = randomFloat(2 * Math.PI);
        }
    }
}