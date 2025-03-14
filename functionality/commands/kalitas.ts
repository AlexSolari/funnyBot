import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Kalitas')
    .on(/калитас/i)
    .do(async (ctx) => {
        ctx.replyWithImage('kalitas');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .disabled()
    .build();
