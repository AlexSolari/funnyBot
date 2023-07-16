const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Control")
    .on(/контроль/i)
    .do((ctx) => {
        ctx.imageReply("control");
    })
    .cooldown(7200)
    .disabled()
    .build();