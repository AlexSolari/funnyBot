import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder("Reaction.Vitalii")
    .on(/маліфо/i)
    .from(SpecificUsers.vitalii)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage("malifo");
    })
    .cooldown(hoursToSeconds(24 as Hours))
    .build();