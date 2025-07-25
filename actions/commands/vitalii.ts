import { CommandActionBuilder } from 'chz-telegram-bot';
import { configuration } from '../../helpers/getFeatures';

export const vitalii = new CommandActionBuilder('Reaction.Vitalii')
    .on(/маліфо/i)
    .do(async (ctx) => {
        ctx.reply.withImage('malifo');
    })
    .withConfiguration(configuration)
    .build();
