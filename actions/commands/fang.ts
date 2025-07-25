import { CommandActionBuilder } from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import { configuration } from '../../helpers/getFeatures';

export const fang = new CommandActionBuilder('Reaction.Fang')
    .on(/(фанг|мотом[иы]ш)/i)
    .do(async (ctx) => {
        const i = randomInt(0, 2);

        switch (i) {
            case 0:
                ctx.reply.withImage('fangAbzan');
                break;
            case 1:
                ctx.reply.withImage('fangEsper');
                break;
            case 2:
                ctx.reply.withImage('fangLove');
                break;
            default:
                break;
        }
    })
    .withConfiguration(configuration)
    .build();
