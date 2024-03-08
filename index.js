const fs = require('fs').promises;
const Bot = require('./entities/bot');
const functionality = require('./functionality/functionality');
const chatIds = require('./helpers/chatIds');

startBot("main", 'token.prod', [chatIds.modernChat, chatIds.pioneerChat, chatIds.spellSeeker]);
startBot("lviv", 'token.lviv', [chatIds.lvivChat]);

async function startBot(name, tokenFile, broadcastPool) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name, broadcastPool);

    functionality.commands.forEach(cmd => bot.addCommand(cmd));
    functionality.triggers.forEach(cmd => bot.addTrigger(cmd));

    const data = await fs.readFile(tokenFile, 'utf8');
    
    bot.start(data);
}