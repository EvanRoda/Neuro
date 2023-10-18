const TIME_OF_ROUND = 15000;

class LearningController {
    static _instance;
    static getInstance() {
        if (!LearningController._instance) {
            LearningController._instance = new LearningController();
        }

        return LearningController._instance;
    }

    roundTime;
    roundNumber;
    cache;

    constructor() {
        this.roundTime = 0;
        this.roundNumber = 1;
        this.cache = [];
    }

    tick(elapsedTime) {
        this.roundTime += elapsedTime;
    }

    deadInCache() {
        const objects = EntityController.getAll();

        for (const uuid in objects) {
            const entity = objects[uuid];
            if (entity.mustRemove) {
                if (entity instanceof Bot) {
                    this.cache.push({
                            uuid: entity.uuid,
                            team: entity.getComponent(FriendFoeComponent).team,
                            score: entity.getComponent(LearningComponent).score,
                            cerebellum: entity.getComponent(NeuroComponent).cerebellum.copy(),
                            brain: entity.getComponent(NeuroComponent).brain.copy(),
                        });
                }

            }
        }
    }

    mutateBrains() {
        for (const element of this.cache) {
            const brain = element.brain.copy();
            const cerebellum = element.cerebellum.copy();
            const bot = new Bot(element.team, brain, cerebellum);
            const learn = bot.getComponent(LearningComponent);
            learn.score = element.score;
            const position = bot.getComponent(PositionComponent);
            position.x = randomInt(WIDTH);
            position.y = randomInt(HEIGHT);
            position.direction = randomFloat(2 * Math.PI);
        }

        const objects = EntityController.getAll();
        const teams = {}
        for (const uuid in objects) {
            const entity = objects[uuid];
            if (entity instanceof Bot) {
                const team = entity.getComponent(FriendFoeComponent).team;
                if (!teams[team]) {
                    teams[team] = [];
                }
                teams[team].push(entity);
            }
        }

        for (const team in teams) {
            teams[team].sort((a, b) => {
                return b.getComponent(LearningComponent).score - a.getComponent(LearningComponent).score}
            )

            const bestNeuro = teams[team][0].getComponent(NeuroComponent);

            for(let i = 0, l = teams[team].length; i < l; i++) {
                if (i > Math.floor(0.9 * l)) {
                    const neuro = teams[team][i].getComponent(NeuroComponent);
                    neuro.cerebellum = bestNeuro.cerebellum.copy();
                    neuro.brain = bestNeuro.brain.copy();
                    neuro.cerebellum.mutate();
                    neuro.brain.mutate();
                } else if (i > Math.floor(0.66 * l)) {
                    const neuro = teams[team][i].getComponent(NeuroComponent);
                    neuro.cerebellum.hardMutate();
                    neuro.brain.hardMutate();
                } else if (i > Math.floor(0.33 * l)) {
                    const neuro = teams[team][i].getComponent(NeuroComponent);
                    neuro.cerebellum.mutate();
                    neuro.brain.mutate();
                }
            }
        }
    }

    checkEndRound() {
        if (this.roundTime > TIME_OF_ROUND) {
            this.endRound();
        }
    }

    endRound() {
        this.mutateBrains();
        this.roundTime = 0;
        this.roundNumber += 1;
        this.cache = [];
    }
}