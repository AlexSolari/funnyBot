import { ChatId } from '../../types/chatIds';
import {
    Hours,
    hoursToMilliseconds,
    IActionState,
    ReplyContext,
    ScheduledActionBuilder
} from 'chz-telegram-bot';
import { getAbortControllerWithTimeout } from '../../helpers/abortControllerWithTimeout';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { ScryfallService } from '../../services/scryfallService';

type CardInfo = {
    name: string;
    cmc: number;
    colors: string[];
    types: string[];
    setName: string;
    id: string;
    image_uris: {
        art_crop: string;
        normal: string;
    };
};

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

async function fetchRandomCard(): Promise<CardInfo | null> {
    try {
        // Fetch a random card from a random set
        const randomCards = await ScryfallService.findWithQuery(
            'is:hires game:paper legal:modern tix>1 is:firstprinting -is:dfc'
        );

        if (randomCards.length === 0) return null;

        const randomCard =
            randomCards[Math.floor(Math.random() * randomCards.length)];

        const colors = randomCard.mana_cost
            ? parseColors(randomCard.mana_cost)
            : ['Colorless'];

        return {
            name: randomCard.name,
            cmc: randomCard.cmc,
            colors,
            types: randomCard.type_line.replace(' — ', ' ').split(' '),
            setName: randomCard.set_name,
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

function generateClues(targetCard: CardInfo, guessCard: CardInfo): string {
    const clues = [
        guessCard.setName === targetCard.setName
            ? `🟩 Сет: ${targetCard.setName}`
            : `🟥 Сет: ${targetCard.setName.replaceAll(/\S/g, '?')}`,
        getColorClue(targetCard.colors, guessCard.colors),
        getManaCostClue(targetCard.cmc, guessCard.cmc),
        getTypeClue(targetCard.types, guessCard.types)
    ];

    return clues.join('\n');
}

export const mtgrdle = new ScheduledActionBuilder('Scheduled.Mtgrdle')
    .runAt(0)
    .in([ChatId.PioneerChat, ChatId.LvivChat, ChatId.CbgChat])
    .do(async (ctx) => {
        const card = await fetchRandomCard();
        if (!card) {
            ctx.send.text('Не вдалося отримати карту. Спробуй пізніше.');
            return;
        }

        const captureController = ctx.send.text(
            `🃏 *Гра в вгадування MTG картки\\!* 🃏\n\n` +
                `Нова карта вибрана\\!\n\n` +
                `Напишіть назву карти англійською у відповідь на це повідомлення, щоб спробувати вгадати\\!\n`
        );

        const abortController = getAbortControllerWithTimeout(
            hoursToMilliseconds(20 as Hours)
        ).controller;

        const replyHandler = async (replyCtx: ReplyContext<IActionState>) => {
            const guess = replyCtx.messageInfo.text?.trim();
            if (!guess) return;

            try {
                const guessedCards = await ScryfallService.findExact(guess);
                if (guessedCards.length === 0) {
                    replyCtx.reply.withText(
                        escapeMarkdown(
                            `Карта "${escapeMarkdown(guess)}" не знайдена. Спробуй іншу карту!`
                        )
                    );
                    return;
                }

                const guessCard: CardInfo = {
                    name: guessedCards[0].name,
                    cmc: guessedCards[0].cmc,
                    colors: guessedCards[0].mana_cost
                        ? parseColors(guessedCards[0].mana_cost)
                        : ['Colorless'],
                    types: guessedCards[0].type_line
                        .replace(' — ', ' ')
                        .split(' '),
                    setName: guessedCards[0].set_name,
                    id: guessedCards[0].id,
                    image_uris: {
                        art_crop: '',
                        normal: ''
                    }
                };

                if (guessCard.name === card.name) {
                    replyCtx.reply.withText(
                        `🎉 *Правильно\\!* Ти вгадав карту: [\\${escapeMarkdown(card.name)}](${
                            card.image_uris.normal ?? ScryfallService.cardBack
                        })`
                    );
                    abortController.abort();
                } else {
                    const clues = generateClues(card, guessCard);
                    replyCtx.reply
                        .withText(
                            escapeMarkdown(
                                `❔ ${card.name.replaceAll(/\S/g, '?')} ❔\n\n${clues}\n\nСпробуй ще раз!`
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
