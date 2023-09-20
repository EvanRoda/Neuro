let renderer;
let canvas;
const bots = {};

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
    .addReaction(Bot.waiting)

window.addEventListener('load', () => {
    console.log('page is fully loaded');

    initUI();
    createBots();
    renderer = new Renderer(canvas, WIDTH, HEIGHT, calculate, afterDraw);
    renderer.start();
});

function initUI() {
    canvas = document.getElementById("screen");
    canvas.addEventListener("click", (event) => {

    });
}

// Return list of Entities
function calculate(elapsedTime) {

    const entities = [];
    for (const uuid in bots) {
        const bot = bots[uuid];
        bot.evaluate();
        entities.push(bot);
    }

    return entities;
}

function afterDraw() {
    // Draw UI elements
}

function createBots() {
    for (const team of TEAMS) {
        for (let i = 0; i < BOTS_IN_TEAM; i++) {
            const brain = neuroFactory.make();
            const bot = new Bot(team, brain);
            bot.x = randomInt(WIDTH);
            bot.y = randomInt(HEIGHT);
            bot.direction = randomFloat(2 * Math.PI);
            bots[bot.uuid] = bot;
        }
    }
}