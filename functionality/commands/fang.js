const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');
const chatIds = require('../../helpers/chatIds');

module.exports = new CommandBuilder("Reaction.Fang")
    .on(/(фанг|мотом[иы]ш)/i)
    .do((ctx) => {
        const i = randomInteger(0, 2);

        switch (i) {
            case 0:
                ctx.replyWithImage("fangAbzan");
                break;
            case 1:
                ctx.replyWithImage("fangEsper");
                break;
            case 2:
                ctx.replyWithImage("fangLove");
                break;
            default:
                break;
        }
    })
    .cooldown(7200)
    .ignoreChat(chatIds.lvivChat)
    .disabled()
    .build();