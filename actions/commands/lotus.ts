import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
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

        ctx.replyWithImage(imageName);
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.GenshinChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .build();
