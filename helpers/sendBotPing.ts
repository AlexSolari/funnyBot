import { EventType } from '../types/customEvents';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { SpecificUsers } from '../secrets/userIds';

export async function sendBotPing(
    tokenProvider: () => Promise<string>,
    observability: ObservabilityHelper,
    data: {
        botName: string;
        event: 'bot.starting' | 'bot.stopping';
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
                })
            }
        );

        if (!response.ok)
            throw new Error(`${response.status} ${await response.text()}`);
    } catch (error) {
        observability.emitter.emit('error.generic', {
            traceId: observability.traceId,
            error: new Error(
                `Failed to call ${endpoint}: ${(error as Error).message}`
            )
        });
    } finally {
        observability.emitter.emit(EventType.requestEnd, {
            traceId: observability.traceId,
            endpoint
        });
    }
}
