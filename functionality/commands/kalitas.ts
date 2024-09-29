import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';

export default new CommandActionBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do(async (ctx) => {
        ctx.replyWithImage("kalitas");
    })
    .cooldown(hoursToSeconds(2))
    .ignoreChat(ChatId.LvivChat)
    .disabled()
    .build();