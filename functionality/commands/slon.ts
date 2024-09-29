import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Slon")
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.replyWithVideo("slon");
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(2))
    .build();