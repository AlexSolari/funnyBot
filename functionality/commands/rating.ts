import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { randomInt } from 'crypto';

export default new CommandActionBuilder('Reaction.Rating')
    .on(/youtube\.com\/watch\?/i)
    .when(async () => randomInt(0, 1) == 0)
    .do(async (ctx) => {
        ctx.replyWithImage('bad');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .build();
