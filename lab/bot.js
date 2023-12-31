class Bot {
    uuid;
    color;
    initialColor;
    colorInt;
    brain;

    cell;
    direction;
    energy;
    age;
    mutateCounter = 0;
    reactionLog = [];
    isDead = false;

    r = 128;
    g = 128;
    b = 128;

    reactions = [
        Bot.rotateLeft,
        Bot.rotateRight,
        Bot.move,
        Bot.photo,
        Bot.multiply,
        Bot.attack,
        Bot.nothing,
        Bot.death,
    ];

    constructor(brain, energy, cell, initialColor, r, g, b) {
        this.uuid = generateUUID();
        this.direction = randomInt(8);
        this.energy = energy;
        this.colorInt = stringToColorInt(brain.getHash());
        this.color = getColor(this.colorInt);
        this.brain = brain;
        this.cell = cell;
        this.age = 0;
        this.initialColor = initialColor;

        if (initialColor == null) {
            this.initialColor = this.color;
        }

        this.r = r;
        this.g = g;
        this.b = b;
    }

    clone() {
        return new Bot(this.brain.copy(), 128, null, this.initialColor, this.r, this.g, this.b);
    }

    decreaseEnergy(value) {
        this.energy -= value;
    }

    moveTo(stepCell) {
        this.cell.leave(this);
        stepCell.come(this);
        this.cell = stepCell;
    }

    die() {
        this.isDead = true;
    }

    checkColor() {
        this.colorInt = stringToColorInt(this.brain.getHash());
    }

    evaluate() {
        let stepCell = this.cell.world.getStepCell(this.direction, this.cell.x, this.cell.y);
        let eye;
        if (stepCell.isFree()) {
            eye = 0;
        } else {
            eye = friendOrFoe(this.brain.getHash(), stepCell.bot.brain.getHash()) + 0.001;
        }

        const freeCellsCount = this.cell.world.findFreeCells(this.cell.x, this.cell.y).length;

        this.age += 1;

        const reactionIndex = this.brain.run([this.direction, eye, this.cell.getLight(), this.energy, freeCellsCount, stepCell.getLight()]);
        const reaction = this.reactions[reactionIndex];
        this.reactionLog.push(reaction(this));
    }

    // reactions
    static rotateLeft(self) {
        if (self.energy <= 0) return "Rotate: No energy";

        self.direction -= 1;
        if (self.direction === -1) {
            self.direction = 7;
        }

        self.decreaseEnergy(1);
        return "Rotate left" + self.direction;
    };

    static rotateRight(self) {
        if (self.energy <= 0) return "Rotate: No energy";

        self.direction += 1;
        if (self.direction === 8) {
            self.direction = 0;
        }
        self.decreaseEnergy(1);
        return "Rotate right" + self.direction;
    };

    static move(self) {
        if (self.energy <= 0) return "Move: No energy";
        self.decreaseEnergy(1);

        const stepCell = self.cell.world.getStepCell(self.direction, self.cell.x, self.cell.y);

        if (!stepCell.isFree()) return "Move: No free cell";

        self.moveTo(stepCell);


        return "Move to: (" + stepCell.x + ", " + stepCell.y + ")"
    };

    static photo(self) {
        if (self.energy <= 0) return "Photo: No energy";
        self.decreaseEnergy(0.4);
        const income = self.cell.getLight() / 100;
        self.energy += income;

        if (self.energy > MAX_ENERGY) {
            self.energy = -MAX_ENERGY;
        }

        self.r -= income;
        if (self.r < 0) {
            self.r = 0;
        }

        self.g += income;
        if (self.g > 255) {
            self.g = 255;
        }

        return "Photo: " + income;
    };

    static multiply(self) {
        self.decreaseEnergy(1);
        if (self.energy < 2) return "Multiply: No energy";

        const freeCells = self.cell.world.findFreeCells(self.cell.x, self.cell.y);

        if (freeCells.length > 4) {
            const freeCell = self.cell.world.getRandomCell(freeCells);
            self.energy = self.energy / 2;
            const child = new Bot(self.brain.copy(), self.energy, freeCell, self.initialColor, self.r, self.g, self.b);

            if (self.mutateCounter === HARD_MUTATE_DELAY) {
                self.mutateCounter = 0;
                child.brain.hardMutate();
            } else {
                for (let i = 0; i < SOFT_MUTATE_COUNT; i++) {
                    child.brain.mutate();
                }
                child.brain.mutate();
                self.mutateCounter++;
            }

            // Change color after mutate
            child.checkColor();

            freeCell.come(child);

            self.cell.world.newBots.push(child);
            return "Multiply";
        } else if (freeCells.length === 0) {
            self.energy = -MAX_ENERGY;
            return "Multiply: No free cell";
        } else {
            return "Multiply: Not enough free cells";
        }
    };

    static attack(self) {
        if (self.energy <= 0) return "Attack: No energy";

        const stepCell = self.cell.world.getStepCell(self.direction, self.cell.x, self.cell.y);
        self.decreaseEnergy(0.5);
        if (!stepCell.isFree() && stepCell.bot.energy > 0) {
            const income = stepCell.bot.energy;
            stepCell.bot.energy = 0;
            self.energy += income;
            if (self.energy > MAX_ENERGY) {
                self.energy = -MAX_ENERGY;
            }

            self.g -= income;
            if (self.g < 0) {
                self.g = 0;
            }

            self.r += income;
            if (self.r > 255) {
                self.r = 255;
            }

            stepCell.bot.die()
            return "Attack: +" + income + " energy";
        }

        return "Attack: Nobody to attack";
    };

    static nothing(self) {
        self.decreaseEnergy(0.1);
        return "Nothing: Success";
    }

    static death(self) {
        self.die();
        return "Death: Success";
    }
}