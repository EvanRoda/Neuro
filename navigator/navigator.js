const WIDTH = 500;
const HEIGHT = 900;

debugToggle = false;

window.addEventListener('load', () => {
    console.log('page is fully loaded');

    GameContext.create(document.getElementById('screen'), WIDTH, HEIGHT);

    EntityController.init();
    RenderingController.init();
    SceneController.init();
    StorageController.init();

    SceneController.getInstance().open(StartScene);
});