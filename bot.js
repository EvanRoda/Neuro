class Bot {
    uuid;
    color;
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

    constructor(colorInt, brain, energy, cell, r, g, b) {
        this.uuid = generateUUID();
        this.direction = randomInt(8);
        this.energy = energy;
        this.colorInt = colorInt;
        this.color = getColor(this.colorInt);
        this.brain = brain;
        this.cell = cell;
        this.age = 0;
        this.r = r;
        this.g = g;
        this.b = b;
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

    evaluate() {
        let stepCell = this.cell.world.getStepCell(this.direction, this.cell.x, this.cell.y);
        let eye;
        if (stepCell.isFree()) {
            eye = 0;
        } else {
            eye = stepCell.bot.colorInt === this.colorInt? 1 : 2;
        }

        const freeCellsCount = this.cell.world.findFreeCells(this.cell.x, this.cell.y).length;

        this.age += 1;

        const reaction = this.brain.run(this.direction, eye, this.cell.getLight(), this.energy, freeCellsCount, stepCell.getLight());
        this.reactionLog.push(reaction(this));
    }

    // reactions
    static rotate(self) {
        if (self.energy <= 0) return "Rotate: No energy";

        self.decreaseEnergy(.12);
        self.direction = randomInt(8);
        return "Rotate " + self.direction;
    };

    static move(self) {
        if (self.energy <= 0) return "Move: No energy";

        const stepCell = self.cell.world.getStepCell(self.direction, self.cell.x, self.cell.y);
        self.decreaseEnergy(0.25);
        if (!stepCell.isFree()) return "Move: No free cell";

        self.moveTo(stepCell);

        return "Move to: (" + stepCell.x + ", " + stepCell.y + ")"
    };

    static photo(self) {
        if (self.energy <= 0) return "Photo: No energy";

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
        if (self.energy < 10) return "Multiply: No energy";

        const freeCells = self.cell.world.findFreeCells(self.cell.x, self.cell.y);

        if (freeCells.length > 4) {
            const freeCell = self.cell.world.getRandomCell(freeCells);
            self.energy = self.energy / 2;
            const child = new Bot(self.colorInt, self.brain.copy(), self.energy, freeCell, self.r, self.g, self.b);

            if (self.mutateCounter === MUTATE_COUNT) {
                self.mutateCounter = 0;
                child.brain.hardMutate();
                // child.colorInt = changeColorInt(child.colorInt);
                // child.color = getColor(child.colorInt);
            } else {
                child.brain.mutate();
                self.mutateCounter++;
            }

            // if (Math.random() > 0.8) {
            //     child.brain.hardMutate();
            //     // child.colorInt = changeColorInt(child.colorInt);
            //     // child.color = getColor(child.colorInt);
            // } else {
            //     child.brain.mutate();
            // }

            freeCell.come(child);

            self.cell.world.newBots.push(child);
            self.decreaseEnergy(1);
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
        self.decreaseEnergy(1);
        if (!stepCell.isFree() && stepCell.bot.energy > 0) {
            const income = 1 * stepCell.bot.energy;
            self.energy += income;
            if (self.energy > MAX_ENERGY) {
                self.energy = MAX_ENERGY;
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

    static death(self) {
        self.die();
        return "Death: Success";
    }
}