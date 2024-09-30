import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder("Reaction.Pizda")
    .on("да")
    .do(async (ctx) => {
        ctx.replyWithText("пизда");
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();