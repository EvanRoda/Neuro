class Entity {
    uuid;
    components = {};
    mustRemove = false;

    constructor() {
        this.uuid = generateUUID();
        EntityController.add(this);
    }

    evaluate(frameTime) {}

    addComponent(componentClass) {
        this.components[componentClass.name] = new componentClass(this);
        return this;
    }

    getComponent(componentClass) {
        return this.components[componentClass.name];
    }

    hasComponent(componentClass) {
        return !!this.components[componentClass.name];
    }
}