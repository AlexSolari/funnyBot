const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do((ctx) => {
        ctx.reply("пизда");
    })
    .cooldown(7200)
    .build();