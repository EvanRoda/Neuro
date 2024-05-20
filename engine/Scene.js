class Scene {
    static _instance;

    static open(sceneClass, bundle) {
        sceneClass._instance = new sceneClass(bundle);
        sceneClass._instance.start();
    }

    camera = null;

    renderer;

    constructor(camera, layers) {
        this.camera = camera;

        this.renderer = new Renderer(this.camera, layers, this.calculate, this.afterDraw);
    }

    start() {
        this.renderer.start();
        this.onOpenScene();
    }

    goTo(sceneClass, bundle) {
        EntityController.clear();
        sceneClass.open(sceneClass, bundle);
    }

    moveCamera(vector) {
        this.camera.pos = this.camera.pos.add(vector);
    }

    calculate(frameTime) {
        return [];
    }

    afterDraw() {}

    onOpenScene() {}
}