class StartScene extends Scene {
    constructor() {
        super();
    }

    calculate(frameTime) {
        console.log('calculating');
        return [];
    }

    afterDraw() {
        console.log('after draw');
    }
}