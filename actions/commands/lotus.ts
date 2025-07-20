import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { randomInt } from '../../helpers/randomInt';

export const lotus = new CommandActionBuilder('Reaction.Lotus')
    .on(/лотус/i)
    .notIn([
        ChatId.LvivChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat,
        ChatId.GenshinChat,
        ChatId.CbgChat
    ])
    .do(async (ctx) => {
        let imageName = randomInt(0, 1)
            ? 'dampingSphere_funny'
            : 'dampingSphere';

        if (imageName == 'dampingSphere_funny') {
            imageName += randomInt(1, 4);
        }

        ctx.reply.withImage(imageName);
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .build();
