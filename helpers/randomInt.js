function randomInteger(x1, x2) {
    const range = x2 - x1 + 1;
    
    const random = Math.floor(Math.random() * range);
    
    return random + x1;
}

module.exports = randomInteger;
  