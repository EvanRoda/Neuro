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

class EntityController {
    static _instance;
    static getInstance() {
        if (!EntityController._instance) {
            EntityController._instance = new EntityController();
        }

        return EntityController._instance;
    }

    static add(entity) {
        EntityController.getInstance().entities[entity.uuid] = entity;
    }

    static getAll() {
        return EntityController.getInstance().entities;
    }

    static removeGarbage() {
        const objects = EntityController.getAll();

        for (const uuid in objects) {
            const entity = objects[uuid];
            if (entity.mustRemove) {
                delete objects[uuid];
            }
        }
    }

    entities;

    constructor() {
        this.entities = {};
    }
}