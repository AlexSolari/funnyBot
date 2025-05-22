import {
    genshinCommands,
    mtgCommands,
    testCommands
} from './actions/actionGroups.js';
import { ChatId } from './types/chatIds.js';
import { Seconds, startBot, stopBots } from 'chz-telegram-bot';

if (process.env.NODE_ENV == 'production') {
    startBot({
        name: 'kekruga',
        tokenFilePath: 'token.prod',
        commands: mtgCommands.commands,
        scheduled: mtgCommands.scheduled,
        chats: {
            ModernChat: ChatId.ModernChat,
            PioneerChat: ChatId.PioneerChat,
            SpellSeeker: ChatId.SpellSeeker,
            StandardChat: ChatId.StandardChat,
            PauperChat: ChatId.PauperChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    startBot({
        name: 'botseiju',
        tokenFilePath: 'token.lviv',
        commands: mtgCommands.commands,
        scheduled: mtgCommands.scheduled,
        chats: {
            LvivChat: ChatId.LvivChat,
            FrankivskChat: ChatId.FrankivskChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    startBot({
        name: 'xiao',
        tokenFilePath: 'token.genshit',
        commands: genshinCommands.commands,
        scheduled: genshinCommands.scheduled,
        chats: {
            GenshinChat: ChatId.GenshinChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
} else {
    startBot({
        name: 'test',
        tokenFilePath: 'token.test',
        commands: testCommands.commands,
        scheduled: testCommands.scheduled,
        chats: {
            TestChat: ChatId.TestChat
        },
        scheduledPeriod: 60 as Seconds,
        verboseLoggingForIncomingMessage: false
    });
}

process.once('SIGINT', async () => {
    await stopBots('SIGINT');
    process.exit(0);
});
process.once('SIGTERM', async () => {
    await stopBots('SIGTERM');
    process.exit(0);
});
