let renderer;
let canvas;
const WIDTH = 1281;
const HEIGHT = 961;

window.addEventListener('load', () => {
    console.log('page is fully loaded');

    initUI();
    renderer = new Renderer(canvas, WIDTH, HEIGHT, calculate, afterDraw);
    renderer.start();
});

function initUI() {
    canvas = document.getElementById("screen");
    canvas.addEventListener("click", (event) => {

    });
}

function calculate() {
    return test();
}

function afterDraw() {
    // Draw UI elements
}

function test() {
    const entities = [];

    for (let i = 0; i < 10; i++) {
        const e = new Entity();
        e.x = randomInt(1281);
        e.y = randomInt(961);
        e.direction = randomFloat(2 * Math.PI);
        e.center = { x: 5, y: 10 };
        e.canvas = document.createElement('canvas');
        Renderer.clear(e.canvas, 10, 15);
        const ctx = e.canvas.getContext('2d');
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(10, 15, 10, 0, 2 * Math.PI);
        ctx.moveTo(10, 15);
        ctx.lineTo(10, 0);
        ctx.stroke();

        entities.push(e);
    }

    return entities;
}