const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Black")
    .on(/моноб/i)
    .do((ctx) => {
        ctx.imageReply("monoB");
    })
    .cooldown(7200)
    .disabled()
    .build();