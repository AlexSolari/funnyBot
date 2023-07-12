const CommandBuilder = require('../../helpers/commandBuilder');
const randomInteger = require('../../helpers/randomInt');

module.exports = new CommandBuilder("Reaction.Fang")
    .on(/(фанг|мотом[иы]ш)/i)
    .do((api, msg, result) => {
        const i = randomInteger(0, 2);

        switch (i) {
            case 0:
                api.image("fangAbzan", msg.chat.id, msg.message_id);
                break;
            case 1:
                api.image("fangEsper", msg.chat.id, msg.message_id);
                break;
            case 2:
                api.image("fangLove", msg.chat.id, msg.message_id);
                break;
            default:
                break;
        }
    })
    .cooldown(7200)
    .disabled()
    .build();