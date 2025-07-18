import { CommandActionBuilder, Hours, hoursToSeconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.Hello')
    .on('ні')
    .notIn([ChatId.LvivChat, ChatId.FrankivskChat])
    .do(async (ctx) => {
        ctx.reply.withText('hello');
    })
    .withCooldown({ seconds: hoursToSeconds(2 as Hours) })
    .build();
