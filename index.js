const fs = require('fs');
const Bot = require('./entities/bot');
const functionality = require('./functionality/functionality');
const chatIds = require('./helpers/chatIds');

startBot("main", 'token.prod', [chatIds.modernChat, chatIds.pioneerChat, chatIds.spellSeeker]);
startBot("lviv", 'token.lviv', [chatIds.lvivChat]);

function startBot(name, tokenFile, broadcastPool) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name, broadcastPool);

    functionality.commands.forEach(cmd => bot.addCommand(cmd));
    functionality.triggers.forEach(cmd => bot.addTrigger(cmd));

    fs.readFile(tokenFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            bot.start(data);
        }
    });
}