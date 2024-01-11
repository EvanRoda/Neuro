const WIDTH = 800;
const HEIGHT = 600;

window.addEventListener('load', () => {
    console.log('page is fully loaded');
    const canvas = document.getElementById('screen');
    GameContext.create(canvas, WIDTH, HEIGHT);
    StartScene.open(StartScene, null);
});