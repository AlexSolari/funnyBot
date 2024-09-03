import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat, pauperChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Fang")
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
    .ignoreChat(lvivChat)
    .ignoreChat(pauperChat)
    .build();