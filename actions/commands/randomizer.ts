import { CommandBuilder } from '../../helpers/commandBuilder';
import { randomInt } from '../../helpers/randomInt';

export const randomizer = new CommandBuilder('Reaction.Randomizer')
    .on(/^\/r (\d+)$/i)
    .do(async (ctx) => {
        const max = Number.parseInt(ctx.matchResults[0][1], 10);

        if (max < 1) {
            ctx.reply.withText('Число має бути більше 0');
            return;
        }

        ctx.reply.withText(`${randomInt(1, max)}`);
    })
    .build();
