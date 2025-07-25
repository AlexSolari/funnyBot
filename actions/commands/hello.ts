import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const hello = new CommandActionBuilder('Reaction.Hello')
    .on('ні')
    .do(async (ctx) => {
        ctx.reply.withText('hello');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
