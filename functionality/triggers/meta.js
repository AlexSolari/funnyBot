import TriggerBuilder from '../../helpers/builders/triggerBuilder.js';
import formatDate from '../../helpers/formatDate.js';
import { load } from 'cheerio';
import fetch from 'node-fetch';
import { modernChat, pioneerChat, lvivChat } from '../../helpers/chatIds.js';
import markdownEscape from 'markdown-escape';

async function loadTournaments(formatName) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const response = await fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${formatDate(yesterday)}+-+${formatDate(today)}&commit=Search`)
    const text = await response.text();
    const findInDOM = load(text);
    const links = findInDOM('.table-responsive td a').toArray();
    const parsedData = links
        .map(link => `[${markdownEscape(link.children[0].data)}](https://www.mtggoldfish.com${link.attribs.href})`)
        .join('\n');

    return parsedData ?? "";
}

export default new TriggerBuilder("Trigger.Meta")
    .at(18) //18:00 Kiev time
    .allowIn([modernChat, pioneerChat, lvivChat])
    .do(async (ctx) => {
        switch (ctx.chatId) {
            case pioneerChat:
                const pioneer = await loadTournaments('pioneer');

                if (pioneer.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${pioneer}`);
                }
                break;
            case modernChat:
                const modern = await loadTournaments('modern');

                if (modern.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${modern}`);
                }

                break;
            case lvivChat:
                const pioneerTournaments = await loadTournaments('pioneer');
                const modernTournaments = await loadTournaments('modern');
                const standardTournaments = await loadTournaments('standard');

                let pioneerString = '';
                let modernString = '';
                let standardString = '';

                if (pioneerTournaments.length > 0) {
                    pioneerString = `Піонер: \n\n${pioneerTournaments}\n\n`;
                }
                if (modernTournaments.length > 0) {
                    modernString = `Модерн: \n\n${modernTournaments}\n\n`;
                }
                if (standardTournaments.length > 0) {
                    standardString = `Стандарт: \n\n${standardTournaments}`;
                }

                if (pioneerString.length > 0
                    || modernString.length > 0
                    || standardString.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n ${modernString} ${pioneerString} ${standardString}`);
                }
            default:
                return;
        }
    })
    .build();