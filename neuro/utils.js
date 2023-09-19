function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomFloat(max) {
    return Math.random() * max;
}

function randomMutation() {
    return (randomInt(3) / 10) - 0.1;
}

function randomColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

function getColor(colorInt) {
    return "#" + colorInt.toString(16).padStart(6, "0");
}

function randomColorInt() {
    return Math.floor(Math.random() * 16777215);
}

function stringToColorInt(str) {
    // Вычисляем хеш строки
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Генерируем цвет в виде целого числа
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    // Объединяем значения r, g и b в одно целое число
    const colorInt = (r << 16) | (g << 8) | b;

    return colorInt;
}

function changeColorInt(colorInt) {
    return (colorInt + 10) % 16777215;
}

const gpu = new window.GPU();

const getValue = gpu.createKernel(function(input, size) {
    let sum = 0;

    for (let i = 0; i < size; ++i) {
        sum += input[i];
    }

    return sum / size;
}).setOutput([1]);

const aKernel = gpu.createKernel(function(value) {
    if (value > 0) {
        return 1;
    } else {
        return -1;
    }
}).setOutput([1]);

const bKernel = gpu.createKernel(function(value) {
    if (value > -0.5 && value < 0.5) {
        return 1;
    } else {
        return -1;
    }
}).setOutput([1]);

const cKernel = gpu.createKernel(function(value) {
    if (Math.abs(value) >= Math.random()) {
        return 1;
    } else {
        return -1;
    }
}).setOutput([1]);

const dKernel = gpu.createKernel(function(value) {
    return value;
}).setOutput([1]);

const eKernel = gpu.createKernel(function(value) {
    return Math.tanh(value);
}).setOutput([1]);

function getAHandlerGpu(size) {
    return gpu.combineKernels(getValue, aKernel, function(input, inputSize, relations) {
        return relations[this.thread.x] * aKernel(getValue(input, inputSize));
    }).setOutput([size]);
}

function getBHandlerGpu(size) {
    return gpu.combineKernels(getValue, bKernel, function(input, inputSize, relations) {
        return relations[this.thread.x] * bKernel(getValue(input, inputSize));
    }).setOutput([size]);
}

function getCHandlerGpu(size) {
    return gpu.combineKernels(getValue, cKernel, function(input, inputSize, relations) {
        return relations[this.thread.x] * cKernel(getValue(input, inputSize));
    }).setOutput([size]);
}

function getDHandlerGpu(size) {
    return gpu.combineKernels(getValue, dKernel, function(input, inputSize, relations) {
        return relations[this.thread.x] * dKernel(getValue(input, inputSize));
    }).setOutput([size]);
}

function getEHandlerGpu(size) {
    return gpu.combineKernels(getValue, eKernel, function(input, inputSize, relations) {
        return relations[this.thread.x] * eKernel(getValue(input, inputSize));
    }).setOutput([size]);
}

const aHandler = (value) => { return value > 0 ? 1 : -1; };
const bHandler = (value) => { return value > -0.5 && value < 0.5 ? 1 : -1; };
const cHandler = (value) => { return Math.abs(value) >= Math.random() ? 1 : -1; };
const eHandler = (value) => { return Math.tanh(value); };

function randomHandler() {
    // return ["A", aHandler];
    // return ["B", bHandler];
    // return ["C", cHandler];
    // return ["E", eHandler];
    const c = Math.random();
    if (c < 0.4) {
        return ["A", aHandler, getAHandlerGpu];
    } else if (c < 0.8) {
        return ["B", bHandler, getBHandlerGpu];
    } else if (c < 0.99) {
        return ["E", eHandler, getEHandlerGpu];
    } else {
        return ["C", cHandler, getCHandlerGpu];
    }
}

function friendOrFoe(a, b) {
    let changes = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            changes++;
        }
    }
    return changes / a.length;
}

const LIGHT_BY_HEIGHT = (y, height) => {
    return Math.floor(100 * (height - y) / height);
}

const SIMPLE_LIGHT = (y, height) => {
    return 100;
}
const generateUUID = () => {
    let
        d = new Date().getTime(),
        d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
};
