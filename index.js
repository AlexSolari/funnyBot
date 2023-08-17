const fs = require('fs');
const Bot = require('./entities/bot');
const functionality = require('./functionality/functionality');

startBot("main", 'token.prod');
startBot("lviv", 'token.lviv');

function startBot(name, tokenFile) {
    console.log(`Initializing bot [${name}]...`);

    const bot = new Bot(name);

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