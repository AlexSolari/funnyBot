import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Fang')
    .on(/(фанг|мотом[иы]ш)/i)
    .do(async (ctx) => {
        const i = randomInt(0, 2);

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
