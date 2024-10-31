import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import randomInteger from '../../helpers/randomInt';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder('Reaction.Rating')
    .on(/youtube\.com\/watch\?/i)
    .when(async () => randomInteger(0, 1) == 0)
    .do(async (ctx) => {
        ctx.replyWithImage('bad');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .build();
