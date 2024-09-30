import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .from(SpecificUsers.ihor)
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage("ihor");
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();