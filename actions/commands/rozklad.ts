import { load } from 'cheerio';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const rozklad = new CommandBuilder('Reaction.Schedule')
    .on(['розклад'])
    .do(async (ctx) => {
        const response = await fetch(
            `https://t.me/s/otawaratcg?q=%D1%80%D0%BE%D0%B7%D0%BA%D0%BB%D0%B0%D0%B4`
        );
        const text = await response.text();

        const findInDOM = load(text);
        const posts = findInDOM('.js-widget_message').toArray();
        const link = posts.at(-1)!.attribs['data-post'];

        ctx.reply.withText(`[Розклад на цей тиждень](https://t.me/${link})`);
    })
    .build();
