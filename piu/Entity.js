class Entity {
    uuid;
    components = {};
    mustRemove = false;

    constructor() {
        this.uuid = generateUUID();
    }

    evaluate(frameTime) {}

    addComponent(component) {
        this.components[component.constructor.name] = component;
        return this;
    }

    getComponent(componentClass) {
        return this.components[componentClass.name];
    }
}