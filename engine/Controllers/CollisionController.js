class CollisionController {
    static evaluate() {
        const objects = EntityController.getAll();
        const colliders = [];

        for (const uuid in objects) {
            const entity = objects[uuid];
            const collider = entity.getComponent(RectColliderComponent) || entity.getComponent(CircleColliderComponent);
            if (collider) colliders.push(collider);
        }

        // console.log(RectColliderComponent);
        // console.log(ColliderComponent);
        // console.log(colliders);

        for (let i = 0, l = colliders.length; i < l; i++) {
            const first = colliders[i];
            for (let j = i + 1; j < l; j++) {
                const second = colliders[j];
                if (first.isIntersect(second)) {
                    first.onCollision(second.entity);
                    second.onCollision(first.entity);
                }
            }
        }

        // Clear colliders cache
        for (let i = 0, l = colliders.length; i < l; i++) {
            colliders[i].clear();
        }
    }
}