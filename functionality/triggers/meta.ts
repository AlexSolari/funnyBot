import TriggerBuilder from '../../helpers/builders/triggerBuilder';
import { load } from 'cheerio';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import moment from 'moment';
import ChatContext from '../../entities/context/chatContext';
import { ChatId } from '../../helpers/chatIds';

async function loadTournaments(formatName: string): Promise<string> {
    const today = moment().format('MM/DD/YYYY');
    const yesterday = moment().subtract(1, 'day').format('MM/DD/YYYY');

    const response = await fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${yesterday}+-+${today}&commit=Search`)
    const text = await response.text();
    const findInDOM = load(text);
    const links = findInDOM('.table-responsive td a').toArray();
    const parsedData = links
        .map(link => ('data' in link.children[0]) ? `[${escapeMarkdown(link.children[0].data)}](https://www.mtggoldfish.com${link.attribs.href})` : '')
        .join('\n');

    return parsedData.trim() ?? '';
}

enum Format {
    Pioneer = 'pioneer',
    Modern = 'modern',
    Standard = 'standard',
    Pauper = 'pauper'
}

async function sendRecentTournaments(format: Format, ctx: ChatContext, getCached: (key: string) => Promise<unknown>) {
    const pioneerTournaments = await getCached(format) as string;

    if (pioneerTournaments.length > 0) {
        ctx.sendTextToChat(`⚔️ Свіжі турніри ⚔️\n\n${pioneerTournaments}`);
    }
}


export default new TriggerBuilder("Trigger.Meta")
    .at(18) //18:00 Kiev time
    .allowIn(ChatId.ModernChat)
    .allowIn(ChatId.PioneerChat)
    .allowIn(ChatId.LvivChat)
    .allowIn(ChatId.StandardChat)
    .allowIn(ChatId.PauperChat)
    .withSharedCache(Format.Pioneer, () => loadTournaments(Format.Pioneer))
    .withSharedCache(Format.Modern, () => loadTournaments(Format.Modern))
    .withSharedCache(Format.Standard, () => loadTournaments(Format.Standard))
    .withSharedCache(Format.Pauper, () => loadTournaments(Format.Pauper))
    .do(async (ctx, getCached) => {
        switch (ctx.chatId) {
            case ChatId.PioneerChat:
                await sendRecentTournaments(Format.Pioneer, ctx, getCached);
                break;
            case ChatId.ModernChat:
                await sendRecentTournaments(Format.Modern, ctx, getCached);
                break;
            case ChatId.StandardChat:
                await sendRecentTournaments(Format.Standard, ctx, getCached);
                break;
            case ChatId.PauperChat:
                await sendRecentTournaments(Format.Pauper, ctx, getCached);
                break;
            case ChatId.LvivChat: {
                const pioneerTournaments = await getCached(Format.Pioneer) as string;
                const modernTournaments = await getCached(Format.Modern) as string;
                const standardTournaments = await getCached(Format.Standard) as string;

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