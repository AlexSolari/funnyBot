import { CommandBuilder } from '../../helpers/commandBuilder';

export const newsHelicopter = new CommandBuilder('Reaction.NewsHelicopter')
    .on(/mtgstocks\.com/i)
    .do(async (ctx) => {
        ctx.reply.withImage('news');
    })
    .build();
