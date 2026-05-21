import {
    ActionStateBase,
    ChatContext,
    ReplyContext,
    InlineQueryContext
} from 'chz-telegram-bot';
import { ObservabilityHelper } from '../types/observabilityHelper';

export function getObservability(
    ctx:
        | ChatContext<ActionStateBase>
        | ReplyContext<ActionStateBase>
        | InlineQueryContext
): ObservabilityHelper {
    const { eventEmitter, traceId } = ctx.observability;

    return {
        emitter: eventEmitter,
        traceId
    };
}
