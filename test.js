
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

let world;
let animationId;
let needRedraw = true;
let canvas;
let ctx;
let hidden;
let hctx;
let pCanvas;
let pCtx;
let pHidden;
let pHCtx;
let counter;
let botsCounter;
let times;
let coefficient;
let renderToggle = true;
let playToggle = true;
let buttonRenderToggle;
let buttonPause;
let buttonStep;
let buttonRestart;
let selectedBotUuid = null;
let clone = null;
let selectedBotBinding = {};
let selectedNeuronData = null;
let botInfoContainer;
let logContainer;
let showLog;
let showLogToggle = false;
let showPerceptron;
let showPerceptronToggle = false;
let perceptronContainer;
let botPaintToggle = 0;         // 0 - basic
                                // 1 - flora/fauna
                                // 2 - energy
                                // 3 - clan (initialColor)
let buttonBotColor;
let buttonFloraFauna;
let buttonEnergy;
let buttonClanColor;

let buttonDayNight;
let dayNightPlayToggle = true;

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
const MAX_ENERGY = 500;
const HARD_MUTATE_DELAY = 5;
const SOFT_MUTATE_COUNT = 3;
const PERC_WIDTH = 469;
const PERC_HEIGHT = 330;

const NEURON_COLORS = {
    S: '#dcdcdc',
    A: '#d5f3a9',
    B: '#a6e7d4',
    C: '#ecbbeb',
    D: '#f6c8c8',
    E: '#e8df98',
    R: '#dcdcdc',
}


const builder = new NeuroBuilder();

builder
    .addSensor(DIRECTION_HANDLER)           // Rotation
    .addSensor(DEFAULT_HANDLER)             // Eyes 0-empty, ~0 = ally, ~1 = enemy
    .addSensor(LIGHT_HANDLER)               // Light
    .addSensor(ENERGY_HANDLER)              // Energy
    .addSensor(DIRECTION_HANDLER)           // Free cells around
    .addSensor(LIGHT_HANDLER)               // Light on step cell
    .addSensor(BALANCER_HANDLER)            // Balancer

    .addHiddenLayers(4, 6)

    .addReaction(Bot.rotateLeft)
    .addReaction(Bot.rotateRight)
    .addReaction(Bot.move)
    .addReaction(Bot.photo)
    .addReaction(Bot.multiply)
    .addReaction(Bot.attack)
    .addReaction(Bot.nothing)
    .addReaction(Bot.death)

window.addEventListener('load', () => {
    console.log('page is fully loaded');

    initUI();
    start();
    animRedraw();
});

function start() {
    world = new World(WORLD_WIDTH, WORLD_HEIGHT, builder);
}


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
    setDims(hidden, 1281, 961);

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
                hctx.fillStyle = "hsl(193, 100%, " + (90 - Math.floor(bot.energy * (60 / MAX_ENERGY))) + "%)";
                break;
            case 3:
                hctx.fillStyle = bot.initialColor;
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

function getNeuron(eventX, eventY) {
    if (!selectedBotUuid || !world.bots[selectedBotUuid]) return;

    const perceptron = world.bots[selectedBotUuid].brain;

    const wSpace = Math.floor(PERC_WIDTH / (perceptron.layers.length));
    let x = wSpace / 2;

    for (let i = 0, l = perceptron.layers.length; i < l; i++) {
        const layer = perceptron.layers[i];
        const hSpace = Math.floor(PERC_HEIGHT / (layer.size));
        let y = hSpace / 2;

        for (let j = 0, k = layer.size; j < k; j++) {
            const neuron = layer.elements[j];

            if ((x - eventX) ** 2 + (y - eventY) ** 2 < 400) {
                const relsIn = [];
                if (i > 0) {
                    const prevLayer = perceptron.layers[i - 1];
                    for (const n of prevLayer.elements) {
                        relsIn.push(n.relations[j]);
                    }
                }

                return {
                    uuid: neuron.uuid,
                    relationsIn: relsIn,
                    relationsOut: [...neuron.relations]
                };
            }
            y += hSpace;
        }
        x += wSpace;
    }
    return null;
}

