/**
 *
 *
 * */


/**
 * X
 * Y
 * Rotate (8 direction)
 *      7 0 1
 *      6 + 2
 *      5 4 3
 * eyes (0-nothing, 1-other bot)
 * geom difference (check bot on view sight)
 * light
 * energy
 *
 * */


/**
 * Actions
 *
 * rotate (does not waste energy )
 * move (one of 8 directions)
 * photosynthesis
 * multiply
 * attack
 *
 * */

let animationId;
let needRedraw = true;
let canvas;
let ctx;
let hidden;
let hctx;
let counter;
let botsCounter;
let times;
let coefficient;
let renderToggle = true;
let playToggle = true;
let buttonRenderToggle;
let buttonPause;
let buttonStep;
let selectedBotUuid = null;
let clone = null;
let selectedBotBinding = {};
let logContainer;
let showLog;
let showLogToggle = false;
let botPaintToggle = 0;         // 0 - basic
                                // 1 - flora/fauna
                                // 2 - energy
let buttonBotPaint;

let alive;
let genome;
let uuid;
let age;
let energy;
let mutateCounter;
let coord;
let rgb;

const WORLD_WIDTH = 128;
const WORLD_HEIGHT = 96;
const MAX_ENERGY = 250;
const HARD_MUTATE_DELAY = 3;
const SOFT_MUTATE_COUNT = 3;

const builder = new NeuroBuilder();

builder
    .addSensor(ROTATION_HANDLER)            // Rotation
    .addSensor(DEFAULT_HANDLER)             // Eyes 0-empty, ~0 = ally, ~1 = enemy
    .addSensor(LIGHT_HANDLER)               // Light
    .addSensor(ENERGY_HANDLER)              // Energy
    .addSensor(FREE_CELLS_HANDLER)          // Free cells around
    .addSensor(LIGHT_ON_STEP_CELL_HANDLER)  // Light on step cell
    .addSensor(BALANCER_HANDLER)            // Balancer

    .addHiddenLayers(4, 8)

    .addReaction(Bot.rotateLeft)
    .addReaction(Bot.rotateRight)
    .addReaction(Bot.move)
    .addReaction(Bot.photo)
    .addReaction(Bot.multiply)
    .addReaction(Bot.attack)
    .addReaction(Bot.nothing)
    .addReaction(Bot.death)


const world = new World(WORLD_WIDTH, WORLD_HEIGHT, builder);


window.addEventListener('load', () => {
    console.log('page is fully loaded');

    initUI();
    animRedraw();
});

function takeACopy(bot) {
    if (bot == null || bot.isDead) {
        selectedBotBinding.dead = true;
        return;
    }

    selectedBotBinding = {
        dead: false,
        genome: bot.brain.hash,
        color: bot.color,
        uuid: bot.uuid,
        age: bot.age,
        energy: bot.energy,
        mutateCounter: bot.mutateCounter,
        coords: "(" + bot.cell.x + ", " + bot.cell.y + ")",
        rgb: "(" + bot.r.toFixed(0) + ", " + bot.g.toFixed(0) + "," + bot.b.toFixed(0) + ")",
        log: bot.reactionLog,
    }
}

function evaluate() {
    const uuids = Object.keys(world.bots);
    for (let i = 0, l = uuids.length; i < l; i++) {
        const uuid = uuids[i];
        const bot = world.bots[uuid];

        if (selectedBotUuid === uuid) {
            takeACopy(bot);
        }

        if (bot == null) {
            continue;
        }

        if (bot.isDead) {
            world.deathNote.push(bot.uuid);
            continue;
        }

        bot.evaluate();

        if (bot.energy <= 0) {
            bot.isDead = true;
            world.deathNote.push(bot.uuid);
        }
    }

    // for (const uuid in world.bots) {
    //     const bot = world.bots[uuid];
    //
    //     if (selectedBotUuid === uuid) {
    //         takeACopy(bot);
    //     }
    //
    //     if (bot == null) {
    //         continue;
    //     }
    //
    //     if (bot.isDead) {
    //         world.deathNote.push(bot.uuid);
    //         continue;
    //     }
    //
    //     bot.evaluate();
    //
    //     if (bot.energy <= 0) {
    //         bot.isDead = true;
    //         world.deathNote.push(bot.uuid);
    //     }
    // }
}

function addNewBots() {
    world.newBots.forEach(bot => {
        world.bots[bot.uuid] = bot;
    });
    world.newBots = [];
}

function removeDeadBots() {
    for (let i = 0, n = world.deathNote.length; i < n; i++) {
        const uuid = world.deathNote[i];

        if (uuid === selectedBotUuid) {
            selectedBotBinding.dead = true;
        }

        const bot = world.bots[uuid];

        if (!bot) continue;

        bot.cell.leave(bot);
        bot.cell = null;
        delete world.bots[uuid];
    }
    world.deathNote = [];
}

function render() {
    setDims(hidden);

    for (const uuid in world.bots) {
        const bot = world.bots[uuid];

        if (bot == null) continue;

        switch (botPaintToggle) {
            case 0:
                hctx.fillStyle = bot.color;
                break;
            case 1:
                hctx.fillStyle = "rgb(" + bot.r + ", " + bot.g + "," + bot.b + ")";
                break;
            case 2:
                hctx.fillStyle = "hsl(193, 100%, " + (90 - Math.floor(bot.energy * 0.24)) + "%)";
                break;
        }

        hctx.fillRect(bot.cell.x * 10 + 1, bot.cell.y * 10 + 1, 9, 9);

        if (bot.uuid === selectedBotUuid) {
            hctx.strokeStyle = "red";
            hctx.strokeWidth = "1px";
            hctx.strokeRect(bot.cell.x * 10, bot.cell.y * 10, 11, 11);
        }
    }
}

