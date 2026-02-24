import { load } from 'cheerio';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import moment from 'moment';
import { ChatId } from '../../types/chatIds';
import { Format } from '../../types/mtgFormats';
import {
    ChatContext,
    IActionState,
    ScheduledActionBuilder
} from 'chz-telegram-bot';

async function loadTournaments(formatName: Format): Promise<string> {
    const today = moment().format('MM/DD/YYYY');
    const yesterday = moment().subtract(1, 'day').format('MM/DD/YYYY');

    const response = await fetch(
        `https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${yesterday}+-+${today}&commit=Search`
    );
    const text = await response.text();
    const findInDOM = load(text);
    const links = findInDOM('.table-responsive td a').toArray();
    const parsedData = links
        .map((link) =>
            'data' in link.children[0]
                ? `[${escapeMarkdown(
                      link.children[0].data
                  )}](https://www.mtggoldfish.com${link.attribs.href})`
                : ''
        )
        .join('\n');

    return parsedData.trim() ?? '';
}

async function sendRecentTournaments<TActionState extends IActionState>(
    format: Format,
    ctx: ChatContext<TActionState>,
    getCached: <TResult>(key: string) => Promise<TResult>
) {
    const tournaments = await getCached<string>(format);

    if (tournaments.length > 0) {
        ctx.send.text(`⚔️ Свіжі турніри ⚔️\n\n${tournaments}`);
    }
}

async function sendMultiFormatTournaments<TActionState extends IActionState>(
    getCached: <TResult>(key: string) => Promise<TResult>,
    ctx: ChatContext<TActionState>,
    formats: { format: Format; label: string }[]
) {
    const sections = await Promise.all(
        formats.map(async ({ format, label }) => {
            const tournaments = await getCached<string>(format);
            return tournaments.length > 0 ? `${label}: \n\n${tournaments}` : '';
        })
    );

    const content = sections.filter((s) => s.length > 0).join('\n\n');

    if (content.length > 0) {
        ctx.send.text(`⚔️ Свіжі турніри ⚔️\n\n ${content}`);
    }
}

export const meta = new ScheduledActionBuilder('Scheduled.Meta')
    .runAt(18)
    .in([
        ChatId.ModernChat,
        ChatId.PioneerChat,
        ChatId.LvivChat,
        ChatId.StandardChat,
        ChatId.PauperChat,
        ChatId.FrankivskChat
    ])
    .withSharedCache(Format.Pioneer, () => loadTournaments(Format.Pioneer))
    .withSharedCache(Format.Modern, () => loadTournaments(Format.Modern))
    .withSharedCache(Format.Standard, () => loadTournaments(Format.Standard))
    .withSharedCache(Format.Pauper, () => loadTournaments(Format.Pauper))
    .withSharedCache(Format.DuelCommander, () =>
        loadTournaments(Format.DuelCommander)
    )
    .do(async (ctx, getCached) => {
        switch (ctx.chatInfo.id) {
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
            case ChatId.LvivChat:
                await sendMultiFormatTournaments(getCached, ctx, [
                    { format: Format.Pauper, label: 'Паупер' },
                    { format: Format.Standard, label: 'Стандарт' },
                    { format: Format.DuelCommander, label: 'Duel Commander' }
                ]);
                break;
            case ChatId.FrankivskChat:
                await sendMultiFormatTournaments(getCached, ctx, [
                    { format: Format.Pauper, label: 'Паупер' },
                    { format: Format.Standard, label: 'Стандарт' }
                ]);
                break;
            default:
                return;
        }
    })
    .build();
