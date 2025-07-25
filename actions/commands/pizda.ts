import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const pizda = new CommandActionBuilder('Reaction.Pizda')
    .on('да')
    .do(async (ctx) => {
        ctx.reply.withText('пизда');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
