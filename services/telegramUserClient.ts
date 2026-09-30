import { TelegramClient } from '@mtcute/bun';
import credentials from '../telegramApiCredentials.json';

export const TELEGRAM_USER_SESSION_PATH = 'storage/telegramUser.session';

/**
 * MTProto client logged in as a user account.
 * Use it for methods that are not available in the Bot API (e.g. poll results).
 */
export function createTelegramUserClient() {
    return new TelegramClient({
        apiId: credentials.apiId,
        apiHash: credentials.apiHash,
        storage: TELEGRAM_USER_SESSION_PATH
    });
}

let clientPromise: Promise<TelegramClient> | undefined;

/**
 * Returns a shared, connected client.
 * The session must be created beforehand with `bun scripts/telegramLogin.ts`.
 */
export function getTelegramUserClient() {
    clientPromise ??= (async () => {
        const client = createTelegramUserClient();

        try {
            await client.start({
                phone: () => {
                    throw new Error(
                        'Telegram user session is missing, run `bun scripts/telegramLogin.ts` first'
                    );
                }
            });
        } catch (error) {
            clientPromise = undefined;
            await client.destroy();
            throw error;
        }

        return client;
    })();

    return clientPromise;
}
