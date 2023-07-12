const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do((api, msg, result) => {
        api.image("kalitas", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .disabled()
    .build();