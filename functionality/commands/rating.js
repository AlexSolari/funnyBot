const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Rating")
    .on(/youtube\.com\/watch\?/i)
    .do((ctx) => {
        if (randomInteger(0, 1) == 0) {
            ctx.imageReply("bad");
        }
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .build();