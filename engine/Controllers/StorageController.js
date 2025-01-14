class StorageController {
    static _instance;

    static init() {
        if (StorageController._instance) {
            throw new Error("StorageController is already initialized.");
        }

        StorageController._instance = new StorageController();
    }

    static getInstance() {
        return StorageController._instance;
    }

    // Save data to local storage
}