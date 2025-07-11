import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Kalitas')
    .on(/калитас/i)
    .do(async (ctx) => {
        ctx.reply.withImage('kalitas');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .disabled()
    .build();
