import { CommandBuilder } from '../../helpers/commandBuilder';

export const randomizer = new CommandBuilder('Reaction.Randomizer')
    .on(/^\/r (\d+)$/i)
    .do(async (ctx) => {
        const max = Number.parseInt(ctx.matchResults[0][1], 10);
        if (max < 1) {
            ctx.reply.withText('Число має бути більше 0');
            return;
        }
        const result = Math.floor(Math.random() * max) + 1;
        ctx.reply.withText(String(result));
    })
    .build();
