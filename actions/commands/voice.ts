import { CommandActionBuilder, MessageType } from 'chz-telegram-bot';
import { configuration } from '../../helpers/getFeatures';

export const voice = new CommandActionBuilder('Reaction.Voice')
    .on(MessageType.Voice)
    .do(async (ctx) => {
        ctx.reply.withText('сам свою залупу слухай');
    })
    .withConfiguration(configuration)
    .build();
