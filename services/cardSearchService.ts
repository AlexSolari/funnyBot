import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter';
import escapeMarkdown from '../helpers/escapeMarkdown';
import stripPunctuation from '../helpers/stripPunctuation';
import { CardSearchFlags } from '../types/cardSearchFlags';
import { IScryfallCardFace } from '../types/externalApiDefinitions/scryfall';
import { ScryfallService } from './scryfallService';

type InlineQueryCardSearchResult = {
    card: IScryfallCardFace;
    responseText: string;
    description: string;
};

class CardSearchService {
    private readonly rulesCache: Map<string, string> = new Map();

    private readonly flagTransformers: Record<
        keyof typeof CardSearchFlags,
        (card: IScryfallCardFace, signal?: AbortSignal) => Promise<string>
    > = {
        rules: async (card, signal) => {
            if (!this.rulesCache.has(card.name)) {
                this.rulesCache.set(
                    card.name,
                    await ScryfallService.getRules(card, signal)
                );

                setTimeout(() => {
                    this.rulesCache.delete(card.name);
                }, 1000 * 60 * 60 * 24); // 1 day
            }
            const rulesText = this.rulesCache.get(card.name)!;

            if (rulesText.length > 0) {
                return `\n\n*Rules:*\n${rulesText}`;
            }

            return '';
        },
        bans: async (card) => {
            if (card.legalities) {
                const bansText = Object.entries(card.legalities)
                    .sort(([_1, legality1], [_2, legality2]) =>
                        legality1.localeCompare(legality2)
                    )
                    .map(
                        ([format, legality]) =>
                            `*${capitalizeFirstLetter(
                                format
                            )}*: _${capitalizeFirstLetter(
                                legality.replace('_', ' ')
                            )}_`
                    )
                    .join('\n');

                if (bansText.length > 0) {
                    return `\n\n${bansText}`;
                }
            }

            return '';
        },
        price: async (card) => {
            const usdFoilPrice = card.prices?.usd_foil
                ? ` (foil: ${card.prices.usd_foil}$)\n`
                : '\n';
            const usdPrice = card.prices?.usd
                ? `TCGPlayer: ${card.prices.usd}$` + usdFoilPrice
                : '';

            const euroFoilPrice = card.prices?.eur_foil
                ? ` (foil: ${card.prices.eur_foil}€)\n`
                : '\n';
            const euroPrice = card.prices?.eur
                ? `CardMarket: ${card.prices.eur}€` + euroFoilPrice
                : '';

            if (usdPrice || euroPrice)
                return `\n\n${escapeMarkdown(usdPrice)}${escapeMarkdown(
                    euroPrice
                )}`;

            return '';
        },
        flip: async (_) => ''
    };

    private getFlagsFromInlineQuery(query: string) {
        const flags: string[] = [];

        while (query.startsWith('#')) {
            const [hash, ...rest] = query.split(' ');
            query = rest.join(' ');
            flags.push(hash.slice(1));
        }

        return { flags, query };
    }

    private getFlagsFromActionMatchResult(matchResult: string) {
        const hasSubquery =
            matchResult.includes('|') || matchResult.includes('#');
        if (!hasSubquery)
            return { flags: [], query: matchResult, subquery: '' };

        const flags: string[] = [];
        const delimiter = matchResult.includes('|') ? '|' : '#';
        const [query, subquery] = matchResult.split(delimiter);

        let sanitizedSubquery = subquery.trim();
        for (const flag of Object.values(CardSearchFlags)) {
            if (sanitizedSubquery.includes(flag)) {
                flags.push(flag);
                sanitizedSubquery = sanitizedSubquery.replace(flag, '');
            }
        }
        sanitizedSubquery = sanitizedSubquery.trim();

        return { flags, query, subquery: sanitizedSubquery };
    }

    private async transfromFlags(
        flags: string[],
        card: IScryfallCardFace,
        signal?: AbortSignal
    ) {
        let extraText = '';
        for (const flag of flags) {
            if (!Object.keys(CardSearchFlags).includes(flag)) continue;

            extraText += await this.flagTransformers[
                flag as keyof typeof CardSearchFlags
            ](card, signal);
        }

        return extraText;
    }

