import { CommandBuilder } from '../../helpers/commandBuilder';

export const kamaz = new CommandBuilder('Reaction.Kamaz')
    .on(/камаз/i)
    .do(async (ctx) => {
        ctx.reply.withImage('kamazGun');
    })
    .build();
