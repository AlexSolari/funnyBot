import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';

export default new CommandActionBuilder('Reaction.Vitalii')
    .on(/маліфо/i)
    .from(SpecificUsers.vitalii)
    .when(async (ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.replyWithImage('malifo');
    })
    .cooldown(hoursToSeconds(24 as Hours))
    .build();
