function randomInt(max) {
    return Math.floor(Math.random() * max);
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

function changeColorInt(colorInt) {
    return (colorInt + 10) % 16777215;
}


function randomHandler() {
    const c = Math.random();
    if (c < 0.7) {
        return ["A", (value) => { return value > 0 ? 1 : -1; }];
    } else if (c < 0.99) {
        return ["B", (value) => { return value > -1 && value < 1 ? 1 : -1; }];
    } else {
        return ["C", (value) => { return Math.abs(value / 7) >= Math.random() ? 1 : -1; }];
    }
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
