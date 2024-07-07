import { performance } from 'perf_hooks';
import log from './logger.js';

/**
 * 
 * @param {String} name 
 * @param {Function} action 
 * @param {string | number} traceId 
 */
export default async function measureExecutionTime(name, action, traceId) {
    log(traceId, ` - Executing [${name}]`);
    const t0 = performance.now();
    await action();
    const t1 = performance.now();
    log(traceId, ` - [${name}] took ${(t1 - t0).toFixed(3)} ms.`);
};