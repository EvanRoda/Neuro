class Perceptron {
    layers;
    hash = "";
    neurons = [];

    constructor(layers) {
        this.layers = layers;
        this.calcHash();
    }

    calcHash() {
        this.hash = "";
        this.neurons = [];
        this.layers.forEach(layer => {
            layer.elements.forEach(neuron => {
                this.hash += neuron.type;
                if (layer.nextLayer) {
                    this.neurons.push(neuron);
                }
            });
        });
    };

    copy() {
        const layers = [];

        const currentLayer = this.layers[this.layers.length - 1];

        //copy reactions
        const elements = [];
        currentLayer.elements.forEach(neuron => {
            const newElement = new Reaction(neuron.reaction);
            elements.push(newElement);
        });
        const layer = new Layer(null, elements);
        layers.unshift(layer);

        //copy A and S layers
        for (let i = this.layers.length - 2; i >= 0; --i) {
            const currentLayer = this.layers[i];

            const elements = [];
            currentLayer.elements.forEach(neuron => {
                const newElement = new Neuron(neuron.type, neuron.handler);
                newElement.setRelations([...neuron.relations]);
                elements.push(newElement);
            });


            const layer = new Layer(layers[0], elements);
            layers.unshift(layer);
        }

        return new Perceptron(layers);
    }

    hardMutate() {
        const layerIndex = randomInt(this.layers.length - 2) + 1;
        const layer = this.layers[layerIndex];
        const elementIndex = randomInt(layer.elements.length - 1);

        const [type, handler] = randomHandler()
        const neuron = new Neuron(type, handler);
        neuron.setLayer(layer);
        neuron.generateRelations();
        layer.elements[elementIndex] = neuron;
        this.calcHash();
    }

    mutate() {
        this.layers.forEach(layer => {
            const elementIndex = randomInt(layer.elements.length);
            const element = layer.elements[elementIndex];
            if (element.relations.length > 0) {
                const relationIndex = randomInt(element.relations.length);
                element.relations[relationIndex] = randomInt(11) / 10;
            }
        });
    }

    run() {
        const sensors = this.layers[0];

        if (arguments.length !== sensors.size - 1) {
            throw new Error("The amount of data does not match the number of sensors.");
        }

        for (let i = 0; i < arguments.length - 1; i++) {
            const value = arguments[i];

            if (sensors.elements[i] !== null) {
                sensors.elements[i].set(value);
            }
        }

        this.evaluate();
        return this.getReaction();
    }

    getReaction() {
        let reaction = (self) => {
            self.decreaseEnergy(1);
            return "Default reaction";
        };
        let weight = 0;

        this.layers[this.layers.length - 1].elements.forEach(neuron => {
            const input = neuron.get();
            if (weight < input) {
                reaction = neuron.reaction;
                weight = input;
            }
        });

        return reaction;
    }

    evaluate() {
        this.neurons.forEach(neuron => {
            const value = neuron.get();
            for (let i = 0; i < neuron.relations.length; i++) {
                const weight = neuron.relations[i];
                if (weight > 0) {
                    neuron.layer.nextLayer.elements[i].set(value * weight);
                }
            }
        });
    }
}

class Layer {
    size;
    nextLayer;
    elements = [];

    constructor(nextLayer, elements) {
        this.size = elements.length;
        this.nextLayer = nextLayer;
        this.elements = elements;

        this.elements.forEach((neuron) => {
            neuron.setLayer(this);
        });
    }

    generateRelations() {
        this.elements.forEach((neuron) => {
            neuron.generateRelations();
        });
    }
}

class Neuron {
    type = "";
    layer;
    relations = [];
    input = [];
    inputSum = 0;

    handler = (value) => { return value }

    constructor(type, handler) {
        this.type = type;
        if (handler) {
            this.handler = handler;
        }
    }

    setLayer(layer) {
        this.layer = layer;
    }

    generateRelations() {
        if (this.layer.nextLayer != null) {
            for (let i = 0; i < this.layer.nextLayer.size; i++) {
                this.relations[i] = randomInt(11) / 10;
            }
        }
    }

    setRelations(relations) {
        this.relations = relations;
    }

    set(value) {
        this.input.push(value);
        // this.inputSum += value;
    }

    get() {
        const sum = this.input.reduce((p, a) => p + a, 0);
        const result = this.handler(sum / this.input.length);
        this.input = [];
        // const result = this.handler(this.inputSum);
        // this.inputSum = 0;

        return result;
    }
}

class Sensor extends Neuron {

    constructor(handler) {
        super("S", handler);
    }

    generateRelations() {
        if (this.layer.nextLayer != null) {
            for (let i = 0; i < this.layer.nextLayer.size; i++) {
                this.relations[i] = 1;
            }
        }
    }
}

class Reaction extends Neuron {
    reaction;

    constructor(reaction) {
        super("R", null);
        this.reaction = reaction;
    }
}