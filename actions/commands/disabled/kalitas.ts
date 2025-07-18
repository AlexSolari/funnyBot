import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Kalitas')
    .on(/калитас/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.withImage('kalitas');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .disabled()
    .build();
