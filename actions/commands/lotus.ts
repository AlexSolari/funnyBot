import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Lotus')
    .on(/лотус/i)
    .do(async (ctx) => {
        let imageName = randomInt(0, 1)
            ? 'dampingSphere_funny'
            : 'dampingSphere';

        if (imageName == 'dampingSphere_funny') {
            imageName += randomInt(1, 4);
        }

        ctx.reply.withImage(imageName);
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.GenshinChat)
    .ignoreChat(ChatId.CbgChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .build();
