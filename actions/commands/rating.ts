import { CommandActionBuilder } from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const rating = new CommandActionBuilder('Reaction.Rating')
    .on(/youtube\.com\/watch\?/i)
    .when(() => randomInt(0, 1) == 0)
    .do(async (ctx) => {
        ctx.reply.withImage('bad');
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
