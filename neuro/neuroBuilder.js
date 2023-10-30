class NeuroBuilder {
    static handlers = {
        "A": (value) => { return value > 0 ? 1 : -1; },
        "B": (value) => { return value > -0.5 && value < 0.5 ? 1 : -1; },
        "C": (value) => { return Math.abs(value) >= Math.random() ? 1 : -1; },
        "E": (value) => { return Math.tanh(value); },
        "D": () => { return 1 },                                                        // BALANCER_HANDLER
        "F": (value) => { return value},                                                // DEFAULT_HANDLER
        "V": (maxValue) => { return (value) => { return -1 + 2 * value / maxValue }; }, // VALUE_HANDLER
    };

    static randomHandlerType() {
        const c = Math.random();
        if (c < 0.4) {
            return "A";
        } else if (c < 0.8) {
            return "B";
        } else if (c < 0.99) {
            return "E";
        } else {
            return "C";
        }
    }

    static getHandler(options) {
        if (options.type === "V") {
            return NeuroBuilder.handlers[options.type](options.maxValue);
        } else {
            return NeuroBuilder.handlers[options.type];
        }
    }

    sensors = [];
    // reactions = [];
    reactionSize = 0;
    hiddenSize = 0;
    hiddenCount = 0

    addSensor(handlerOptions) {
        this.sensors.push(handlerOptions);
        return this;
    }

    addReactionLayer(size) {
        this.reactionSize = size;
        return this;
    }

    addHiddenLayers(count, size) {
        this.hiddenCount = count;
        this.hiddenSize = size;
        return this;
    }

    buildRLayer() {
        const rNeurons = [];
        for (let i = 0; i < this.reactionSize; i++) {
            rNeurons.push(new Reaction());
        }

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
        const sNeurons = this.sensors.map((handlerOptions) => {
            return new Sensor(handlerOptions);
        });

        const layer = new Layer(nextLayer, sNeurons);
        layer.generateRelations();
        return layer;
    }

    buildANeuron() {
        const type = NeuroBuilder.randomHandlerType();
        return new Neuron(type);
    }

    buildBalancer() {
        return new Neuron("D");
    }


    make() {
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