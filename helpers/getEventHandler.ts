import { BotEventType, TraceId, TypedEventEmitter } from 'chz-telegram-bot';
import { createMonitoringEventHandler } from '../monitoring';
import { sendBotPing } from './sendBotPing';
import { EventType } from '../types/customEvents';

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
                `${botName} - ${new Date(timestamp).toISOString()} - ${e} - ${JSON.stringify(data)}`
            );

        if (
            process.env.NODE_ENV != 'production' &&
            !e.startsWith('storage') &&
            !e.startsWith('task') &&
            !e.startsWith('inline.processing')
        )
            console.log(
                `${botName} - ${new Date(timestamp).toISOString()} - ${e} - ${JSON.stringify(data)}`
            );
    };
}
