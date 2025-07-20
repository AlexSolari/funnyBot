import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { randomInt } from '../../helpers/randomInt';

export const fang = new CommandActionBuilder('Reaction.Fang')
    .on(/(фанг|мотом[иы]ш)/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.GenshinChat,
        ChatId.CbgChat
    ])
    .do(async (ctx) => {
        const i = randomInt(0, 2);

        switch (i) {
            case 0:
                ctx.reply.withImage('fangAbzan');
                break;
            case 1:
                ctx.reply.withImage('fangEsper');
                break;
            case 2:
                ctx.reply.withImage('fangLove');
                break;
            default:
                break;
        }
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .build();
