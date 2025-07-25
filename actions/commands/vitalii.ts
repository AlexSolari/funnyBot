import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const vitalii = new CommandActionBuilder('Reaction.Vitalii')
    .on(/маліфо/i)
    .do(async (ctx) => {
        ctx.reply.withImage('malifo');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
