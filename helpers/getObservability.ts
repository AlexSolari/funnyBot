import {
    ActionStateBase,
    TypedEventEmitter,
    ChatContext,
    ReplyContext,
    InlineQueryContext
} from 'chz-telegram-bot';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { EventMap } from '../types/customEvents';

export function getObservability(
    ctx:
        | ChatContext<ActionStateBase>
        | ReplyContext<ActionStateBase>
        | InlineQueryContext
): ObservabilityHelper {
    const { eventEmitter, traceId } = ctx.observability;

    return {
        emitter: eventEmitter as TypedEventEmitter<EventMap>,
        traceId
    };
}
