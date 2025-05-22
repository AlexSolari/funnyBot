import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Black')
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.replyWithImage('monoB');
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();
