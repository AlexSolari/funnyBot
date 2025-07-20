import {
    CommandActionBuilder,
    Hours,
    hoursToSeconds,
    MessageType
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export const voice = new CommandActionBuilder('Reaction.Voice')
    .on(MessageType.Voice)
    .in([ChatId.FrankivskChat])
    .do(async (ctx) => {
        ctx.reply.withText('сам свою залупу слухай');
    })
    .withCooldown({ seconds: hoursToSeconds(1 as Hours) })
    .build();
