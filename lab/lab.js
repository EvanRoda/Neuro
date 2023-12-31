let world;
let animationId;
let needRedraw = true;
let canvas;
let ctx;
let hidden;
let hctx;
let pCanvas;
let perceptronRenderer;
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
let buttonClear;
let selectedBotUuid = null;
let clone = null;
let selectedBotBinding = {};
let botInfoContainer;
let buttonCloseBot;
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

const storage = [null, null, null, null, null, null];
const buttonBox = [null, null, null, null, null, null];
const buttonEmpty = [null, null, null, null, null, null];
let buttonPaint;
let paintingToggle = false;
let mousePressed = false;

function initStorageUI() {
    buttonPaint = document.getElementById("paintButton");
    buttonPaint.addEventListener('click', () => {
        paintingToggle = !paintingToggle;
        onChangePaintingToggle();
    });

    for (let i = 0; i < 6; i++) {
        buttonBox[i] = document.getElementById(`boxButton${i}`);
        buttonBox[i].addEventListener('click', () => {
            onStorageClick(i);
            storageBoxRedraw(i);
        });

        buttonEmpty[i] = document.getElementById(`emptyButton${i}`);
        buttonEmpty[i].addEventListener('click', () => {
            emptyBox(i);
            storageBoxRedraw(i);
        });
    }
}

function onStorageClick(boxIndex) {
    if (storage[boxIndex] === null) {
        if (selectedBotUuid != null) {
            storage[boxIndex] = clone.clone();
        }
    } else {
        clone = storage[boxIndex].clone();
        takeACopy(clone);
    }
}

function storageBoxRedraw(boxIndex) {
    if (storage[boxIndex] === null) {
        buttonBox[boxIndex].style['background-color'] = '#adadad';
        buttonBox[boxIndex].style['color'] = '#575757';
    } else {
        buttonBox[boxIndex].style['background-color'] = storage[boxIndex].color;
        buttonBox[boxIndex].style['color'] = 'aliceblue';
    }
}

function emptyBox(boxIndex) {
    storage[boxIndex] = null;
}

function onChangePaintingToggle() {
    if (paintingToggle) {
        buttonPaint.classList.add("pressed");
    } else {
        buttonPaint.classList.remove("pressed");
    }
}

const builder = new NeuroBuilder();

builder
    .addSensor({type: "V", maxValue: 7})           // Rotation
    .addSensor({type: "F"})              // Eyes 0-empty, ~0 = ally, ~1 = enemy
    .addSensor({type: "V", maxValue: 100})         // Light
    .addSensor({type: "V", maxValue: MAX_ENERGY})  // Energy
    .addSensor({type: "V", maxValue: 7})           // Free cells around
    .addSensor({type: "V", maxValue: 7})           // Light on step cell
    .addSensor({type: "D"})              // Balancer

    .addHiddenLayers(4, 6)

    .addReactionLayer(8);

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
        coords: bot.cell != null ? "(" + bot.cell.x + ", " + bot.cell.y + ")" : "(N/A, N/A)",
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
    if (selectedBotUuid == null && clone == null) return;

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
        perceptronRenderer.draw();
    }
}

function oneStep() {
    calculate();
    draw();
}

function onChangePlayToggle() {
    buttonStep.disabled = playToggle;

    if (playToggle) {
        buttonPause.innerHTML = "<i class=\"las la-pause\"></i>";
    } else {
        buttonPause.innerHTML = "<i class=\"las la-play\"></i>";
    }
}

function initUI() {
    buttonPause = document.getElementById("pauseButton");
    buttonPause.addEventListener("click", () => {
        playToggle = !playToggle;
        onChangePlayToggle();
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

    buttonClear = document.getElementById("clearButton");
    buttonClear.addEventListener('click', () => {
        world.newBots = [];
        for (const uuid in world.bots) {
            world.bots[uuid].isDead = true;
        }
    });

    buttonCloseBot = document.getElementById("closeBotButton");
    buttonCloseBot.addEventListener('click', () => {
        hideBotInfo()
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
        if (paintingToggle) {
            onPaintingMode(event);
        } else {
            onNormalMode(event);
        }
    });

    canvas.addEventListener("mousedown", () => {
        mousePressed = true;
    });

    window.addEventListener('mouseup', () => {
        mousePressed = false;
    })

    canvas.addEventListener('mousemove', (event) => {
        if (mousePressed && paintingToggle) {
            onPaintingMode(event);
        }
    });

    ctx = canvas.getContext("2d");

    hidden = document.createElement("canvas");
    hctx = hidden.getContext("2d");
    hctx.strokeStyle = "white";

    pCanvas = document.getElementById("p-view");
    initStorageUI();
}

function onNormalMode(event) {
    const cell = world.getCell(Math.floor(event.offsetX / 10) , Math.floor(event.offsetY / 10));
    console.log(cell.x, cell.y);
    if (!cell.isFree()) {
        console.log(cell.bot);
        selectedBotUuid = cell.bot.uuid;
        clone = cell.bot.clone();
        const string = clone.brain.toJson();
        console.log(string);
        const newBrain = Perceptron.fromJson(string);
        console.log(newBrain);
        cell.bot.brain = newBrain;
        perceptronRenderer = new PerceptronRenderer(cell.bot.brain, pCanvas, PERC_WIDTH, PERC_HEIGHT);
        showLogToggle = false;
        showPerceptronToggle = false;
        onChangeLogToggle();
        onChangePerceptronToggle();
        botInfoContainer.classList.remove("hidden");
        takeACopy(cell.bot);
        renderBot()
    } else {
        hideBotInfo()
    }

    if (selectedBotUuid && world.bots[selectedBotUuid]) {
        perceptronRenderer.draw()
    }
}

function hideBotInfo() {
    selectedBotUuid = null;
    clone = null;
    botInfoContainer.classList.add("hidden");
}

function onPaintingMode(event) {
    const cell = world.getCell(Math.floor(event.offsetX / 10) , Math.floor(event.offsetY / 10));

    if (cell.isFree()) {
        const child = clone.clone();
        child.initialColor = child.color;
        cell.come(child);
        child.cell = cell;
        world.bots[child.uuid] = child;
        draw();
    }
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











