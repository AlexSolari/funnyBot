import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';

export default new CommandActionBuilder('Reaction.Ihor')
    .on(/мод[еє]рн/i)
    .from(SpecificUsers.ihor)
    .when((ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage('ihor');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();
