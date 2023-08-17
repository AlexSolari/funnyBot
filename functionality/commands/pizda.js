const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do((ctx) => {
        ctx.reply("пизда");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .build();