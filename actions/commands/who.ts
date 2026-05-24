import { CommandBuilder } from '../../helpers/commandBuilder';
import { randomInt } from '../../helpers/randomInt';
import { nameSave } from './nameSave';

export const who = new CommandBuilder('Reaction.Who')
    .on(/^\/(?:who|кто) (.+)$/i)
    .do(async (ctx) => {
        const question = ctx.matchResults[0][1].trim();
        const text = question.at(-1) == '?' ? question.slice(0, -1) : question;

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
