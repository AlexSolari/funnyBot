import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../../types/chatIds';
import { SpecificUsers } from '../../../types/userIds';

export default new CommandActionBuilder('Reaction.Ihor')
    .on(/мод[еє]рн/i)
    .from(SpecificUsers.ihor)
    .when((ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx) => {
        ctx.reply.withImage('ihor');
    })
    .cooldown(hoursToSeconds(2 as Hours))
    .disabled()
    .build();
