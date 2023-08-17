const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do((ctx) => {
        ctx.imageReply("rakdos");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .disabled()
    .build();