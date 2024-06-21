const CommandBuilder = require('../../helpers/commandBuilder');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Hello")
    .on("ні")
    .do((ctx) => {
        ctx.replyWithText("hello");
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .build();