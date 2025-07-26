import { CommandBuilder } from '../../helpers/commandBuilder';

export const vitalii = new CommandBuilder('Reaction.Vitalii')
    .on(/маліфо/i)
    .do(async (ctx) => {
        ctx.reply.withImage('malifo');
    })
    .build();
