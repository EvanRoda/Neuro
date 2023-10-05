class Bbox {
    top = 0;
    bottom = 0;
    left = 0;
    right = 0;

    constructor(top, bottom, left, right) {
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }

    isIntersect(other) {
        return !(this.top < other.bottom
            || this.bottom > other.top
            || this.left > other.right
            || this.right < other.left);
    }
}