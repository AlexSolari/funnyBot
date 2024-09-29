import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do(async (ctx) => {
        ctx.replyWithImage("kamazGun");
    })
    .cooldown(hoursToSeconds(2))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();