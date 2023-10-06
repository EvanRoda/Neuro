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

    tests();

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
        if (entity.hasComponent(SpriteComponent)) {
            entities.push(entity);
        }
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

function tests() {
    const one = new Entity()
        .addComponent(PositionComponent)
        .addComponent(ColliderComponent);

    const two = new Entity()
        .addComponent(PositionComponent)
        .addComponent(ColliderComponent);

    const pos1 = one.getComponent(PositionComponent);
    const col1 = one.getComponent(ColliderComponent);

    const pos2 = two.getComponent(PositionComponent);
    const col2 = two.getComponent(ColliderComponent);

    console.log("Collider", col1);
    console.log("Collider", col2);

    console.log("BBOX", col1.bbox());
    console.log("BBOX", col2.bbox());
    console.log("BBOX Intersects", col1.bbox().isIntersect(col2.bbox()));

    console.log("Square of radiuses", (col1.radius + col2.radius) ** 2);
    console.log("Square of distance", col1.squareOfDistance(col2));
    if (col1.isIntersect(col2)) {
        console.info("Zero radius passed!");
    } else {
        console.error("Zero radius failed!");
    }

    col1.radius = 10;
    col2.radius = 10;

    if (col1.isIntersect(col2)) {
        console.info("10 radius passed!");
    } else {
        console.error("10 radius failed!");
    }
}
