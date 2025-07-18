import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.IdiNahui')
    .on(/р+у+с+к+и+й+/gi)
    .in([ChatId.GenshinChat])
    .do(async (ctx) => {
        ctx.reply.andQuote.withText('военный корабль іді нахуй');
    })
    .withCooldown({ seconds: hoursToSeconds(1 as Hours) })
    .build();
