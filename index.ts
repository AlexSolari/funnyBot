import { readFile } from 'fs/promises';
import Bot from './entities/bot.js';
import { ChatId } from './helpers/chatIds.js';

startBot("main", 'token.prod', [ChatId.ModernChat, ChatId.PioneerChat, ChatId.SpellSeeker, ChatId.StandardChat, ChatId.PauperChat]);
startBot("lviv", 'token.lviv', [ChatId.LvivChat]);
//startBot("test", 'token.test', [-1001759510701]);

async function startBot(name: string, tokenFile: string, broadcastPool: number[]) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name, broadcastPool);
    const token = await readFile(tokenFile, 'utf8');

    bot.start(token);
}