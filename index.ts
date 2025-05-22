import functionality from './functionality/functionality.js';
import { ChatId } from './types/chatIds.js';
import { Seconds, startBot, stopBots } from 'chz-telegram-bot';

if (process.env.NODE_ENV == 'production') {
    startBot({
        name: 'kekruga',
        tokenFilePath: 'token.prod',
        commands: functionality.commands,
        scheduled: functionality.scheduled,
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
        commands: functionality.commands,
        scheduled: functionality.scheduled,
        chats: {
            LvivChat: ChatId.LvivChat,
            FrankivskChat: ChatId.FrankivskChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
    startBot({
        name: 'xiao',
        tokenFilePath: 'token.genshit',
        commands: functionality.commands,
        scheduled: functionality.scheduled,
        chats: {
            GenshinChat: ChatId.GenshinChat
        },
        scheduledPeriod: (60 * 5) as Seconds
    });
} else {
    startBot({
        name: 'test',
        tokenFilePath: 'token.test',
        commands: functionality.commands,
        scheduled: functionality.scheduled,
        chats: {
            TestChat: ChatId.TestChat
        },
        scheduledPeriod: 60 as Seconds,
        verboseLoggingForIncomingMessage: false
    });
}

process.once('SIGINT', () => {
    stopBots('SIGINT');
    process.exit(0);
});
process.once('SIGTERM', () => {
    stopBots('SIGTERM');
    process.exit(0);
});
