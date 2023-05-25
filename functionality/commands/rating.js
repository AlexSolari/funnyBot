const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');

module.exports = new CommandBuilder("Reaction.Rating")
    .on(/youtube\.com\/watch\?/i)
    .do((api, msg, result) => {
        if (randomInteger(0, 1) == 0) {
            api.image("bad", msg.chat.id, msg.message_id);
        }
    })
    .cooldown(7200)
    .build();