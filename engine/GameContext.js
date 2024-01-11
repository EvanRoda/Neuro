class GameContext {
    static _instance = null;

    canvas = null;
    width = 0;
    height = 0;

    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
    }

    static create(canvas, width, height) {
        GameContext._instance = new GameContext(canvas, width, height);
    }

    static getCanvas() {
        return GameContext._instance.canvas;
    }

    static getWidth() {
        return GameContext._instance.width;
    }

    static getHeight() {
        return GameContext._instance.height;
    }
}