const { performance } = require('perf_hooks');
const log = require('./logger');

/**
 * 
 * @param {String} name 
 * @param {Function} action 
 */
module.exports = async (name, action, traceId) => {
    log(traceId, ` - Executing [${name}]`);
    const t0 = performance.now();
    await action();
    const t1 = performance.now();
    log(traceId, ` - [${name}] took ${(t1 - t0).toFixed(3)} ms.`);
};