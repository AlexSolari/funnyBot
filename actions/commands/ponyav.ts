import { CommandBuilder } from '../../helpers/commandBuilder';

export const ponyav = new CommandBuilder('Reaction.Ponyav')
    .on('поняв')
    .do(async (ctx) => {
        ctx.reply.withText('в штани намоняв');
    })
    .build();
