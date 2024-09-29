import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Black")
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.replyWithImage("monoB");
    })
    .ignoreChat(ChatId.LvivChat)
    .cooldown(hoursToSeconds(2))
    .disabled()
    .build();