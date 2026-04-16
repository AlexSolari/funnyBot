import { ChatId } from '../../types/chatIds';
import {
    ChatInfo,
    Hours,
    hoursToMilliseconds,
    IActionState,
    ReplyContext,
    ScheduledActionBuilder,
    Seconds,
    secondsToMilliseconds
} from 'chz-telegram-bot';
import { getAbortControllerWithTimeout } from '../../helpers/abortControllerWithTimeout';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ScryfallService } from '../../services/scryfallService';
import { potuzhno } from '../commands/potuzhno';
import { Day } from '../../types/daysOfTheWeek';
import moment from 'moment';
import { ScryfallEventMap } from '../../types/scryfallEvents';
import { ObservabilityHelper } from '../../types/observabilityHelper';
import { getObservability } from '../../helpers/getObservability';

const WIN_BONUS_POINTS = 5;
const REQUEST_TIMEOUT = secondsToMilliseconds(30 as Seconds);

type CardInfo = {
    name: string;
    cmc: number;
    colors: string[];
    types: string[];
    setName: string;
    releasedAt: string;
    id: string;
    image_uris: {
        art_crop: string;
        normal: string;
    };
};

const ChatQueryMap = {
    [ChatId.LvivChat]:
        'game:paper (legal:t2 or legal:pauper) tix>0.1 is:firstprinting -is:dfc',
    [ChatId.PioneerChat]:
        'game:paper legal:pioneer tix>0.1 is:firstprinting -is:dfc',
    [ChatId.CbgChat]:
        'game:paper legal:edh is:firstprinting -is:dfc is:commander tix>0.02',
    [ChatId.PauperChat]:
        'game:paper legal:pauper tix>0.2 is:firstprinting -is:dfc'
} as Record<number, string>;

function parseColors(manaCost: string): string[] {
    const colors: Set<string> = new Set();
    const colorMap: Record<string, string> = {
        W: 'White',
        U: 'Blue',
        B: 'Black',
        R: 'Red',
        G: 'Green'
    };

    for (const char of manaCost) {
        if (char in colorMap) {
            colors.add(colorMap[char]);
        }
    }

    return Array.from(colors);
}

async function fetchRandomCard(
    chatInfo: ChatInfo,
    observability: ObservabilityHelper<ScryfallEventMap>
): Promise<CardInfo | null> {
    try {
        const query =
            ChatQueryMap[chatInfo.id] ??
            'game:paper tix>1 is:firstprinting -is:dfc';
        // Fetch a random card from a random set
        const randomCards = await ScryfallService.findWithQuery(
            query,
            AbortSignal.timeout(REQUEST_TIMEOUT),
            observability
        );

        if (randomCards.length === 0) return null;

        const randomCard =
            randomCards[Math.floor(Math.random() * randomCards.length)];

        const colors = randomCard.mana_cost
            ? parseColors(randomCard.mana_cost)
            : ['Colorless'];

        return {
            name: randomCard.name,
            cmc: randomCard.cmc!,
            colors,
            types: randomCard.type_line.replace(' — ', ' ').split(' '),
            setName: randomCard.set_name,
            releasedAt: randomCard.released_at,
            id: randomCard.id,
            image_uris: randomCard.image_uris
        };
    } catch {
        return null;
    }
}

function getColorClue(targetColors: string[], guessColors: string[]): string {
    const targetColorStr = targetColors.join(', ');
    const guessColorStr = guessColors.join(', ');

    if (guessColorStr === targetColorStr) {
        return `🟩 Колір: ${targetColorStr}`;
    }

    const commonColors = guessColors.filter((c) => targetColors.includes(c));
    if (commonColors.length > 0) {
        return `🟨 Колір: має ${commonColors.join(', ')}`;
    }

    return `🟥 Колір: ❔`;
}

function getManaCostClue(
    targetManaCost: number,
    guessManaCost: number
): string {
    if (guessManaCost === targetManaCost) {
        return `🟩 Манакост: ${targetManaCost}`;
    }

    return `🟨 Манакост: ${targetManaCost > guessManaCost ? '🔼' : '🔽'}`;
}

function getTypeClue(targetTypes: string[], guessTypes: string[]): string {
    const targetTypesStr = targetTypes.join(' ');
    const guessTypesStr = guessTypes.join(' ');

    if (guessTypesStr === targetTypesStr) {
        return `🟩 Тип: ${targetTypesStr}`;
    }

    const commonTypes = guessTypes.filter((t) => targetTypes.includes(t));
    if (commonTypes.length > 0) {
        return `🟨 Тип: має ${commonTypes.join(', ')}`;
    }

    return `🟥 Тип: ❔`;
}

function getSetClue(targetCard: CardInfo, guessCard: CardInfo): string {
    if (guessCard.setName === targetCard.setName) {
        return `🟩 Сет: ${targetCard.setName}`;
    }

    const targetYear = new Date(targetCard.releasedAt).getFullYear();
    const guessYear = new Date(guessCard.releasedAt).getFullYear();

    let arrow = '';
    if (targetYear > guessYear) {
        arrow = '🔼';
    } else if (targetYear < guessYear) {
        arrow = '🔽';
    } else {
        return `🟨 Сет: ${guessCard.name} випущена в ${guessYear} ✔️`;
    }

    return `🟥 Сет: ${guessCard.name} випущена в ${guessYear} ${arrow}`;
}

