const { performance } = require('perf_hooks');

module.exports = (name, action) => {
    console.log(` - Executing [${name}]`);
    const t0 = performance.now();
    action();
    const t1 = performance.now();
    console.log(` - [${name}] took ${(t1 - t0).toFixed(3)} ms.`);
};