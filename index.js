import { readFile } from "node:fs/promises";
import Bot from './entities/bot.js';
import { modernChat, pioneerChat, spellSeeker, lvivChat, standardChat } from './helpers/chatIds.js';

startBot("main", 'token.prod', [modernChat, pioneerChat, spellSeeker, standardChat]);
startBot("lviv", 'token.lviv', [lvivChat]);
//startBot("test", 'token.test', [-1001759510701]);

async function startBot(name, tokenFile, broadcastPool) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name, broadcastPool);
    const token = await readFile(tokenFile, 'utf8');

    bot.start(token);
}