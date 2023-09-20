class Entity {
    x = 0;
    y = 0;
    direction = 0; // in radians from 0 to 2 * Math.PI
    canvas = null;
    center = {x: 0, y: 0};

    constructor(w, h) {
        this.canvas = document.createElement('canvas');

        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px"

        this.center.x = w / 2;
        this.center.y = h / 2;
    }
}