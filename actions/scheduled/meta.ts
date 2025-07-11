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

export default new ScheduledActionBuilder('Scheduled.Meta')
    .runAt(18)
    .allowIn(ChatId.ModernChat)
    .allowIn(ChatId.PioneerChat)
    .allowIn(ChatId.LvivChat)
    .allowIn(ChatId.StandardChat)
    .allowIn(ChatId.PauperChat)
    .allowIn(ChatId.FrankivskChat)
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
            case ChatId.LvivChat: {
                const pauperTournaments = await getCached<string>(
                    Format.Pauper
                );
                const pioneerTournaments = await getCached<string>(
                    Format.Pioneer
                );
                const modernTournaments = await getCached<string>(
                    Format.Modern
                );
                const standardTournaments = await getCached<string>(
                    Format.Standard
                );
                const commander1v1Tournaments = await getCached<string>(
                    Format.DuelCommander
                );

                let pauperString = '';
                let pioneerString = '';
                let modernString = '';
                let standardString = '';
                let commander1v1String = '';

                if (pioneerTournaments.length > 0) {
                    pioneerString = `Піонер: \n\n${pioneerTournaments}\n\n`;
                }
                if (pauperTournaments.length > 0) {
                    pauperString = `Паупер: \n\n${pauperTournaments}\n\n`;
                }
                if (modernTournaments.length > 0) {
                    modernString = `Модерн: \n\n${modernTournaments}\n\n`;
                }
                if (standardTournaments.length > 0) {
                    standardString = `Стандарт: \n\n${standardTournaments}\n\n`;
                }
                if (commander1v1Tournaments.length > 0) {
                    commander1v1String = `Duel Commander: \n\n${commander1v1Tournaments}`;
                }

                if (
                    pioneerString.length > 0 ||
                    modernString.length > 0 ||
                    standardString.length > 0 ||
                    pauperString.length > 0 ||
                    commander1v1String.length > 0
                ) {
                    ctx.send.text(
                        `⚔️ Свіжі турніри ⚔️\n\n ${pauperString} ${modernString} ${pioneerString} ${standardString} ${commander1v1String}`
                    );
                }
                break;
            }
            case ChatId.FrankivskChat: {
                const pioneerTournaments = await getCached<string>(
                    Format.Pioneer
                );
                const standardTournaments = await getCached<string>(
                    Format.Standard
                );

                let pioneerString = '';
                let standardString = '';

                if (pioneerTournaments.length > 0) {
                    pioneerString = `Піонер: \n\n${pioneerTournaments}\n\n`;
                }
                if (standardTournaments.length > 0) {
                    standardString = `Стандарт: \n\n${standardTournaments}\n\n`;
                }

                if (pioneerString.length > 0 || standardString.length > 0) {
                    ctx.send.text(
                        `⚔️ Свіжі турніри ⚔️\n\n ${pioneerString} ${standardString}`
                    );
                }
                break;
            }
            default:
                return;
        }
    })
    .build();
