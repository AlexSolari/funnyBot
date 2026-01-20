import { CommandBuilder } from '../../helpers/commandBuilder';
import { randomInt } from '../../helpers/randomInt';

export const slon = new CommandBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo(`slon${randomInt(1, 2)}`);
    })
    .build();
