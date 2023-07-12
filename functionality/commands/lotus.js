const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');

module.exports = new CommandBuilder("Reaction.Lotus")
    .on(/лотус/i)
    .do((api, msg, result) => {
        let imageName = randomInteger(0, 1)
            ? "dampingSphere_funny"
            : "dampingSphere";

        if (imageName == "dampingSphere_funny") {
            imageName += randomInteger(1, 3);
        }

        api.image(imageName, msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .disabled()
    .build();