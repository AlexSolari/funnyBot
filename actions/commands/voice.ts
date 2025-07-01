import { CommandActionBuilder, Hours, MessageType } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilder('Reaction.Voice')
    .on(MessageType.Voice)
    .when((ctx) => ctx.chatInfo.id == ChatId.FrankivskChat)
    .do(async (ctx) => {
        ctx.reply.withText('сам свою залупу слухай');
    })
    .cooldown(hoursToSeconds(1 as Hours))
    .build();
