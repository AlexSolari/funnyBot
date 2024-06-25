const { readFile } = require("node:fs/promises");
const Bot = require('./entities/bot');
const chatIds = require('./helpers/chatIds');

startBot("main", 'token.prod', [chatIds.modernChat, chatIds.pioneerChat, chatIds.spellSeeker]);
startBot("lviv", 'token.lviv', [chatIds.lvivChat]);

async function startBot(name, tokenFile, broadcastPool) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name, broadcastPool);
    const token = await readFile(tokenFile, 'utf8');

    bot.start(token);
}