function renderPerceptron() {
    setDims(pHidden, PERC_WIDTH, PERC_HEIGHT);
    if (!selectedBotUuid || !world.bots[selectedBotUuid]) return;

    const perceptron = world.bots[selectedBotUuid].brain;

    const wSpace = Math.floor(PERC_WIDTH / (perceptron.layers.length));
    let x = wSpace / 2;

    for (let i = 0, l = perceptron.layers.length; i < l; i++) {
        const layer = perceptron.layers[i];
        const hSpace = Math.floor(PERC_HEIGHT / (layer.size));
        let y = hSpace / 2;

        for (let j = 0, k = layer.size; j < k; j++) {
            const neuron = layer.elements[j];

            drawNeuron(neuron, x, y);
            y += hSpace;

            if (selectedNeuronData != null && neuron.uuid === selectedNeuronData.uuid) {
                drawRelations(i, x, wSpace);
            }

        }
        x += wSpace;
    }


}

function drawNeuron(neuron, x, y) {
    const label = neuron.type + ":" + neuron.calculatedValue.toFixed(2);
    const temp = document.createElement("canvas");
    const tempCtx = temp.getContext('2d');
    setDims(temp, 44, 22);

    tempCtx.roundRect(2, 1, 40, 20, 10);
    tempCtx.fillStyle = NEURON_COLORS[neuron.type];
    tempCtx.strokeStyle = '#777777';
    if (selectedNeuronData != null && neuron.uuid === selectedNeuronData.uuid) {
        tempCtx.strokeStyle = '#f13838';
    }
    tempCtx.fill();
    tempCtx.stroke();

    tempCtx.textAlign = 'start';
    tempCtx.fillStyle = 'black';
    tempCtx.fillText(label, 8, 15);

    pHCtx.drawImage(temp, x - 22, y - 11);

}

function drawRelations(layerIndex, x, wSpace) {
    if (selectedNeuronData == null) return;
    const temp = document.createElement("canvas");
    const tempCtx = temp.getContext('2d');

    if (selectedNeuronData.relationsIn.length > 0) {
        setDims(temp, 30, PERC_HEIGHT);
        tempCtx.font = '14px monospace'
        const hSpace = Math.floor(PERC_HEIGHT / selectedNeuronData.relationsIn.length);
        let y = hSpace / 2;

        for (let i = 0, l = selectedNeuronData.relationsIn.length; i < l; i++) {
            tempCtx.fillText(selectedNeuronData.relationsIn[i] + '', 2, y + 4);
            y += hSpace;
        }

        pHCtx.drawImage(temp, x - wSpace + 20, 0);
    }

    if (selectedNeuronData.relationsOut.length > 0) {
        setDims(temp, 30, PERC_HEIGHT);
        tempCtx.font = '14px monospace'
        const hSpaceOut = Math.floor(PERC_HEIGHT / selectedNeuronData.relationsOut.length);
        let y = hSpaceOut / 2;

        for (let i = 0, l = selectedNeuronData.relationsOut.length; i < l; i++) {

            tempCtx.fillText(selectedNeuronData.relationsOut[i] + '', 2, y + 4);
            y += hSpaceOut;
        }

        pHCtx.drawImage(temp, x + wSpace - 50, 0);
    }
}

function redrawPerceptron() {
    setDims(pCanvas, PERC_WIDTH, PERC_HEIGHT);
    pCtx.drawImage(pHidden, 0, 0);
}

function renderLog() {
    let log = "<p>" + selectedBotBinding.log.length + "</p>";
    selectedBotBinding.log.forEach(str => {
        log += "<p>" + str + "</p>";
    })
    logContainer.innerHTML = log;
}


function redraw() {
    setDims(canvas, 1281, 961);
    ctx.drawImage(hidden, 0, 0);
}

function setDims(canvas, w, h) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px"
}

