const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Hello")
    .on("ні")
    .do((ctx) => {
        ctx.reply("hello");
    })
    .cooldown(7200)
    .build();