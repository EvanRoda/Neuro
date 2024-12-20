class BulletPrefComponent extends Component {
    damage = 0;
    speed = 0;
    aoe_radius = 0;
    aoe_damage = 0;

    constructor(entity) {
        super(entity);
    }

    set(bulletPref) {
        this.damage = bulletPref.damage;
        this.speed = bulletPref.speed;
        this.aoe_radius = bulletPref.aoe_radius;
        this.aoe_damage = bulletPref.aoe_damage;
    }
}
