import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Rating')
    .on(/youtube\.com\/watch\?/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.CbgChat
    ])
    .when(() => randomInt(0, 1) == 0)
    .do(async (ctx) => {
        ctx.reply.withImage('bad');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .build();
