import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.IdiNahui')
    .on(/р+у+с+к+и+й+/gi)
    .when(
        (ctx) =>
            ctx.chatInfo.id == ChatId.GenshinChat ||
            ctx.chatInfo.id == ChatId.TestChat
    )
    .do(async (ctx) => {
        ctx.reply.andQuote.withText('военный корабль іді нахуй');
    })
    .cooldown(hoursToSeconds(1 as Hours))
    .build();
