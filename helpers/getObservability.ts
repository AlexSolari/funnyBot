import {
    ActionStateBase,
    TypedEventEmitter,
    ChatContext,
    ReplyContext
} from 'chz-telegram-bot';
import { ObservabilityHelper } from '../types/observabilityHelper';

export function getObservability<EventMap extends Record<string, unknown>>(
    ctx: ChatContext<ActionStateBase> | ReplyContext<ActionStateBase>
): ObservabilityHelper<EventMap> {
    const { eventEmitter, traceId } = ctx.observability;

    return {
        emitter: eventEmitter as TypedEventEmitter<EventMap>,
        traceId
    };
}
