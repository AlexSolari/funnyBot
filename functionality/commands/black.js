const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Black")
    .on(/моноб/i)
    .do((ctx) => {
        ctx.replyWithImage("monoB");
    })
    .ignoreChat(chatIds.lvivChat)
    .cooldown(7200)
    .disabled()
    .build();