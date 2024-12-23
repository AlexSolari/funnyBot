import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.replyWithVideo('slon');
    })
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .build();
