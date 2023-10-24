const NEURON_COLORS = {
    S: '#dcdcdc',
    A: '#d5f3a9',
    B: '#a6e7d4',
    C: '#ecbbeb',
    D: '#f6c8c8',
    E: '#e8df98',
    R: '#dcdcdc',
}
class PerceptronRenderer {
    perceptron;
    real = null;
    realCtx = null;
    hidden = null;
    hiddenCtx = null;
    width = 0;
    height = 0;

    selectedNeuronData = null;

    constructor(perceptron, canvas, w, h) {
        this.perceptron = perceptron;
        this.real = canvas;
        this.realCtx = this.real.getContext('2d');
        this.hidden = document.createElement('canvas')
        this.hiddenCtx = this.hidden.getContext('2d');
        this.width = w;
        this.height = h;
        this.clear(this.real, this.width, this.height);
        this.clear(this.hidden, this.width, this.height);

        this.real.addEventListener("click", (event) => {
            this.selectedNeuronData = this.getNeuron(event.offsetX, event.offsetY);

            this.draw();
        });
    }

    clear(canvas, w, h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px"
    }

    draw() {
        this.clear(this.hidden, this.width, this.height);

        const wSpace = Math.floor(this.width / (this.perceptron.layers.length));
        let x = wSpace / 2;

        for (let i = 0, l = this.perceptron.layers.length; i < l; i++) {
            const layer = this.perceptron.layers[i];
            const hSpace = Math.floor(this.height / (layer.size));
            let y = hSpace / 2;

            for (let j = 0, k = layer.size; j < k; j++) {
                const neuron = layer.elements[j];

                this.drawNeuron(neuron, x, y);
                y += hSpace;

                if (this.selectedNeuronData != null && neuron.uuid === this.selectedNeuronData.uuid) {
                    this.drawRelations(i, x, wSpace);
                }

            }
            x += wSpace;
        }

        this.clear(this.real, this.width, this.height);
        this.realCtx.drawImage(this.hidden, 0, 0);
    }

    drawNeuron(neuron, x, y) {
        const label = neuron.type + ":" + neuron.calculatedValue.toFixed(2);
        const temp = document.createElement("canvas");
        const tempCtx = temp.getContext('2d');
        this.clear(temp, 44, 22);

        tempCtx.roundRect(2, 1, 40, 20, 10);
        tempCtx.fillStyle = NEURON_COLORS[neuron.type];
        tempCtx.strokeStyle = '#777777';
        if (this.selectedNeuronData != null && neuron.uuid === this.selectedNeuronData.uuid) {
            tempCtx.strokeStyle = '#f13838';
        }
        tempCtx.fill();
        tempCtx.stroke();

        tempCtx.textAlign = 'start';
        tempCtx.fillStyle = 'black';
        tempCtx.fillText(label, 8, 15);

        this.hiddenCtx.drawImage(temp, x - 22, y - 11);
    }

    drawRelations(layerIndex, x, wSpace) {
        if (this.selectedNeuronData == null) return;
        const temp = document.createElement("canvas");
        const tempCtx = temp.getContext('2d');

        if (this.selectedNeuronData.relationsIn.length > 0) {
            this.clear(temp, 30, this.height);
            tempCtx.font = '14px monospace';
            const hSpace = Math.floor(this.height / this.selectedNeuronData.relationsIn.length);
            let y = hSpace / 2;

            for (let i = 0, l = this.selectedNeuronData.relationsIn.length; i < l; i++) {
                tempCtx.fillText(this.selectedNeuronData.relationsIn[i] + '', 2, y + 4);
                y += hSpace;
            }

            this.hiddenCtx.drawImage(temp, x - wSpace + 20, 0);
        }

        if (this.selectedNeuronData.relationsOut.length > 0) {
            this.clear(temp, 30, this.height);
            tempCtx.font = '14px monospace';
            const hSpaceOut = Math.floor(this.height / this.selectedNeuronData.relationsOut.length);
            let y = hSpaceOut / 2;

            for (let i = 0, l = this.selectedNeuronData.relationsOut.length; i < l; i++) {

                tempCtx.fillText(this.selectedNeuronData.relationsOut[i] + '', 2, y + 4);
                y += hSpaceOut;
            }

            this.hiddenCtx.drawImage(temp, x + wSpace - 50, 0);
        }
    }

    getNeuron(eventX, eventY) {
        const wSpace = Math.floor(this.width / (this.perceptron.layers.length));
        let x = wSpace / 2;

        for (let i = 0, l = this.perceptron.layers.length; i < l; i++) {
            const layer = this.perceptron.layers[i];
            const hSpace = Math.floor(this.height / (layer.size));
            let y = hSpace / 2;

            for (let j = 0, k = layer.size; j < k; j++) {
                const neuron = layer.elements[j];

                if ((x - eventX) ** 2 + (y - eventY) ** 2 < 400) {
                    const relsIn = [];
                    if (i > 0) {
                        const prevLayer = this.perceptron.layers[i - 1];
                        for (const n of prevLayer.elements) {
                            relsIn.push(n.relations[j]);
                        }
                    }

                    return {
                        uuid: neuron.uuid,
                        relationsIn: relsIn,
                        relationsOut: [...neuron.relations]
                    };
                }
                y += hSpace;
            }
            x += wSpace;
        }
        return null;
    }
}