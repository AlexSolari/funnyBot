import { EventType } from '../types/customEvents';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { SpecificUsers } from '../secrets/userIds';
import { emitError } from './emitError';

export async function sendBotPing(
    tokenProvider: () => Promise<string>,
    observability: ObservabilityHelper,
    data: {
        botName: string;
        event:
            'bot.starting' | 'bot.stopping' | typeof EventType.botReconnecting;
        timestamp: number;
    }
) {
    const endpoint = 'telegram-bot/sendMessage';
    observability.emitter.emit(EventType.requestStart, {
        traceId: observability.traceId,
        endpoint
    });

    try {
        const token = (await tokenProvider()).trim();
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: SpecificUsers.chz,
                    text: `${data.botName} - ${data.event}`
                }),
                keepalive: false,
                signal: AbortSignal.timeout(15_000)
            }
        );

        if (!response.ok)
            throw new Error(`${response.status} ${await response.text()}`);
    } catch (error) {
        // Don't pass `error` as the cause: Bun puts the request URL (which holds the bot token)
        // on fetch errors as `path`, and the error log writes out every field of a cause.
        emitError(
            observability,
            `Failed to call ${endpoint}: ${(error as Error).message}`
        );
    } finally {
        observability.emitter.emit(EventType.requestEnd, {
            traceId: observability.traceId,
            endpoint
        });
    }
}
