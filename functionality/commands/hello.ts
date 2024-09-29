import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Hello")
    .on("ні")
    .do(async (ctx) => {
        ctx.replyWithText("hello");
    })
    .cooldown(hoursToSeconds(2))
    .ignoreChat(ChatId.LvivChat)
    .build();