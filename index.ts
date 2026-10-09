import {
    botOrchestrator,
    CommandAction,
    InlineQueryAction,
    IActionState,
    PersistentReplyCapture,
    ScheduledAction,
    Seconds,
    TraceId,
    TypedEventEmitter
} from 'chz-telegram-bot';
import { EventType } from './types/customEvents';
import {
    genshinCommands,
    mtgCommands,
    testCommands
} from './actions/actionGroups';
import { ChatId } from './secrets/chatIds';
import { cardSearch } from './actions/commands/cardSearch';
import { inlineCardSearch } from './actions/inline/inline_cardSearch';
import { featureProvider } from './services/featureProvider';
import { startDashboardServer } from './monitoring';
import { readFile } from 'fs/promises';
import { warmUpTelegramUserClient } from './services/telegramUserClient';
import { getEventHandler } from './helpers/getEventHandler';
import { setTimeout } from 'timers/promises';

// Subscribes before the bot starts, so events emitted during startup
// (e.g. restored persistent captures) reach monitoring too
function startBot(options: Parameters<typeof botOrchestrator.startBot>[0]) {
    const eventEmitter = new TypedEventEmitter();
    eventEmitter.onEach(
        getEventHandler(options.name, eventEmitter, options.tokenProvider)
    );

    return botOrchestrator.startBot({
        ...options,
        services: { ...options.services, eventEmitter }
    });
}

await featureProvider.load();

// Connect the MTProto user client in the background so the first request doesn't pay for the handshake
warmUpTelegramUserClient().catch((error) =>
    console.error('Failed to warm up Telegram user client', error)
);

// Start the monitoring dashboard
await startDashboardServer();

if (process.env.NODE_ENV == 'production') {
    const fromGroup = (group: {
        commands: CommandAction<IActionState>[];
        scheduled: ScheduledAction<IActionState>[];
        inline?: InlineQueryAction[];
        persistentCaptures: PersistentReplyCapture<object>[];
    }) => ({
        commands: group.commands,
        scheduled: group.scheduled,
        inlineQueries: group.inline ?? [],
        persistentCaptures: group.persistentCaptures
    });

    await Promise.all([
        startBot({
            name: 'kekruga',
            tokenProvider: () => readFile('secrets/token.prod', 'utf-8'),
            actions: fromGroup(mtgCommands),
            chats: {
                ModernChat: ChatId.ModernChat,
                PioneerChat: ChatId.PioneerChat,
                SpellSeeker: ChatId.SpellSeeker,
                StandardChat: ChatId.StandardChat,
                PauperChat: ChatId.PauperChat,
                CbgChant: ChatId.CbgChat
            },
            scheduledPeriod: (60 * 5) as Seconds
        }),
        startBot({
            name: 'botseiju',
            tokenProvider: () => readFile('secrets/token.lviv', 'utf-8'),
            actions: fromGroup(mtgCommands),
            chats: {
                LvivChat: ChatId.LvivChat,
                FrankivskChat: ChatId.FrankivskChat
            },
            scheduledPeriod: (60 * 5) as Seconds
        }),
        startBot({
            name: 'xiao',
            tokenProvider: () => readFile('secrets/token.genshit', 'utf-8'),
            actions: fromGroup(genshinCommands),
            chats: { GenshinChat: ChatId.GenshinChat },
            scheduledPeriod: (60 * 5) as Seconds
        }),
        startBot({
            name: 'zirda',
            tokenProvider: () => readFile('secrets/token.zirda', 'utf-8'),
            actions: {
                commands: [cardSearch],
                scheduled: [],
                inlineQueries: [inlineCardSearch],
                messageFilter: (message) => message.text.includes('[')
            },
            chats: {},
            scheduledPeriod: (60 * 5) as Seconds
        })
    ]);
} else {
    await startBot({
        name: 'test',
        tokenProvider: () => readFile('secrets/token.test', 'utf-8'),
        actions: {
            commands: testCommands.commands,
            scheduled: testCommands.scheduled,
            inlineQueries: testCommands.inline,
            persistentCaptures: testCommands.persistentCaptures
        },
        chats: {
            TestChat: ChatId.TestChat
        },
        scheduledPeriod: 60 as Seconds
    });
}

// Stay subscribed (not `once`) and ignore repeated signals, so a second Ctrl+C doesn't kill the process mid-shutdown
let isShuttingDown = false;
async function shutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    await botOrchestrator.stopBots();
    await setTimeout(1000);
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Sent by the network failover script after switching interfaces
process.on('SIGUSR2', () => {
    console.log('Received SIGUSR2, reconnecting bots');
    botOrchestrator.reconnect();

    for (const bot of botOrchestrator.bots) {
        bot.eventEmitter.emit(EventType.botReconnecting, {
            traceId: `SignalHandler:${bot.name}-reconnect` as TraceId
        });
    }
});

process.on('uncaughtException', (error: Error, origin: string) => {
    console.error('[uncaughtException]');
    console.error('  origin :', origin);
    console.error('  name   :', error.name);
    console.error('  message:', error.message);
    console.error('  → Exiting with code 1\n');
    process.exit(1);
});

process.on(
    'unhandledRejection',
    (reason: unknown, promise: Promise<unknown>) => {
        console.error('[unhandledRejection]');
        console.error('  promise:', promise);
        console.error('  reason :', reason);
        console.error('  → Exiting with code 1\n');
        process.exit(1);
    }
);
