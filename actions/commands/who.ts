import { CommandBuilder } from '../../helpers/commandBuilder';
import { randomInt } from '../../helpers/randomInt';
import { nameSave } from './nameSave';

export const who = new CommandBuilder('Reaction.Who')
    .on(/^\/(?:who|кто) (.+)$/i)
    .do(async (ctx) => {
        const text = ctx.matchResults[0][1];

        const namesState = ctx.loadStateOf(nameSave);
        const users = Object.values(namesState.lastUsername);

        if (users.length === 0) {
            ctx.reply.withText('Не можу знайти нікого у чаті');
            return;
        }

        const randomUser = users[randomInt(0, users.length - 1)];
        ctx.reply.withText(`${randomUser} ${text}`);
    })
    .build();
