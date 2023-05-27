const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do((api, msg, result) => {
        api.image("rakdos", msg.chat.id, msg.message_id);
    })
    .cooldown(7200)
    .build();