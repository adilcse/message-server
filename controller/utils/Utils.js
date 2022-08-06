const constants = require("../../constants");

const textColorFromBackground = (colour) => {
    const hex   = colour.replace(/#/, '');
    const r     = parseInt(hex.substr(0, 2), 16);
    const g     = parseInt(hex.substr(2, 2), 16);
    const b     = parseInt(hex.substr(4, 2), 16);

    const a =  [
        0.299 * r,
        0.587 * g,
        0.114 * b
    ].reduce((a, b) => a + b) / 255;
    return a < 0.5 ? constants.BLACK : constants.WHITE;
};

module.exports = {textColorFromBackground}