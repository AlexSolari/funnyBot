import { TelegramClient } from '@mtcute/bun';
import credentials from '../secrets/telegramApiCredentials.json';
import { EventType } from '../types/customEvents';
import { ObservabilityHelper } from '../types/observabilityHelper';

/**
 * Options for the MTProto user client, shared with `scripts/telegramLogin.ts` so both use the same session.
 */
export const telegramUserClientOptions: ConstructorParameters<
    typeof TelegramClient
>[0] = {
    apiId: credentials.apiId,
    apiHash: credentials.apiHash,
    storage: 'storage/telegramUser.session'
};

let clientPromise: Promise<TelegramClient> | undefined;

const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;

/**
 * mtcute installs SIGINT/SIGTERM handlers when its storage first loads. They flush the storage and then
 * re-raise the signal, which kills the process before the bot's own graceful shutdown finishes.
 * The app owns shutdown and mtcute still flushes its storage on 'exit', so detach whatever `fn` added.
 */
async function withoutLibrarySignalHandlers<T>(fn: () => Promise<T>) {
    const listenersBefore = shutdownSignals.map(
        (signal) => [signal, new Set(process.listeners(signal))] as const
    );

    try {
        return await fn();
    } finally {
        for (const [signal, listeners] of listenersBefore)
            for (const listener of process.listeners(signal))
                if (!listeners.has(listener)) process.off(signal, listener);
    }
}

/**
 * Returns a shared, connected MTProto client logged in as a user account.
 * Use it for methods that are not available in the Bot API (e.g. poll results).
 * The session must be created beforehand with `bun scripts/telegramLogin.ts`.
 */
function getTelegramUserClient() {
    clientPromise ??= (async () => {
        const client = new TelegramClient(telegramUserClientOptions);

        try {
            await withoutLibrarySignalHandlers(() =>
                client.start({
                    phone: () => {
                        throw new Error(
                            'Telegram user session is missing, run `bun scripts/telegramLogin.ts` first'
                        );
                    }
                })
            );
        } catch (error) {
            clientPromise = undefined;
            await client.destroy();
            throw error;
        }

        return client;
    })();

    return clientPromise;
}

/**
 * Connects the shared client ahead of time, so the first traced call doesn't pay for the handshake.
 */
export async function warmUpTelegramUserClient() {
    await getTelegramUserClient();
}

/**
 * Runs a request on the shared client, emitting request start/end (and error) events.
 */
export async function traceTelegramUserCall<T>(
    method: string,
    observability: ObservabilityHelper,
    call: (client: TelegramClient) => Promise<T>
): Promise<T> {
    const client = await getTelegramUserClient();
    const endpoint = `telegram/${method}`;
    observability.emitter.emit(EventType.requestStart, {
        traceId: observability.traceId,
        endpoint
    });

    try {
        return await call(client);
    } catch (error) {
        observability.emitter.emit('error.generic', {
            traceId: observability.traceId,
            error: new Error(
                `Failed to call ${endpoint}: ${(error as Error).message}`
            )
        });

        throw error;
    } finally {
        observability.emitter.emit(EventType.requestEnd, {
            traceId: observability.traceId,
            endpoint
        });
    }
}
