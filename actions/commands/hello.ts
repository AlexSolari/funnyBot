import { CommandActionBuilder } from 'chz-telegram-bot';
import { configuration } from '../../helpers/getFeatures';

export const hello = new CommandActionBuilder('Reaction.Hello')
    .on('ні')
    .do(async (ctx) => {
        ctx.reply.withText('hello');
    })
    .withConfiguration(configuration)
    .build();
