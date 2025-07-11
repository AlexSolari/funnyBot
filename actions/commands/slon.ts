import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo('slon');
    })
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .build();
