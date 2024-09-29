import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Control")
    .on(/контроль/i)
    .do(async (ctx) => {
        ctx.replyWithImage("control");
    })
    .cooldown(hoursToSeconds(2))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .disabled()
    .build();