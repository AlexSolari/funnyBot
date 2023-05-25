const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do((api, msg, result) => {
        api.reply("пизда", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();