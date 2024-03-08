const { performance } = require('perf_hooks');

/**
 * 
 * @param {String} name 
 * @param {Function} action 
 */
module.exports = async (name, action) => {
    console.log(` - Executing [${name}]`);
    const t0 = performance.now();
    await action();
    const t1 = performance.now();
    console.log(` - [${name}] took ${(t1 - t0).toFixed(3)} ms.`);
};