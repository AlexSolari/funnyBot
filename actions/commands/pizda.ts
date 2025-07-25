import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export const pizda = new CommandActionBuilder('Reaction.Pizda')
    .on('да')
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.CbgChat
    ])
    .do(async (ctx) => {
        ctx.reply.withText('пизда');
    })
    .withCooldown({ cooldown: hoursToSeconds(2 as Hours) })
    .build();
