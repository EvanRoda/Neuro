class NeuroBuilder {
    sensors = [];
    reactions = [];
    hiddenSize = 0;
    hiddenCount = 0

    addSensor(handler) {
        this.sensors.push(handler);
        return this;
    }

    addReaction(handler) {
        this.reactions.push(handler);
        return this;
    }

    addHiddenLayers(count, size) {
        this.hiddenCount = count;
        this.hiddenSize = size;
        return this;
    }

    buildRLayer() {
        const rNeurons = this.reactions.map((reaction) => {
            return new Reaction(reaction);
        });

        return new Layer(null, rNeurons);
    }

    buildALayer(nextLayer) {
        const elements = [];
        for (let a = 0; a < this.hiddenSize; a++) {
            elements.push(this.buildANeuron());
        }
        elements.push(this.buildBalancer())

        const layer = new Layer(nextLayer, elements);
        layer.generateRelations();
        return layer;
    }

    buildSLayer(nextLayer) {
        const sNeurons = this.sensors.map((handler) => {
            return new Sensor(handler);
        });

        const layer = new Layer(nextLayer, sNeurons);
        layer.generateRelations();
        return layer;
    }

    buildANeuron() {
        const [type, handler] = randomHandler()
        return new Neuron(type, handler);
    }

    buildBalancer() {
        return new Neuron("D", () => {return 1});
    }


    build() {
        const layers = [];

        const rLayer = this.buildRLayer();

        layers.unshift(rLayer);

        for (let i = 0; i < this.hiddenCount; i++) {
            const aLayer = this.buildALayer(layers[0]);
            layers.unshift(aLayer);
        }

        const sLayer = this.buildSLayer(layers[0]);
        layers.unshift(sLayer);

        return new Perceptron(layers);
    }
}