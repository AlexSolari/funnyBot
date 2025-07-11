import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Black')
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.reply.withImage('monoB');
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .ignoreChat(ChatId.GenshinChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();
