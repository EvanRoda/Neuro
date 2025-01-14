class SceneController {
    static _instance;

    static init() {
        if (SceneController._instance) {
            throw new Error("SceneController is already initialized.");
        }

        SceneController._instance = new SceneController();
    }

    static getInstance() {
        return SceneController._instance;
    }

    open(sceneClass) {
        this.currentScene = new sceneClass();
        this.currentScene.onOpen();
        RenderingController.getInstance().start(this.currentScene);
    }

    close() {
        this.currentScene.onClose();
        RenderingController.getInstance().stop();
    }

    goTo(sceneClass) {
        this.close();
        this.open(sceneClass);
    }

    currentScene = null;

    constructor() {}
}