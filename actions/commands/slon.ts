import { CommandActionBuilder } from 'chz-telegram-bot';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const slon = new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo('slon');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
