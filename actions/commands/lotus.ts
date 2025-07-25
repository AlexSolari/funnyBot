import { CommandActionBuilder } from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const lotus = new CommandActionBuilder('Reaction.Lotus')
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
    .withConfiguration(() => featureSetConfiguration)
    .build();
