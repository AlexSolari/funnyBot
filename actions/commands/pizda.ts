import { CommandBuilder } from '../../helpers/commandBuilder';

export const pizda = new CommandBuilder('Reaction.Pizda')
    .on('да')
    .do(async (ctx) => {
        ctx.reply.withText('пизда');
    })
    .build();
