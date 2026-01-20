import { botOrchestrator, Seconds } from 'chz-telegram-bot';
import {
    genshinCommands,
    mtgCommands,
    testCommands
} from './actions/actionGroups';
import { ChatId } from './types/chatIds';
import { cardSearch } from './actions/commands/cardSearch';
import { inlineCardSearch } from './actions/inline/inline_cardSearch';
import { featureProvider } from './services/featureProvider';

function getEventHandler(botName: string) {
    return (e: string, timestamp: number, data: unknown) => {
        if (e.startsWith('task') || e.startsWith('storage')) return;

        console.log(
            `${botName} - ${new Date(timestamp).toISOString()} - ${e} - ${JSON.stringify(data)}`
        );
    };
}

await featureProvider.load();

if (process.env.NODE_ENV == 'production') {
    const kekruga = await botOrchestrator.startBot({
        name: 'kekruga',
        tokenFilePath: 'token.prod',
        actions: {
            commands: mtgCommands.commands,
            scheduled: mtgCommands.scheduled,
            inlineQueries: mtgCommands.inline
        },
        chats: {
            ModernChat: ChatId.ModernChat,
            PioneerChat: ChatId.PioneerChat,
            SpellSeeker: ChatId.SpellSeeker,
            StandardChat: ChatId.StandardChat,
            PauperChat: ChatId.PauperChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    const botseiju = await botOrchestrator.startBot({
        name: 'botseiju',
        tokenFilePath: 'token.lviv',
        actions: {
            commands: mtgCommands.commands,
            scheduled: mtgCommands.scheduled,
            inlineQueries: mtgCommands.inline
        },
        chats: {
            LvivChat: ChatId.LvivChat,
            FrankivskChat: ChatId.FrankivskChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    const xiao = await botOrchestrator.startBot({
        name: 'xiao',
        tokenFilePath: 'token.genshit',
        actions: {
            commands: genshinCommands.commands,
            scheduled: genshinCommands.scheduled,
            inlineQueries: []
        },
        chats: {
            GenshinChat: ChatId.GenshinChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    const zirda = await botOrchestrator.startBot({
        name: 'zirda',
        tokenFilePath: 'token.zirda',
        actions: {
            commands: [cardSearch],
            scheduled: [],
            inlineQueries: [inlineCardSearch]
        },
        chats: {},
        scheduledPeriod: (60 * 5) as Seconds
    });

    [botseiju, kekruga, zirda, xiao].forEach((bot) => {
        bot.eventEmitter.onEach(getEventHandler(bot.name));
    });
} else {
    const bot = await botOrchestrator.startBot({
        name: 'test',
        tokenFilePath: 'token.test',
        actions: {
            commands: testCommands.commands,
            scheduled: testCommands.scheduled,
            inlineQueries: testCommands.inline
        },
        chats: {
            TestChat: ChatId.TestChat
        },
        scheduledPeriod: 60 as Seconds,
        verboseLoggingForIncomingMessage: false
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
