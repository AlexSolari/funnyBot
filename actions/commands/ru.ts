import { CommandBuilder } from '../../helpers/commandBuilder';
import { randomInt } from '../../helpers/randomInt';

export const ru = new CommandBuilder('Reaction.IdiNahui')
    .on(/(рус+ский)/gi)
    .do(async (ctx) => {
        if (randomInt(0, 1) == 0) ctx.reply.andQuote.withText('іді нахуй');
        else ctx.reply.andQuote.withImage('rashuyarim');
    })
    .build();
