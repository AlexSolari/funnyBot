const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Control")
    .on(/контроль/i)
    .do((ctx) => {
        ctx.replyWithImage("control");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .disabled()
    .build();