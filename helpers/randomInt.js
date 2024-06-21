/**
 * 
 * @param {Number} x1 
 * @param {Number} x2 
 * @returns {Number} random int between x1 and x2
 */
function randomInteger(x1, x2) {
    const range = x2 - x1 + 1;

    const random = Math.floor(Math.random() * range);

    return random + x1;
}

module.exports = randomInteger;
