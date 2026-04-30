import { TraceId, TypedEventEmitter } from 'chz-telegram-bot';
import { EventMap } from './customEvents';

export type ObservabilityHelper = {
    emitter: TypedEventEmitter<EventMap>;
    traceId: TraceId;
};
