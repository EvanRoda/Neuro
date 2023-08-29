class Cell {
    world;
    x;
    y;
    light = 0;      // From 0 to 100

    bot = null;

    constructor(world, x, y, light) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.light = light;
    }

    isFree() {
        return this.bot == null;
    }

    leave(bot) {
        if (bot === this.bot) {
            this.bot = null;
        } else {
            console.warn("Bot tried to clear the wrong cell");
        }
    }

    come(bot) {
        if (this.bot == null) {
            this.bot = bot;
        } else {
            console.warn("Bot tried to move to an occupied cell");
        }
    }

    getLight() {
        return this.light * this.world.seasonLightCoef;
    }
}

class World {
    width = 0;
    height = 0;
    botBuilder = null;
    cells = [];
    bots = {};
    newBots = [];
    deathNote = [];
    age = 2000;
    seasonLightCoef = 1;

    constructor(width, height, botBuilder) {
        this.width = width;
        this.height = height;
        this.botBuilder = botBuilder;

        this.generate();
    }

    generate() {
        const size = this.width * this.height;
        for (let i = 0; i < size; i++) {
            const y = Math.floor(i / this.width);
            this.cells[i] = new Cell(this, i % this.width, y, Math.floor(100 * (this.height - y) / this.height));
            if (Math.random() < 0.2) {
                const bot = new Bot(this.botBuilder.build(), 100, this.cells[i], 128, 128, 128);
                this.bots[bot.uuid] = bot;
                this.cells[i].come(bot);
            }
        }
    }

    getCell(x, y) {
        const normalX = (x < 0 ? this.width + x : x) % this.width;
        const normalY = (y < 0 ? this.height + y : y) % this.height;

        return this.cells[this.width * normalY + normalX];
    }

    getStepCell(direction, x, y) {
        switch (direction) {
            case 0:
                return this.getCell(x, y - 1);
            case 1:
                return this.getCell(x + 1, y - 1);
            case 2:
                return this.getCell(x + 1, y);
            case 3:
                return this.getCell(x + 1, y + 1);
            case 4:
                return this.getCell(x, y + 1);
            case 5:
                return this.getCell(x - 1, y + 1);
            case 6:
                return this.getCell(x - 1, y);
            case 7:
                return this.getCell(x - 1, y - 1);
            default:
                throw new Error("Undefined direction: " + direction);
        }
    }

    findFreeCell(x, y) {
        const cells = [];
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                const cell = this.getCell(x + dx, y + dy);
                if (cell.isFree()) {
                    cells.push(cell);
                }
            }
        }

        return cells[randomInt(cells.length)] || null;
    }

    findFreeCells(x, y) {
        const cells = [];
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                const cell = this.getCell(x + dx, y + dy);
                if (cell.isFree()) {
                    cells.push(cell);
                }
            }
        }

        return cells;
    }

    getRandomCell(cells) {
        return cells[randomInt(cells.length)] || null;
    }

    calcSeasonLightCoef() {
        // this.seasonLightCoef = 1;

        const a = this.age % 4000;
        const season =  Math.floor(this.age / 1000) % 4;
        switch (season) {
            case 0:
                this.seasonLightCoef = 0.00025 * a + 0.25;
                break;
            case 1:
                this.seasonLightCoef = 0.0005 * a;
                break;
            case 2:
                this.seasonLightCoef = 1;
                break;
            case 3:
                this.seasonLightCoef = -0.00075 * a + 3.25;
        }
    }
}

