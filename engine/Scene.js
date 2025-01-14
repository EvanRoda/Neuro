class Scene {
    camera = null;
    layers = null;

    constructor(camera, layers) {
        this.camera = camera;
        this.layers = layers;
    }

    moveCamera(vector) {
        this.camera.pos = this.camera.pos.add(vector);
    }

    calculate(frameTime) {
        return [];
    }

    afterDraw() {}

    onOpen() {}

    onClose() {
        EntityController.clear();
    }
}