const fs = require('fs');
const Bot = require('./entities/bot');
const functionality = require('./functionality/functionality');

console.log("Initializing bot...");

const bot = new Bot();

functionality.commands.forEach(cmd => bot.addCommand(cmd));
functionality.triggers.forEach(cmd => bot.addTrigger(cmd));

fs.readFile('token.prod', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        bot.start(data);
    }
});