const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do((ctx) => {
        ctx.imageReply("kalitas");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .disabled()
    .build();