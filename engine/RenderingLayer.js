class RenderingLayer {

    count = 0;
    constructor(width, height) {
        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');
        Renderer.clear(this._canvas, width, height);
    }

    clear() {
        this.count = 0;
        Renderer.clear(this._canvas, this._canvas.width, this._canvas.height);
    }

    draw(sprite, x, y) {
        this.count++;
        this._ctx.drawImage(sprite, x, y);
    }
}