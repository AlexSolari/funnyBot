const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');

module.exports = new CommandBuilder("Reaction.Fang")
    .on(/(фанг|мотом[иы]ш)/i)
    .do((ctx) => {
        const i = randomInteger(0, 2);

        switch (i) {
            case 0:
                ctx.imageReply("fangAbzan");
                break;
            case 1:
                ctx.imageReply("fangEsper");
                break;
            case 2:
                ctx.imageReply("fangLove");
                break;
            default:
                break;
        }
    })
    .cooldown(7200)
    .disabled()
    .build();