    async findBySetAndNumber(
        setCode: string,
        number: number,
        signal?: AbortSignal
    ) {
        const matchedCards = await ScryfallService.findBySetAndNumber(
            setCode,
            number,
            signal
        );

        const resultCard = matchedCards[0];
        if (!resultCard) return null;

        return `[\\${escapeMarkdown(resultCard.name)}](${
            resultCard.image_uris.normal ?? ScryfallService.cardBack
        })`;
    }

    async findForAction(matchResult: string, signal?: AbortSignal) {
        const { flags, query, subquery } =
            this.getFlagsFromActionMatchResult(matchResult);

        const matchedCards = await ScryfallService.findWithQuery(
            `${query} ${subquery}`,
            signal
        );
        const uniqueCardsCount = Object.keys(
            Object.groupBy(
                matchedCards.map((x) => ({
                    name: x.name,
                    id: x.oracle_id ?? x.parentId
                })),
                ({ id }) => id
            )
        ).length;
        const keyboardData =
            uniqueCardsCount <= 6 ? matchedCards.map((x) => x.name) : [query];

        if (uniqueCardsCount <= 1) {
            if (flags.includes(CardSearchFlags.flip)) matchedCards.shift();

            const resultCard = matchedCards[0];
            if (!resultCard)
                return {
                    message: null,
                    keyboardData: null
                };

            const extraText = await this.transfromFlags(
                flags,
                resultCard,
                signal
            );
            return {
                message: `[\\${escapeMarkdown(resultCard.name)}](${
                    resultCard.image_uris.normal ?? ScryfallService.cardBack
                })${extraText}`,
                keyboardData: keyboardData
            };
        }

        const exactMatch = matchedCards.find(
            (x) => stripPunctuation(x.name.toLowerCase()) == query
        );

        if (exactMatch) {
            return {
                message: `[\\${escapeMarkdown(exactMatch.name)}](${
                    exactMatch.image_uris.normal ?? ScryfallService.cardBack
                })`,
                keyboardData
            };
        }

        const message =
            uniqueCardsCount <= 6
                ? 'Знайдено декілька карт:'
                : 'Знайдено більше 6 карт, будь ласка уточніть запит:';

        return {
            message,
            keyboardData: keyboardData
        };
    }

    async findForInlineQuery(inlineQuery: string, signal?: AbortSignal) {
        const { flags, query } = this.getFlagsFromInlineQuery(inlineQuery);
        let wasOneCardFound = false;

        if (query.length == 0)
            return { cardsWithText: [], showSetCode: wasOneCardFound };

        let cards = await ScryfallService.findExact(query, signal);
        cards = cards.filter(
            (x) => x.set_type != 'memorabilia' && x.set_type != 'minigame'
        );

        if (cards.length == 0) {
            cards = await ScryfallService.findWithQuery(query, signal);
        }

        let results: IScryfallCardFace[] = [];
        if (cards.length == 1) {
            wasOneCardFound = true;
            results = await ScryfallService.findAllArtworks(
                cards[0].name,
                signal
            );
        } else {
            results = cards;
        }

        if (results.length > 50) results = results.slice(0, 49);

        const cardsWithText: InlineQueryCardSearchResult[] = [];
        for (const card of results) {
            const responseText = `[\\${escapeMarkdown(card.name)}](${
                card.image_uris.normal ?? ScryfallService.cardBack
            })${await this.transfromFlags(flags, card, signal)}`;

            const usdPrice = card.prices?.usd ? `${card.prices.usd}$` : '';
            const eurPrice = card.prices?.eur ? ` ${card.prices.eur}€` : '';

            cardsWithText.push({
                card,
                responseText,
                description: flags.includes(CardSearchFlags.price)
                    ? `${usdPrice} ${eurPrice}`
                    : `${card.type_line ?? ''}\n${card.flavor_text ?? ''}`
            });
        }
        return { cardsWithText, showSetCode: wasOneCardFound };
    }
}

export const MtgCardSearchService = new CardSearchService();
