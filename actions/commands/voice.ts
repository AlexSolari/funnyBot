import {
    CommandActionBuilder,
    Hours,
    hoursToSeconds,
    MessageType
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilder('Reaction.Voice')
    .on(MessageType.Voice)
    .when((ctx) => ctx.chatInfo.id == ChatId.FrankivskChat)
    .do(async (ctx) => {
        ctx.reply.withText('сам свою залупу слухай');
    })
    .cooldown(hoursToSeconds(1 as Hours))
    .build();
