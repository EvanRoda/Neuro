class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    len() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalize() {
        const len = this.len();
        return new Vector2(this.x / len, this.y / len);
    }

    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
}