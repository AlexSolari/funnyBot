import functionality from './functionality/functionality.js';
import { ChatId } from './types/chatIds.js';
import { startBot, stopBots } from 'chz-telegram-bot';

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
        }
    });
    startBot({
        name: 'botseiju',
        tokenFilePath: 'token.lviv',
        commands: functionality.commands,
        scheduled: functionality.scheduled,
        chats: {
            LvivChat: ChatId.LvivChat,
            FrankivskChat: ChatId.FrankivskChat
        }
    });
} else {
    startBot({
        name: 'test',
        tokenFilePath: 'token.test',
        commands: functionality.commands,
        scheduled: functionality.scheduled,
        chats: {
            TestChat: ChatId.TestChat
        }
    });
}

process.once('SIGINT', () => stopBots('SIGINT'));
process.once('SIGTERM', () => stopBots('SIGTERM'));
