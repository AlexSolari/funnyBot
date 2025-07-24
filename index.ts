import { botOrchestrator, Seconds } from 'chz-telegram-bot';
import {
    genshinCommands,
    mtgCommands,
    testCommands
} from './actions/actionGroups.js';
import { ChatId } from './types/chatIds.js';
import { cardSearch } from './actions/commands/cardSearch_small.js';
import { inlineCardSearch } from './actions/inline/inline_cardSearch.js';

if (process.env.NODE_ENV == 'production') {
    botOrchestrator.startBot({
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
    botOrchestrator.startBot({
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
    botOrchestrator.startBot({
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
    botOrchestrator.startBot({
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
} else {
    botOrchestrator.startBot({
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
}

process.once('SIGINT', async () => {
    await botOrchestrator.stopBots('SIGINT');
    process.exit(0);
});
process.once('SIGTERM', async () => {
    await botOrchestrator.stopBots('SIGTERM');
    process.exit(0);
});
