import { CommandActionBuilder } from 'chz-telegram-bot';
import { configuration } from '../../helpers/getFeatures';

export const slon = new CommandActionBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo('slon');
    })
    .withConfiguration(configuration)
    .build();
