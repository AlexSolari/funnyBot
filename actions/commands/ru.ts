import { CommandBuilder } from '../../helpers/commandBuilder';

export const ru = new CommandBuilder('Reaction.IdiNahui')
    .on(/р+у+с+к+и+й+/gi)
    .do(async (ctx) => {
        ctx.reply.andQuote.withText('военный корабль іді нахуй');
    })
    .build();
