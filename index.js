const fs = require('fs');
const Bot = require('./entities/bot');
const loadFunctionality = require('./functionality/functionality');
const CommandBuilder = require('./helpers/commandBuilder');

console.log("Initializing bot...");

const bot = new Bot();
const functionality = loadFunctionality();

functionality.commands.forEach(cmd => bot.addCommand(cmd));
functionality.triggers.forEach(cmd => bot.addTrigger(cmd));

const devLoad = new CommandBuilder("Dev.Load")
    .on(/add (?<name>\w+)/i)
    .do((api, msg, result) => {
        if (msg.from.id != 65947221){
            return;
        }
        
        const commandName = result.groups.name;
        console.log(`Loading new command [Reaction.${commandName}]...`);

        const command = require(`./functionality/commands/${commandName}`);
        bot.addCommand(command);

        console.log(`[${command.name}] added successfully`);
    })
    .build();

const devUnload = new CommandBuilder("Dev.Unload")
    .on(/remove (?<name>\w+)/i)
    .do((api, msg, result) => {
        if (msg.from.id != 65947221){
            return;
        }
        
        const commandName = `Reaction.${result.groups.name}`;
        console.log(`Unoading command [${commandName}]...`);

        bot.removeCommand(commandName);

        console.log(`[${commandName}] removed successfully`);
    })
    .build();

bot.addCommand(devLoad);
bot.addCommand(devUnload);

fs.readFile('token.prod', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Bot started.");
        bot.start(data);
    }
});