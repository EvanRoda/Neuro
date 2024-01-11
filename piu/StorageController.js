class StorageController {
    static _instance = null;
    static getInstance() {
        if (!StorageController._instance) {
            StorageController._instance = new StorageController();
        }

        return StorageController._instance;
    }

    storage;

    constructor() {
        this.storage = window.localStorage;
    }

    get(key) {
        return this.storage.getItem(key);
    }

    set(key, value) {
        this.storage.setItem(key, value);
    }

    remove(key) {
        this.storage.removeItem(key);
    }

    clear() {
        this.storage.clear();
    }
}