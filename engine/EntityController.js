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

    static clear() {
        const objects = EntityController.getAll();

        for (const uuid in objects) {
            delete objects[uuid];
        }
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