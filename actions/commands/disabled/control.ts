import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Control')
    .on(/контроль/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.withImage('control');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .disabled()
    .build();
