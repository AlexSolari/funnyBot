const fs = require('fs');
const Bot = require('./entities/bot');
const CommandBuilder = require('./helpers/commandBuilder');
const functionality = require('./functionality/functionality');
const chz = 65947221;

console.log("Initializing bot...");

const bot = new Bot();

functionality.commands.forEach(cmd => bot.addCommand(cmd));
functionality.triggers.forEach(cmd => bot.addTrigger(cmd));

const devLoad = new CommandBuilder("Dev.Load")
    .on(/add (?<name>\w+)/i)
    .do((api, msg, result) => {
        if (msg.from.id != chz){
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
        if (msg.from.id != chz){
            return;
        }
        
        const commandName = `Reaction.${result.groups.name}`;
        console.log(`Unloading command [${commandName}]...`);

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
        bot.start(data);
    }
});