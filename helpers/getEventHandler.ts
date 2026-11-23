import { BotEventType, TraceId, TypedEventEmitter } from 'chz-telegram-bot';
import { createMonitoringEventHandler } from '../monitoring';
import { sendBotPing } from './sendBotPing';
import { EventType } from '../types/customEvents';

/**
 * `JSON.stringify` drops an `Error`'s own fields (they're non-enumerable) and prints `{}`,
 * so write out the parts worth logging. Nested errors (e.g. `cause`) go through this too.
 */
function serializeErrors(_key: string, value: unknown) {
    if (!(value instanceof Error)) return value;

    return {
        ...value, // Extra enumerable fields, e.g. `code`/`text` on mtcute's RpcError.
        name: value.name,
        message: value.message,
        stack: value.stack,
        cause: value.cause
    };
}

function formatTimestamp(epochMilliseconds: number) {
    return Temporal.Instant.fromEpochMilliseconds(epochMilliseconds).toString({
        fractionalSecondDigits: 3
    });
}

export function getEventHandler(
    botName: string,
    eventEmitter: TypedEventEmitter,
    tokenProvider: () => Promise<string>
) {
    const monitoringHandler = createMonitoringEventHandler(botName);

    return async (e: string, timestamp: number, data: unknown) => {
        monitoringHandler(e, timestamp, data);

        if (
            e == BotEventType.botStarting ||
            e == BotEventType.botStopping ||
            e == EventType.botReconnecting
        ) {
            const { traceId } = data as { traceId: TraceId };
            await sendBotPing(
                tokenProvider,
                {
                    emitter: eventEmitter,
                    traceId
                },
                { botName, event: e, timestamp }
            );
        }

        if (e.startsWith('error'))
            console.error(
                `${botName} - ${formatTimestamp(timestamp)} - ${e} - ${JSON.stringify(data, serializeErrors)}`
            );

        if (
            process.env.NODE_ENV != 'production' &&
            !e.startsWith('storage') &&
            !e.startsWith('task') &&
            !e.startsWith('inline.processing')
        )
            console.log(
                `${botName} - ${formatTimestamp(timestamp)} - ${e} - ${JSON.stringify(data, serializeErrors)}`
            );
    };
}
