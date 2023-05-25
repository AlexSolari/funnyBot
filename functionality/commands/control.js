const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Control")
    .on(/контроль/i)
    .do((api, msg, result) => {
        api.image("control", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();