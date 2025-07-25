import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Black')
    .on(/моноб/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.withImage('monoB');
    })
    .withCooldown({ cooldown: hoursToSeconds(2 as Hours) })
    .disabled()
    .build();
