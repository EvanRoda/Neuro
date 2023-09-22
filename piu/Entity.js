class Entity {
    uuid;
    components = {};

    constructor() {
        this.uuid = generateUUID();
    }

    addComponent(component) {
        this.components[component.constructor.name] = component;
        return this;
    }

    getComponent(componentClass) {
        return this.components[componentClass.name];
    }
}