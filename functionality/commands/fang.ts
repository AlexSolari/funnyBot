import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import randomInteger from '../../helpers/randomInt';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder('Reaction.Fang')
    .on(/(фанг|мотом[иы]ш)/i)
    .do(async (ctx) => {
        const i = randomInteger(0, 2);

        switch (i) {
            case 0:
                ctx.replyWithImage('fangAbzan');
                break;
            case 1:
                ctx.replyWithImage('fangEsper');
                break;
            case 2:
                ctx.replyWithImage('fangLove');
                break;
            default:
                break;
        }
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .build();
