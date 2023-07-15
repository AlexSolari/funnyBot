const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Hello")
    .on("ні")
    .do((api, msg, result) => {
        api.reply("hello", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();