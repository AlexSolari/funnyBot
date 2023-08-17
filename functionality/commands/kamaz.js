const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do((ctx) => {
        ctx.imageReply("kamazGun");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .disabled()
    .build();