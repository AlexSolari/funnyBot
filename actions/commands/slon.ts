import { CommandBuilder } from '../../helpers/commandBuilder';

export const slon = new CommandBuilder('Reaction.Slon')
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.reply.andQuote.withVideo('slon');
    })
    .build();
