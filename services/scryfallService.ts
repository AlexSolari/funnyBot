import { Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallCard,
    IScryfallCardFace,
    IScryfallFuzzyResponse,
    IScryfallQueryResponse,
    IScryfallRulesResponse
} from '../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import { Sema } from 'async-sema';
import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter';
import escapeMarkdown from '../helpers/escapeMarkdown';

const SCRYFALL_RATELIMIT_DELAY = 50 as Milliseconds;

class ScryfallSearchService {
    private readonly semaphore = new Sema(1);
    cardBack =
        'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

    private getCardFaces(card: IScryfallCard) {
        return card.card_faces && 'image_uris' in card.card_faces[0]
            ? card.card_faces
            : [card];
    }

    private mapCardsToCardFaces(cards: IScryfallCard[]) {
        return cards.flatMap((card) => this.getCardFaces(card));
    }

    private async withRatelimit<T>(action: () => Promise<T>) {
        await this.semaphore.acquire();

        try {
            return await action();
        } finally {
            await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            this.semaphore.release();
        }
    }

    async findWithQuery(query: string) {
        return await this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/search?q=${query}`
            );
            const data = (await response.json()) as IScryfallQueryResponse;

            if ('status' in data) {
                if (data.status == 404) return [];

                throw new Error(
                    `Scryfall API error: ${data.code} ${data.status}\n${data.details}`
                );
            }

            return this.mapCardsToCardFaces(data.data);
        });
    }

    async findExact(name: string) {
        return await this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/named?exact=${name}`
            );
            const data = (await response.json()) as IScryfallFuzzyResponse;

            if ('status' in data) {
                if (data.status == 404) return [];

                throw new Error(
                    `Scryfall API error: ${data.code} ${data.status}\n${data.details}`
                );
            }

            return this.getCardFaces(data);
        });
    }

    async findFuzzy(query: string) {
        return await this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/named?fuzzy=${query}`
            );
            const data = (await response.json()) as IScryfallFuzzyResponse;

            if ('status' in data) {
                if (data.status == 404) return [];

                throw new Error(
                    `Scryfall API error: ${data.code} ${data.status}\n${data.details}`
                );
            }

            return this.getCardFaces(data);
        });
    }

    async getRules(card: IScryfallCardFace) {
        return await this.withRatelimit(async () => {
            const rulesResponse = await fetch(
                `https://api.scryfall.com/cards/${card.id}/rulings`
            );
            const rulesData =
                (await rulesResponse.json()) as IScryfallRulesResponse;
            if ('status' in rulesData) throw new Error('Failed to fetch rules');

            return rulesData.data
                .map(
                    (rule) =>
                        `${capitalizeFirstLetter(
                            rule.source == 'wotc' ? 'oracle' : rule.source
                        )} *${escapeMarkdown(
                            rule.published_at
                        )}*\n_${escapeMarkdown(rule.comment)}_`
                )
                .join('\n\n');
        });
    }

    async findAllArtworks(name: string) {
        return await this.findWithQuery(`@@name="${name}"`);
    }
}

export const ScryfallService = new ScryfallSearchService();
