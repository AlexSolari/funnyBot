const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Black")
    .on(/моноб/i)
    .do((api, msg, result) => {
        api.image("monoB", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();