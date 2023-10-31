class Perceptron {

    static _fromLayers(layersData) {
        const layers = [];

        const currentLayer = layersData[layersData.length - 1];

        const elements = [];
        currentLayer.elements.forEach(_ => {
            const newElement = new Reaction();
            elements.push(newElement);
        });
        const layer = new Layer(null, elements);
        layers.unshift(layer);

        //copy A and S layers
        for (let i = layersData.length - 2; i >= 0; --i) {
            const currentLayer = layersData[i];

            const elements = [];
            currentLayer.elements.forEach(neuron => {
                const newElement = new Neuron(neuron.type, neuron.handlerOptions);
                newElement.setRelations([...neuron.relations]);
                elements.push(newElement);
            });

            const layer = new Layer(layers[0], elements);
            layers.unshift(layer);
        }

        return new Perceptron(layers);
    }

    static fromJson(json) {
        return Perceptron._fromLayers(JSON.parse(json));
    }

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

    hardMutate() {
        const layerIndex = randomInt(this.layers.length - 2) + 1;
        const layer = this.layers[layerIndex];
        const elementIndex = randomInt(layer.elements.length - 1);

        const type = NeuroBuilder.randomHandlerType();
        const neuron = new Neuron(type);
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
            if (element.relations[relationIndex] < -1) element.relations[relationIndex] = -1;
            if (element.relations[relationIndex] > 1) element.relations[relationIndex] = 1;
        }
    }

    run(inputData) {
        const sensors = this.layers[0];

        if (inputData.length !== sensors.size - 1) {
            throw new Error("The amount of data does not match the number of sensors.");
        }

        for (let i = 0; i < inputData.length; i++) {
            const value = inputData[i];

            if (sensors.elements[i] !== null) {
                sensors.elements[i].set(value);
            }
        }

        this.evaluate();
        return this.getReactionIndex();
    }

    getReactionIndex() {
        let reactionIndex = -1;
        let weight = null;
        const rElements = this.layers[this.layers.length - 1].elements;
        for (let i = 0, l = rElements.length; i < l; i++) {
            const neuron = rElements[i];
            const input = neuron.calculate();
            if (weight == null || weight < input) {
                reactionIndex = i;
                weight = input;
            }
        }

        return reactionIndex;
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

    copy() {
        return Perceptron._fromLayers(this.layers);
    }

    toJson() {
        const layers = [];
        this.layers.forEach((layer) => {
            const elements = [];
            layer.elements.forEach(neuron => {
                const neuronData = {
                    uuid: neuron.uuid,
                    type: neuron.type,
                    relations: neuron.relations,
                    handlerOptions: neuron.handlerOptions
                };
                elements.push(neuronData);
            });
            layers.push({elements: elements});
        });
        return JSON.stringify(layers);
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
    uuid = null;
    type = "";
    layer;
    relations = [];
    input = [];
    calculatedValue = 0;
    handlerOptions;
    handler = (value) => { return value }

    /**
     * type - S, A, R
     * handlerOptions - {type: A, maxValue: 1} only for V
     */
    constructor(type, handlerOptions) {
        this.uuid = generateUUID();
        this.type = type;
        if (handlerOptions == null) {
            handlerOptions = {type: type};
        }
        this.handlerOptions = handlerOptions;
        this.handler = NeuroBuilder.getHandler(this.handlerOptions);
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
        return (1 + randomInt(20) - 10) / 10;
        // return Math.random() < 0.3 ? 0 : (1 + randomInt(10)) / 10;
    }
}

class Sensor extends Neuron {

    constructor(handlerOptions) {
        super("S", handlerOptions);
    }
}

class Reaction extends Neuron {

    constructor() {
        super("R", {type: "F"});
    }
}