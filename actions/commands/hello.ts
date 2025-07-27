import { CommandBuilder } from '../../helpers/commandBuilder';

export const hello = new CommandBuilder('Reaction.Hello')
    .on('ні')
    .do(async (ctx) => {
        ctx.reply.withText('hello');
    })
    .build();
