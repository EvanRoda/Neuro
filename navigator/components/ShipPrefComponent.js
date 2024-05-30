class ShipPrefComponent extends Component {
    ship = new ShipPref();

    constructor(entity) {
        super(entity);
    }

    set(ship) {
        this.ship = ship;
    }
}
