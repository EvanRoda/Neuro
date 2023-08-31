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

    getHash() {
        if (this.hash.length === 0) this.calcHash();

        return this.hash;
    }

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
        const layerIndex = randomInt(this.layers.length - 2) + 1;
        const layer = this.layers[layerIndex];
        const elementIndex = randomInt(layer.elements.length - 1);
        const element = layer.elements[elementIndex];

        if (element.relations.length > 0) {
            const relationIndex = randomInt(element.relations.length);
            element.relations[relationIndex] += Math.random() > 0.5 ? 0.1 : -0.1;
            if (element.relations[relationIndex] < 0) element.relations[relationIndex] = 0
            if (element.relations[relationIndex] > 1) element.relations[relationIndex] = 1
        }
    }

    run(inputData) {
        const sensors = this.layers[0];

        if (inputData.length !== sensors.size - 1) {
            throw new Error("The amount of data does not match the number of sensors.");
        }

        for (let i = 0; i < inputData.length - 1; i++) {
            const value = inputData[i];

            if (sensors.elements[i] !== null) {
                sensors.elements[i].set(value);
            }
        }

        this.evaluate();
    }

    getReaction() {
        let reaction = (self) => {
            self.decreaseEnergy(1);
            return "Default reaction";
        };
        let weight = 0;
        const rElements = this.layers[this.layers.length - 1].elements;
        for (let i = 0, l = rElements.length; i < l; i++) {
            const neuron = rElements[i];
            const input = neuron.calculate();
            if (weight < input) {
                reaction = neuron.reaction;
                weight = input;
            }
        }

        return reaction;
    }

    evaluate() {
        for (let i = 0, l = this.neurons.length; i < l; i++) {
            const neuron = this.neurons[i];
            const value = neuron.calculate();
            for (let j = 0, k = neuron.relations.length; j < k; j++) {
                const weight = neuron.relations[j];
                if (weight > 0) {
                    neuron.layer.nextLayer.elements[j].set(value * weight);
                }
            }
        }
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
    calculatedValue = 0;

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
                this.relations[i] = Neuron.generateRelation();
            }
        }
    }

    setRelations(relations) {
        this.relations = relations;
    }

    set(value) {
        //this.input.push(value);
        this.input[this.input.length] = value
    }

    calculate() {
        let sum = 0;
        const l = this.input.length;

        for (let i = 0; i < l; ++i) {
            sum += this.input[i];
        }

        this.calculatedValue = this.handler(sum / l);
        this.input = [];

        return this.calculatedValue;
    }

    get() {
        return this.calculatedValue;
    }

    static generateRelation() {
        return Math.random() < 0.3 ? 0 : (1 + randomInt(10)) / 10;
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