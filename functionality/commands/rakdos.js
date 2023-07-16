const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do((ctx) => {
        ctx.imageReply("rakdos");
    })
    .cooldown(7200)
    .disabled()
    .build();