import { randomInt } from '../../helpers/randomInt';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const lotus = new CommandBuilder('Reaction.Lotus')
    .on(/лотус/i)
    .do(async (ctx) => {
        let imageName = randomInt(0, 1)
            ? 'dampingSphere_funny'
            : 'dampingSphere';

        if (imageName == 'dampingSphere_funny') {
            imageName += randomInt(1, 4);
        }

        ctx.reply.withImage(imageName);
    })
    .build();
