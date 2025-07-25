import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export const slon = new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .notIn([
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo('slon');
    })
    .withCooldown({ cooldown: hoursToSeconds(2 as Hours) })
    .build();