function generateClues(targetCard: CardInfo, guessCard: CardInfo): string {
    const clues = [
        getSetClue(targetCard, guessCard),
        getColorClue(targetCard.colors, guessCard.colors),
        getManaCostClue(targetCard.cmc, guessCard.cmc),
        getTypeClue(targetCard.types, guessCard.types)
    ];

    return clues.join('\n');
}

export const mtgrdle = new ScheduledActionBuilder('Scheduled.Mtgrdle')
    .runAt(0)
    .in([
        ChatId.PioneerChat,
        ChatId.LvivChat,
        ChatId.CbgChat,
        ChatId.PauperChat
    ])
    .do(async (ctx) => {
        const today = moment().day();
        const isWeekend = today == Day.Sunday || today == Day.Saturday;
        if (ctx.chatInfo.id == ChatId.LvivChat && !isWeekend) {
            return;
        }

        const card = await fetchRandomCard(ctx.chatInfo, getObservability(ctx));
        if (!card) {
            ctx.send.text('Не вдалося отримати карту. Спробуй пізніше.');
            return;
        }

        const captureController = ctx.send.text(
            `🃏 *Гра в вгадування MTG картки\\!* 🃏\n\n` +
                `Нова карта вибрана: ${card.name.replaceAll(/./g, '?')}\n\n` +
                `Напишіть назву карти англійською у відповідь на це повідомлення, щоб спробувати вгадати та отримати \\+${WIN_BONUS_POINTS} потужності\\!\n`
        );

        const abortController = getAbortControllerWithTimeout(
            hoursToMilliseconds(20 as Hours)
        ).controller;

        const replyHandler = async (replyCtx: ReplyContext<IActionState>) => {
            const guess = replyCtx.messageInfo.text?.trim();
            if (!guess) return;

            try {
                const guessedCards = await ScryfallService.findWithQuery(
                    `${guess} game:paper is:firstprinting`,
                    AbortSignal.timeout(REQUEST_TIMEOUT),
                    getObservability(replyCtx)
                );

                if (guessedCards.length === 0) {
                    replyCtx.reply.withText(
                        escapeMarkdown(
                            `Карта "${escapeMarkdown(guess)}" не знайдена. Спробуй іншу карту!`
                        )
                    );
                    return;
                }

                const guessedCardFace =
                    guessedCards.length > 1
                        ? guessedCards.find(
                              (x) =>
                                  x.name.replaceAll(/\S/g, ' ').toLowerCase() ==
                                  guess.replaceAll(/\S/g, ' ').toLowerCase()
                          )
                        : guessedCards[0];

                if (!guessedCardFace) {
                    replyCtx.reply.withText(
                        escapeMarkdown(
                            `Карта "${escapeMarkdown(guess)}" не знайдена. Спробуй іншу карту!`
                        )
                    );
                    return;
                }

                const guessedCardCmc = guessedCardFace.cmc
                    ? guessedCardFace.cmc
                    : guessedCardFace.mana_cost
                          .replaceAll(/[{}]/g, ' ')
                          .split(' ')
                          .filter(Boolean)
                          .map((x) => Number.parseInt(x))
                          .map((x) => (Number.isNaN(x) ? 1 : x))
                          .reduce((x, y) => x + y, 0);

                const guessCard: CardInfo = {
                    name: guessedCardFace.name,
                    cmc: guessedCardCmc,
                    colors: guessedCardFace.mana_cost
                        ? parseColors(guessedCardFace.mana_cost)
                        : ['Colorless'],
                    types: guessedCardFace.type_line
                        .replace(' — ', ' ')
                        .split(' '),
                    setName: guessedCardFace.set_name,
                    releasedAt: guessedCardFace.released_at,
                    id: guessedCardFace.id,
                    image_uris: {
                        art_crop: '',
                        normal: ''
                    }
                };

                if (guessCard.name === card.name) {
                    if (replyCtx.chatInfo.id == ChatId.PauperChat) {
                        replyCtx.reply.withText(
                            `🎉 *Правильно\\!* Ти вгадав карту: [\\${escapeMarkdown(card.name)}](${card.image_uris.normal ?? ScryfallService.cardBack})`
                        );
                    } else await rewardPotuzhnoPoints(replyCtx, card);

                    abortController.abort();
                } else {
                    const clues = generateClues(card, guessCard);
                    replyCtx.reply
                        .withText(
                            escapeMarkdown(
                                `❔ ${card.name.replaceAll(/./g, '?')} ❔\n\n${clues}\n\nСпробуй ще раз!`
                            )
                        )
                        .captureReplies([/.+/], replyHandler, abortController);
                }
            } catch (e) {
                replyCtx.reply.withText('Помилка перевірки карти');
                console.error(e);
            }
        };

        captureController.captureReplies([/.+/], replyHandler, abortController);
    })
    .build();

async function rewardPotuzhnoPoints(
    replyCtx: ReplyContext<IActionState>,
    card: CardInfo
) {
    replyCtx.reply.withText(
        `🎉 *Правильно\\!* Ти вгадав карту: [\\${escapeMarkdown(card.name)}](${card.image_uris.normal ?? ScryfallService.cardBack})\n\n 💪 \\+${WIN_BONUS_POINTS} потужності\\! 💪`
    );

    await replyCtx.updateStateOf(potuzhno, async (state) => {
        if (replyCtx.userInfo.id == null) return;

        const scoreFromIdBoard = state.idScoreBoard[replyCtx.userInfo.id];

        state.idScoreBoard[replyCtx.userInfo.id] =
            (scoreFromIdBoard ?? 0) + WIN_BONUS_POINTS;
    });
}
