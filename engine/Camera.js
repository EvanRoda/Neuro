class Camera {

    _bbox = null;

    constructor(
        positionOnScene = new Vector2(),
        positionOnCanvas = new Vector2(),
        width = 0,
        height = 0) {

        this.scenePosition = positionOnScene;
        this.canvasPosition = positionOnCanvas;
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
    }

    bbox() {
        if (!this._bbox) {
            this._bbox = new Bbox(
                this.scenePosition.y,
                this.scenePosition.y + this.height,
                this.scenePosition.x,
                this.scenePosition.x + this.width,
            )
        }

        return this._bbox;
    }

    clear() {
        this._bbox = null;
    }
}