const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do((api, msg, result) => {
        api.image("kamazGun", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();