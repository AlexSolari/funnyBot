import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const kamaz = new CommandActionBuilder('Reaction.Kamaz')
    .on(/камаз/i)
    .do(async (ctx) => {
        ctx.reply.withImage('kamazGun');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
