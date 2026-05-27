import { CommandBuilder } from '../../helpers/commandBuilder';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { randomInt } from '../../helpers/randomInt';
import { nameSave } from './nameSave';

export const who = new CommandBuilder('Reaction.Who')
    .on(/^\/(?:who|кто) (.+)$/i)
    .do(async (ctx) => {
        const question = ctx.matchResults[0][1].trim();
        const text = question.at(-1) == '?' ? question.slice(0, -1) : question;

        const namesState = ctx.loadStateOf(nameSave);

        const names = Object.values(namesState.lastUsername);
        const tags = Object.values(namesState.lastUsertag);
        const tagsWithNameFallback = tags.map((tag, index) => {
            if (tag && tag != 'Unknown user') return tag;

            return names[index];
        });

        if (tagsWithNameFallback.length === 0) {
            ctx.reply.withText('Не можу знайти нікого у чаті');
            return;
        }

        const randomUser =
            tagsWithNameFallback[randomInt(0, tagsWithNameFallback.length - 1)];
        ctx.reply.withText(`${randomUser} ${escapeMarkdown(text)}`);
    })
    .build();
