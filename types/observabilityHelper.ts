import { TraceId, TypedEventEmitter } from 'chz-telegram-bot';

export type ObservabilityHelper<EventMap extends Record<string, unknown>> = {
    emitter: TypedEventEmitter<EventMap>;
    traceId: TraceId;
};
