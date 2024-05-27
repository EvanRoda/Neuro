const WIDTH = 500;
const HEIGHT = 900;

debugToggle = false;

window.addEventListener('load', () => {
    console.log('page is fully loaded');
    const canvas = document.getElementById('screen');
    GameContext.create(canvas, WIDTH, HEIGHT);
    StartScene.open(StartScene, null);
});