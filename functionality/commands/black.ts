import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder('Reaction.Black')
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.replyWithImage('monoB');
    })
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();
