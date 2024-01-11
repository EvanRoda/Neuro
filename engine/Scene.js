class Scene {
    static _instance;

    static open(sceneClass, bundle) {
        sceneClass._instance = new sceneClass(bundle);
        sceneClass._instance.start();
    }

    renderer;
    constructor() {
        this.renderer = new Renderer(this.calculate, this.afterDraw);
    }

    start() {
        this.renderer.start();
    }

    goTo(sceneClass, bundle) {
        EntityController.clear();
        sceneClass.open(sceneClass, bundle);
    }

    calculate(frameTime) {
        return [];
    }

    afterDraw() {}
}