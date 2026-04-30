import { EventType } from '../types/customEvents';
import { ObservabilityHelper } from '../types/observabilityHelper';

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

    return fetch(url, options).finally(() => {
        observability.emitter.emit(EventType.requestEnd, {
            traceId: observability.traceId,
            endpoint
        });
    });
}
