import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { SpecificUsers } from '../../types/userIds';

export default new CommandActionBuilder('Reaction.Vitalii')
    .on(/маліфо/i)
    .from(SpecificUsers.vitalii)
    .in([ChatId.LvivChat])
    .do(async (ctx) => {
        ctx.reply.withImage('malifo');
    })
    .withCooldown({ seconds: hoursToSeconds(24 as Hours) })
    .build();
