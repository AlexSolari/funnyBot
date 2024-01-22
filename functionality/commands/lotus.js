const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Lotus")
    .on(/лотус/i)
    .do((ctx) => {
        let imageName = randomInteger(0, 1)
            ? "dampingSphere_funny"
            : "dampingSphere";

        if (imageName == "dampingSphere_funny") {
            imageName += randomInteger(1, 3);
        }

        ctx.replyWithImage(imageName);
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .build();