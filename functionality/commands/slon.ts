import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.replyWithVideo('slon');
    })
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .build();
