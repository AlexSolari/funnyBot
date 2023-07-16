const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do((ctx) => {
        ctx.imageReply("kamazGun");
    })
    .cooldown(7200)
    .disabled()
    .build();