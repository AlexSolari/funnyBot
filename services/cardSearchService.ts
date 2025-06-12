import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter';
import escapeMarkdown from '../helpers/escapeMarkdown';
import { CardSearchFlags } from '../types/cardSearchFlags';
import { IScryfallCardFace } from '../types/externalApiDefinitions/scryfall';
import { ScryfallService } from './scryfallService';

type InlineQueryCardSearchResult = {
    card: IScryfallCardFace;
    responseText: string;
    description: string;
};

class CardSearchService {
    private rulesCache: Map<string, string> = new Map();

    private flagTransformers: Record<
        keyof typeof CardSearchFlags,
        (card: IScryfallCardFace) => Promise<string>
    > = {
        rules: async (card) => {
            if (!this.rulesCache.has(card.name)) {
                this.rulesCache.set(
                    card.name,
                    await ScryfallService.getRules(card)
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
            if (card.prices?.usd) {
                return escapeMarkdown(`\n\nTCGPlayer: ${card.prices.usd}$`);
            }

            return '';
        },
        flip: async (_) => ''
    };

    private getFlagsFromInlineQuery(query: string) {
        const flags: string[] = [];

        while (query[0] == '#') {
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

    private async transfromFlags(flags: string[], card: IScryfallCardFace) {
        let extraText = '';
        for (const flag of flags) {
            if (!Object.keys(CardSearchFlags).includes(flag)) continue;

            extraText += await this.flagTransformers[
                flag as keyof typeof CardSearchFlags
            ](card);
        }

        return extraText;
    }

    async findForAction(matchResult: string) {
        const { flags, query, subquery } =
            this.getFlagsFromActionMatchResult(matchResult);

        const matchedCards =
            subquery.length == 0
                ? await ScryfallService.findFuzzy(query)
                : await ScryfallService.findWithQuery(`${query} ${subquery}`);

        if (flags.includes(CardSearchFlags.flip)) matchedCards.shift();

        const resultCard = matchedCards[0];
        if (!resultCard) return null;

        const extraText = await this.transfromFlags(flags, resultCard);
        console.log(flags, extraText);
        return `[\\${escapeMarkdown(resultCard.name)}](${
            resultCard.image_uris.normal ?? ScryfallService.cardBack
        })${extraText}`;
    }

    async findForInlineQuery(inlineQuery: string) {
        const { flags, query } = this.getFlagsFromInlineQuery(inlineQuery);
        let wasOneCardFound = false;

        if (query.length == 0)
            return { cardsWithText: [], showSetCode: wasOneCardFound };

        let cards = await ScryfallService.findExact(query);

        if (cards.length == 0) {
            cards = await ScryfallService.findWithQuery(query);
        }

        let results: IScryfallCardFace[] = [];
        if (cards.length == 1) {
            wasOneCardFound = true;
            results = await ScryfallService.findAllArtworks(cards[0].name);
        } else {
            results = cards;
        }

        if (results.length > 50) results = results.slice(0, 49);

        const cardsWithText: InlineQueryCardSearchResult[] = [];
        for (const card of results) {
            const responseText = `[\\${escapeMarkdown(card.name)}](${
                card.image_uris.normal ?? ScryfallService.cardBack
            })${await this.transfromFlags(flags, card)}`;

            cardsWithText.push({
                card,
                responseText,
                description:
                    flags.includes(CardSearchFlags.price) && card.prices?.usd
                        ? `${card.prices.usd}$`
                        : `${card.type_line ?? ''}\n${card.flavor_text ?? ''}`
            });
        }
        return { cardsWithText, showSetCode: wasOneCardFound };
    }
}

export const MtgCardSearchService = new CardSearchService();
