import { Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallApiResponse,
    IScryfallCard,
    IScryfallCardFace,
    IScryfallError,
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
            ? card.card_faces.map((x) => {
                  x.parentId = card.id;
                  x.prices ??= card.prices;
                  x.legalities ??= card.legalities;
                  return x;
              })
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

    private unwrapResponse<TResponse extends IScryfallApiResponse, TResult>(
        response: TResponse,
        transformer: (data: Exclude<TResponse, IScryfallError>) => TResult[]
    ) {
        if ('status' in response) {
            if (response.status == 404) return [];

            throw new Error(
                `Scryfall API error: ${response.code} ${response.status}\n${response.details}`
            );
        }

        return transformer(response as Exclude<TResponse, IScryfallError>);
    }

    async findBySetAndNumber(setCode: string, number: number) {
        return this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/${setCode}/${number}`
            );
            const data = (await response.json()) as IScryfallCard;

            return this.unwrapResponse(data, (x) =>
                this.mapCardsToCardFaces([x])
            );
        });
    }

    async findWithQuery(query: string) {
        return this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/search?q=${query}`
            );
            const data = (await response.json()) as IScryfallQueryResponse;

            return this.unwrapResponse(data, (x) =>
                this.mapCardsToCardFaces(x.data)
            );
        });
    }

    async findExact(name: string) {
        return this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/named?exact=${name}`
            );
            const data = (await response.json()) as IScryfallFuzzyResponse;

            return this.unwrapResponse(data, (x) => this.getCardFaces(x));
        });
    }

    async findFuzzy(query: string) {
        return this.withRatelimit(async () => {
            const response = await fetch(
                `https://api.scryfall.com/cards/named?fuzzy=${query}`
            );
            const data = (await response.json()) as IScryfallFuzzyResponse;

            return this.unwrapResponse(data, (x) => this.getCardFaces(x));
        });
    }

    async getRules(card: IScryfallCardFace) {
        return this.withRatelimit(async () => {
            const rulesResponse = await fetch(
                `https://api.scryfall.com/cards/${
                    card.parentId ?? card.id
                }/rulings`
            );
            const data = (await rulesResponse.json()) as IScryfallRulesResponse;

            return this.unwrapResponse(data, (x) =>
                x.data.map(
                    (rule) =>
                        `${capitalizeFirstLetter(
                            rule.source == 'wotc' ? 'oracle' : rule.source
                        )} *${escapeMarkdown(
                            rule.published_at
                        )}*\n_${escapeMarkdown(rule.comment)}_`
                )
            ).join('\n\n');
        });
    }

    async findAllArtworks(name: string) {
        return (await this.findWithQuery(`@@name="${name}"`)).filter(
            (x) => x.name == name
        );
    }
}

export const ScryfallService = new ScryfallSearchService();
