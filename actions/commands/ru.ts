import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const ru = new CommandActionBuilder('Reaction.IdiNahui')
    .on(/р+у+с+к+и+й+/gi)
    .do(async (ctx) => {
        ctx.reply.andQuote.withText('военный корабль іді нахуй');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
