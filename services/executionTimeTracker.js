import { performance } from 'perf_hooks';
import logger from './logger.js';

/**
 * 
 * @param {String} name 
 * @param {Function} action 
 * @param {string | number} traceId 
 */
export default async function measureExecutionTime(name, action, traceId) {
    logger.logWithTraceId(traceId, ` - Executing [${name}]`);
    const t0 = performance.now();
    await action();
    const t1 = performance.now();
    logger.logWithTraceId(traceId, ` - [${name}] took ${(t1 - t0).toFixed(3)} ms.`);
};