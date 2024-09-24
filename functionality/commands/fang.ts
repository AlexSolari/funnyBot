import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';

export default new CommandBuilder("Reaction.Fang")
    .on(/(фанг|мотом[иы]ш)/i)
    .do(async (ctx) => {
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
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();