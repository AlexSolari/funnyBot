import {
    botOrchestrator,
    CommandAction,
    InlineQueryAction,
    IActionState,
    ScheduledAction,
    Seconds
} from 'chz-telegram-bot';
import {
    genshinCommands,
    mtgCommands,
    testCommands
} from './actions/actionGroups';
import { ChatId } from './types/chatIds';
import { cardSearch } from './actions/commands/cardSearch';
import { inlineCardSearch } from './actions/inline/inline_cardSearch';
import { featureProvider } from './services/featureProvider';
import {
    startDashboardServer,
    createMonitoringEventHandler
} from './monitoring';
import { readFile } from 'fs/promises';

function getEventHandler(botName: string) {
    const monitoringHandler = createMonitoringEventHandler(botName);

    return (e: string, timestamp: number, data: unknown) => {
        // Feed events to monitoring system
        monitoringHandler(e, timestamp, data);

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

await featureProvider.load();

// Start the monitoring dashboard
await startDashboardServer();

if (process.env.NODE_ENV == 'production') {
    const fromGroup = (group: {
        commands: CommandAction<IActionState>[];
        scheduled: ScheduledAction<IActionState>[];
        inline?: InlineQueryAction[];
    }) => ({
        commands: group.commands,
        scheduled: group.scheduled,
        inlineQueries: group.inline ?? []
    });

    const bots = await Promise.all([
        botOrchestrator.startBot({
            name: 'kekruga',
            tokenProvider: () => readFile('token.prod', 'utf-8'),
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
        botOrchestrator.startBot({
            name: 'botseiju',
            tokenProvider: () => readFile('token.lviv', 'utf-8'),
            actions: fromGroup(mtgCommands),
            chats: {
                LvivChat: ChatId.LvivChat,
                FrankivskChat: ChatId.FrankivskChat
            },
            scheduledPeriod: (60 * 5) as Seconds
        }),
        botOrchestrator.startBot({
            name: 'xiao',
            tokenProvider: () => readFile('token.genshit', 'utf-8'),
            actions: fromGroup(genshinCommands),
            chats: { GenshinChat: ChatId.GenshinChat },
            scheduledPeriod: (60 * 5) as Seconds
        }),
        botOrchestrator.startBot({
            name: 'zirda',
            tokenProvider: () => readFile('token.zirda', 'utf-8'),
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

    bots.forEach((bot) => bot.eventEmitter.onEach(getEventHandler(bot.name)));
} else {
    const bot = await botOrchestrator.startBot({
        name: 'test',
        tokenProvider: () => readFile('token.test', 'utf-8'),
        actions: {
            commands: testCommands.commands,
            scheduled: testCommands.scheduled,
            inlineQueries: testCommands.inline
        },
        chats: {
            TestChat: ChatId.TestChat
        },
        scheduledPeriod: 60 as Seconds
    });

    bot.eventEmitter.onEach(getEventHandler(bot.name));
}

process.once('SIGINT', async () => {
    await botOrchestrator.stopBots();
    process.exit(0);
});
process.once('SIGTERM', async () => {
    await botOrchestrator.stopBots();
    process.exit(0);
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
        console.error('  → Continuing after unhandledRejection\n');
    }
);
