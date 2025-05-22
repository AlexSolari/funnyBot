import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Control')
    .on(/контроль/i)
    .do(async (ctx) => {
        ctx.replyWithImage('control');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .disabled()
    .build();
