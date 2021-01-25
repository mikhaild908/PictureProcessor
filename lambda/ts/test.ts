const path = require('path');
const test = require('./index');

const border_1800_x_1200 = path.join(__dirname, 'borders/1800x1200-frozen-border.png');
const inputImage = path.join(__dirname, 'input/1800x1200-input.png');
const outputImage = path.join(__dirname, 'output/with-border.png');
const resizedImage = path.join(__dirname, 'output/resized.png');

const eventParams = {
    "border_1800_x_1200": border_1800_x_1200,
    "inputImage": inputImage,
    "resizedImage": resizedImage,
    "outputImage": outputImage
};

test.handler(eventParams);
