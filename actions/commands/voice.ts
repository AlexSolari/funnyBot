import { MessageType } from 'chz-telegram-bot';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const voice = new CommandBuilder('Reaction.Voice')
    .on(MessageType.Voice)
    .do(async (ctx) => {
        ctx.reply.withText('сам свою залупу слухай');
    })
    .build();
