import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';

export default new CommandActionBuilder('Reaction.Rakdos')
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.FnmChat,
        ChatId.GenshinChat
    ])
    .do(async (ctx) => {
        ctx.reply.withImage('rakdos');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .disabled()
    .build();
