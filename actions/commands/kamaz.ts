import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export const kamaz = new CommandActionBuilder('Reaction.Kamaz')
    .on(/камаз/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.GenshinChat,
        ChatId.CbgChat
    ])
    .do(async (ctx) => {
        ctx.reply.withImage('kamazGun');
    })
    .withCooldown({ cooldown: hoursToSeconds(2 as Hours) })
    .build();
