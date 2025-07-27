import { randomInt } from '../../helpers/randomInt';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const rating = new CommandBuilder('Reaction.Rating')
    .on(/youtube\.com\/watch\?/i)
    .when(() => randomInt(0, 1) == 0)
    .do(async (ctx) => {
        ctx.reply.withImage('bad');
    })
    .build();
