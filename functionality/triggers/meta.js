import TriggerBuilder from '../../helpers/builders/triggerBuilder.js';
import { load } from 'cheerio';
import { modernChat, pioneerChat, lvivChat, standardChat, pauperChat } from '../../helpers/chatIds.js';
import escapeMarkdown from '../../helpers/escapeMarkdown.js';
import moment from 'moment';

async function loadTournaments(formatName) {
    const today = moment().format('MM/DD/YYYY');
    const yesterday = moment().subtract(1, 'day').format('MM/DD/YYYY');

    const response = await fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${yesterday}+-+${today}&commit=Search`)
    const text = await response.text();
    const findInDOM = load(text);
    const links = findInDOM('.table-responsive td a').toArray();
    const parsedData = links
        .map(link => `[${escapeMarkdown(link.children[0].data)}](https://www.mtggoldfish.com${link.attribs.href})`)
        .join('\n');

    return parsedData ?? "";
}

const FormatName = {
    Pioneer: 'pioneer',
    Modern: 'modern',
    Standard: 'standard',
    Pauper: 'pauper'
}

export default new TriggerBuilder("Trigger.Meta")
    .at(18) //18:00 Kiev time
    .allowIn([modernChat, pioneerChat, lvivChat, standardChat, pauperChat])
    .withSharedCache(FormatName.Pioneer, () => loadTournaments(FormatName.Pioneer))
    .withSharedCache(FormatName.Modern, () => loadTournaments(FormatName.Modern))
    .withSharedCache(FormatName.Standard, () => loadTournaments(FormatName.Standard))
    .withSharedCache(FormatName.Pauper, () => loadTournaments(FormatName.Pauper))
    .do(async (ctx, getCached) => {
        switch (ctx.chatId) {
            case pioneerChat: {
                const pioneerTournaments = await getCached(FormatName.Pioneer);

                if (pioneerTournaments.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${pioneerTournaments}`);
                }
                break;
            }
            case modernChat: {
                const modernTournaments = await getCached(FormatName.Modern);

                if (modernTournaments.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${modernTournaments}`);
                }

                break;
            }
            case standardChat: {
                const standardTournaments = await getCached(FormatName.Standard);

                if (standardTournaments.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${standardTournaments}`);
                }

                break;
            }
            case pauperChat: {
                const pauperTournaments = await getCached(FormatName.Pauper);

                if (pauperTournaments.length > 0) {
                    ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${pauperTournaments}`);
                }

                break;
            }
            case lvivChat: {
                const pioneerTournaments = await getCached(FormatName.Pioneer);
                const modernTournaments = await getCached(FormatName.Modern);
                const standardTournaments = await getCached(FormatName.Standard);

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
                break;
            }
            default:
                return;
        }
    })
    .build();