function getTimes() {
    const t = world.dayTime % 4000;
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
    world.age++;
    if (dayNightPlayToggle) {
        world.dayTime++;
    }
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

    counter.innerText = world.age;
    botsCounter.innerText = Object.keys(world.bots).length;

    times.innerText = getTimes();
    coefficient.innerText = world.seasonLightCoef.toFixed(2);
    renderBot();
    if (selectedBotUuid && world.bots[selectedBotUuid] && showPerceptronToggle) {
        renderPerceptron();
        redrawPerceptron();
    }
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
            buttonPause.innerHTML = "<i class=\"las la-pause\"></i>";
        } else {
            buttonPause.innerHTML = "<i class=\"las la-play\"></i>";
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

    buttonClanColor = document.getElementById("clanColorsButton");
    buttonClanColor.addEventListener('click', () => {
        botPaintToggle = 3;
        draw();
    });
    buttonBotColor = document.getElementById("botColorsButton");
    buttonBotColor.addEventListener('click', () => {
        botPaintToggle = 0;
        draw();
    });
    buttonFloraFauna = document.getElementById("floraFaunaButton");
    buttonFloraFauna.addEventListener('click', () => {
        botPaintToggle = 1;
        draw();
    });
    buttonEnergy = document.getElementById("energyButton");
    buttonEnergy.addEventListener('click', () => {
        botPaintToggle = 2;
        draw();
    });

    buttonDayNight = document.getElementById("dayNightButton");
    buttonDayNight.addEventListener('click', () => {
        dayNightPlayToggle = !dayNightPlayToggle;

        if (dayNightPlayToggle) {
            buttonDayNight.innerHTML = "<i class=\"las la-pause\"></i>";
        } else {
            buttonDayNight.innerHTML = "<i class=\"las la-play\"></i>";
        }
    });

    buttonRestart = document.getElementById("restartButton");
    buttonRestart.addEventListener('click', () => {
        start();
        draw();
    });

    showLog = document.getElementById("showLog");
    showLog.addEventListener('click', () => {
        showLogToggle = !showLogToggle
        showPerceptronToggle = false;
        onChangeLogToggle();
        onChangePerceptronToggle();
    });

    showPerceptron = document.getElementById("showPerceptron");
    showPerceptron.addEventListener('click', () => {
        showPerceptronToggle = !showPerceptronToggle
        showLogToggle = false;
        onChangeLogToggle();
        onChangePerceptronToggle();
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
    perceptronContainer = document.getElementById("perceptronContainer");
    botInfoContainer = document.getElementById("botInfoContainer");

    canvas = document.getElementById("screen");
    canvas.addEventListener("click", (event) => {
        const cell = world.getCell(Math.floor(event.offsetX / 10) , Math.floor(event.offsetY / 10));
        console.log(cell.x, cell.y);
        if (!cell.isFree()) {
            console.log(cell.bot);
            selectedBotUuid = cell.bot.uuid;
            clone = new Bot(cell.bot.brain.copy(), 128, cell, cell.bot.initialColor, cell.bot.r, cell.bot.g, cell.bot.b);
            showLogToggle = false;
            showPerceptronToggle = false;
            onChangeLogToggle();
            onChangePerceptronToggle();
            botInfoContainer.classList.remove("hidden");
            takeACopy(cell.bot);
            renderBot()
        } else {
            selectedBotUuid = null;
            botInfoContainer.classList.add("hidden");
            // const child = new Bot(clone.brain.copy(), 128, cell, clone.r, clone.g, clone.b);
            // cell.come(child);
            //
            // world.newBots.push(child);
        }

        if (selectedBotUuid && world.bots[selectedBotUuid]) {
            renderPerceptron();
            redrawPerceptron();
        }
    });

    ctx = canvas.getContext("2d");

    hidden = document.createElement("canvas");
    hctx = hidden.getContext("2d");
    hctx.strokeStyle = "white";

    pCanvas = document.getElementById("p-view");
    pCanvas.addEventListener("click", (event) => {
        console.log(event.offsetX, event.offsetY);
        selectedNeuronData = getNeuron(event.offsetX, event.offsetY);
        console.log(selectedNeuronData);
    });

    pCtx = pCanvas.getContext("2d");
    pHidden = document.createElement("canvas");
    pHCtx = pHidden.getContext("2d");
    pHCtx.strokeStyle = "white";
}

function onChangeLogToggle() {
    if (showLogToggle) {
        showLog.classList.add("pressed");
        logContainer.classList.remove("hidden");
        renderLog();
    } else {
        showLog.classList.remove("pressed");
        logContainer.classList.add("hidden");
    }
}

function onChangePerceptronToggle() {
    if (showPerceptronToggle) {
        showPerceptron.classList.add("pressed");
        perceptronContainer.classList.remove("hidden");
    } else {
        showPerceptron.classList.remove("pressed");
        perceptronContainer.classList.add("hidden");
    }
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











