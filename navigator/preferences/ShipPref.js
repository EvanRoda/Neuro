class ShipPref {
    max_hp = 1;
    hp = 1;
    guns = [new GunPref()];
    speed = 10;
    target = new Vector2(0, 0);

    constructor(max_hp, hp, guns, speed) {
        this.max_hp = max_hp;
        this.hp = hp;
        this.guns = guns;
        this.speed = speed;
    }
}