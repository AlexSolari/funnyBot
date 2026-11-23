import { EventType } from '../types/customEvents';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { wrapError } from './emitError';

export function traceFetch(
    url: string,
    observability: ObservabilityHelper,
    options?: RequestInit
): Promise<Response> {
    const endpoint = url.replaceAll('https://', '').replaceAll('http://', '');
    observability.emitter.emit(EventType.requestStart, {
        traceId: observability.traceId,
        endpoint
    });

    return fetch(url, options)
        .catch((error) => {
            throw wrapError(`Failed to fetch ${url}`, error);
        })
        .finally(() => {
            observability.emitter.emit(EventType.requestEnd, {
                traceId: observability.traceId,
                endpoint
            });
        });
}