function renderBot() {
    if (selectedBotUuid == null) return;

    if (selectedBotBinding.dead) {
        alive.innerText = "Dead";
        alive.style.color = "red";
    } else {
        alive.innerText = "Alive";
        alive.style.color = "green";
    }

    genome.style.color = selectedBotBinding.color;

    genome.innerText = selectedBotBinding.genome;
    uuid.innerText = selectedBotBinding.uuid;
    age.innerText = selectedBotBinding.age;
    energy.innerText = selectedBotBinding.energy.toFixed(1);
    mutateCounter.innerText = selectedBotBinding.mutateCounter;
    coord.innerText = selectedBotBinding.coords;
    rgb.innerText = selectedBotBinding.rgb;
}

function renderLog() {
    let log = "<p>" + selectedBotBinding.log.length + "</p>";
    selectedBotBinding.log.forEach(str => {
        log += "<p>" + str + "</p>";
    })
    logContainer.innerHTML = log;
}


function redraw() {
    setDims(canvas);
    ctx.drawImage(hidden, 0, 0);
}

function setDims(canvas) {
    canvas.width = 1281;
    canvas.height = 961;
    canvas.style.width = "1281px";
    canvas.style.height = "961px"
}

function getTimes() {
    const t = world.age % 4000;
    if (t > 3000) {
        return "Вечер";
    } else if (t > 2000) {
        return "День";
    } else if (t > 1000) {
        return "Утро";
    } else {
        return "Ночь";
    }
}

function calculate() {
    world.calcSeasonLightCoef();
    addNewBots();
    evaluate();
    removeDeadBots();
}

function draw() {
    if (renderToggle) {
        render();
        redraw();
    }

    counter.innerText = world.age++;
    botsCounter.innerText = Object.keys(world.bots).length;

    times.innerText = getTimes();
    coefficient.innerText = world.seasonLightCoef.toFixed(2);
    renderBot();
}

function oneStep() {
    calculate();
    draw();
}

function initUI() {
    buttonPause = document.getElementById("pauseButton");
    buttonPause.addEventListener("click", () => {
        playToggle = !playToggle;
        buttonStep.disabled = playToggle;

        if (playToggle) {
            buttonPause.innerHTML = "<i class=\"fa-solid fa-pause\"></i>";
        } else {
            buttonPause.innerHTML = "<i class=\"fa-solid fa-play\"></i>";
        }
    });

    buttonRenderToggle = document.getElementById("renderToggle");
    buttonRenderToggle.addEventListener('click', () => {
        renderToggle = !renderToggle;
    });

    buttonStep = document.getElementById("stepButton");
    buttonStep.addEventListener('click', () => {
        oneStep();
    });


    buttonBotPaint = document.getElementById("paintBotButton");
    buttonBotPaint.addEventListener('click', () => {
        botPaintToggle++;

        if (botPaintToggle === 3) {
            botPaintToggle = 0;
        }
    });

    showLog = document.getElementById("showLog");
    showLog.addEventListener('click', () => {
        showLogToggle = !showLogToggle
        if (showLogToggle) {
            logContainer.classList.remove("hidden");
            renderLog();
        } else {
            logContainer.classList.add("hidden");
        }
    });


    counter = document.getElementById("counter");
    botsCounter = document.getElementById("bots-counter");
    times = document.getElementById("times");
    coefficient = document.getElementById("coefficient");

    alive = document.getElementById("alive");
    genome = document.getElementById("genome");
    uuid = document.getElementById("uuid");
    age = document.getElementById("age");
    energy = document.getElementById("energy");
    mutateCounter = document.getElementById("mutateCounter");
    coord = document.getElementById("coord");
    rgb = document.getElementById("rgb");
    logContainer = document.getElementById("logContainer");

    canvas = document.getElementById("screen");
    canvas.addEventListener("click", (event) => {
        const cell = world.getCell(Math.floor(event.offsetX / 10) , Math.floor(event.offsetY / 10));
        console.log(cell.x, cell.y);
        if (!cell.isFree()) {
            console.log(cell.bot);
            selectedBotUuid = cell.bot.uuid;
            clone = new Bot(cell.bot.brain.copy(), 128, cell, cell.bot.r, cell.bot.g, cell.bot.b);
            showLogToggle = false;
            logContainer.classList.add("hidden");
            takeACopy(cell.bot);
            renderBot()
        } else {
            const child = new Bot(clone.brain.copy(), 128, cell, clone.r, clone.g, clone.b);
            cell.come(child);

            world.newBots.push(child);
        }
    });

    ctx = canvas.getContext("2d");

    hidden = document.createElement("canvas");
    hctx = hidden.getContext("2d");
    hctx.strokeStyle = "white";
}

function animRedraw() {
    if (playToggle) {
        calculate()
    }

    animationId = window.requestAnimationFrame(animRedraw);
    if (!needRedraw) return;

    needRedraw = false;
    if (playToggle) {
        draw();
    }

    needRedraw = true;
}











