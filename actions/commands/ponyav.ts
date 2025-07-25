import { CommandActionBuilder } from 'chz-telegram-bot';
import { configuration } from '../../helpers/getFeatures';

export const ponyav = new CommandActionBuilder('Reaction.Ponyav')
    .on('поняв')
    .do(async (ctx) => {
        ctx.reply.withText('в штани намоняв');
    })
    .withConfiguration(configuration)
    .build();
