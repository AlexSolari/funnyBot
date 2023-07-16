const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do((ctx) => {
        ctx.imageReply("kalitas");
    })
    .cooldown(7200)
    .disabled()
    .build();