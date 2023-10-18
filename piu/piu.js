let renderer;
let canvas;

const WIDTH = 1281;
const HEIGHT = 961;
const TEAMS = [
    'red',
    'green'
];
const BOTS_IN_TEAM = 12;
const OBSTACLES_COUNT = 10;

const brainFactory = new NeuroBuilder();
const cerebellumFactory = new NeuroBuilder();

for (let i = 0; i < RAYS_COUNT; i++) {
    brainFactory
        .addSensor(DEFAULT_HANDLER)
        .addSensor(DEFAULT_HANDLER)
        .addSensor(DEFAULT_HANDLER)
        .addSensor(DEFAULT_HANDLER)
        .addSensor(DEFAULT_HANDLER);

    cerebellumFactory.addSensor(DEFAULT_HANDLER);
}

brainFactory
    .addSensor(BALANCER_HANDLER)
    .addHiddenLayers(4, RAYS_COUNT * 2)

    .addReaction(Bot.move_slow)
    .addReaction(Bot.move_fast)
    .addReaction(Bot.move_back)
    .addReaction(Bot.strafe_left)
    .addReaction(Bot.strafe_right)
    .addReaction(Bot.range_attack)
    // .addReaction(Bot.melee_attack)
    .addReaction(Bot.rotate_left)
    .addReaction(Bot.rotate_right);

cerebellumFactory
    .addSensor(BALANCER_HANDLER)
    .addHiddenLayers(3, RAYS_COUNT)
    .addReaction(Bot.do)
    .addReaction(Bot.think)


window.addEventListener('load', () => {
    console.log('page is fully loaded');

    tests();

    initUI();
    createObstacles();
    createBots();
    renderer = new Renderer(canvas, WIDTH, HEIGHT, calculate, afterDraw);
    renderer.start();
});

function startNewRound(templates) {
    createObstacles();
    createBotsWithTemplates(templates);
}

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

    LearningController.getInstance().tick(elapsedTime);

    return entities;
}

function afterDraw() {
    // ColliderProcessor

    // Get colliders from objects
    const objects = EntityController.getAll();
    const colliders = [];
    const eyes = [];
    for (const uuid in objects) {
        const entity = objects[uuid];
        const collider = entity.getComponent(ColliderComponent);
        if (collider) colliders.push(collider);
        const eye = entity.getComponent(EyesComponent);
        if (eye) eyes.push(eye);
    }

    for (let i = 0, l = eyes.length; i < l; i++) {
        const eye = eyes[i];
        eye.clearView();
        for (let j = 0, m = colliders.length; j < m; j++) {
            const collider = colliders[j];
            if (eye.entity.uuid !== collider.entity.uuid) {
                for (let n = 0, k = eye.rays.length; n < k; n++) {
                    const ray = eye.rays[n];
                    if (ray.isIntersect(collider)) {
                        ray.putIntersected(collider.entity);
                    }
                }
            }
        }

        for (let n = 0, k = eye.rays.length; n < k; n++) {
            const ray = eye.rays[n];
            const p2 = ray.p2();
            if (p2.x <= 0 || p2.x >= WIDTH || p2.y <= 0 || p2.y >= HEIGHT) {
                ray.putBounds();
            }
        }
    }

    // Collision detection and launch onCollision
    for (let i = 0, l = colliders.length; i < l; i++) {
        const first = colliders[i];
        for (let j = i + 1; j < l; j++) {
            const second = colliders[j];
            if (first.isIntersect(second)) {
                first.onCollision(second.entity);
                second.onCollision(first.entity);
            }
        }
    }

    // Clear colliders cache
    for (let i = 0, l = colliders.length; i < l; i++) {
        colliders[i].clear();
    }

    for (let i = 0, l = eyes.length; i < l; i++) {
        eyes[i].clear();
    }

    // Скопировать мозги собирающихся помереть
    LearningController.getInstance().deadInCache();
    LearningController.getInstance().checkEndRound();

    // GC
    EntityController.removeGarbage();
}

function createBots() {
    for (const team of TEAMS) {
        for (let i = 0; i < BOTS_IN_TEAM; i++) {
            const brain = brainFactory.make();
            const cerebellum = cerebellumFactory.make();
            const bot = new Bot(team, brain, cerebellum);
            const position = bot.getComponent(PositionComponent);
            position.x = randomInt(WIDTH);
            position.y = randomInt(HEIGHT);
            position.direction = randomFloat(2 * Math.PI);
        }
    }
}

function createBotsWithTemplates(templates) {
    let tIndex = 0;
    for (const team of TEAMS) {
        for (let i = 0; i < BOTS_IN_TEAM; i++) {
            const brain = templates[tIndex % 3].brain.copy();
            const cerebellum = templates[tIndex % 3].cerebellum.copy();

            if (tIndex > 5) {
                brain.hardMutate();
                cerebellum.hardMutate();
            } else if (tIndex > 2) {
                brain.mutate();
                cerebellum.mutate();
            }

            const bot = new Bot(team, brain, cerebellum);
            const position = bot.getComponent(PositionComponent);
            position.x = randomInt(WIDTH);
            position.y = randomInt(HEIGHT);
            position.direction = randomFloat(2 * Math.PI);

            tIndex++;
        }
    }
}

function createObstacles() {
    for (let i = 0; i < OBSTACLES_COUNT; i++) {
        new Obstacle(randomInt(WIDTH), randomInt(HEIGHT));
    }
}

function tests() {
    const one = new Entity()
        .addComponent(PositionComponent)
        .addComponent(RayComponent)
        .addComponent(ColliderComponent);

    const two = new Entity()
        .addComponent(PositionComponent)
        .addComponent(ColliderComponent);

    const pos1 = one.getComponent(PositionComponent);
    const col1 = one.getComponent(ColliderComponent);
    const ray1 = one.getComponent(RayComponent);

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

    pos1.x = 0;
    pos1.y = 0;
    pos1.direction = 0;

    ray1.init(0, 5);

    console.log('RAY', ray1.p1(), ray1.p2(), ray1.a(), ray1.b(), ray1.c());

    console.log('ONE');
    col2.clear();
    pos2.x = -1;
    pos2.y = 1;
    col2.radius = 1;

    console.log('Check! Must false', ray1.isIntersect(col2));

    console.log('TWO');
    col2.clear();
    pos2.x = -1;
    pos2.y = 1;
    col2.radius = 2;

    console.log('Check! Must true', ray1.isIntersect(col2));

    console.log('THREE');
    col2.clear();
    pos2.x = 3;
    pos2.y = 0;
    col2.radius = 1;

    console.log('Check! Must true', ray1.isIntersect(col2));

    console.log('FOUR');
    col2.clear();
    pos2.x = 3;
    pos2.y = 1;
    col2.radius = 1;

    console.log('Check! Must true', ray1.isIntersect(col2));

    console.log('FIVE');
    col2.clear();
    pos2.x = 3;
    pos2.y = 2;
    col2.radius = 1;

    console.log('Check! Must false', ray1.isIntersect(col2));

    console.log('SIX');
    col2.clear();
    pos2.x = 6;
    pos2.y = 1;
    col2.radius = 2;

    console.log('Check! Must true', ray1.isIntersect(col2));

    console.log('SEVEN');
    col2.clear();
    pos2.x = 6;
    pos2.y = 1;
    col2.radius = 1;

    console.log('Check! Must false', ray1.isIntersect(col2));
}
