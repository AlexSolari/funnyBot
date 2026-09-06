import { Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallApiResponse,
    IScryfallCard,
    IScryfallCardFace,
    IScryfallError,
    IScryfallCardResponse,
    IScryfallCardArrayResponse,
    IScryfallRulesResponse
} from '../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import { Sema } from 'async-sema';
import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter';
import escapeMarkdown from '../helpers/escapeMarkdown';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { EventType } from '../types/customEvents';

const SCRYFALL_RATELIMIT_DELAY = 50 as Milliseconds;

class ScryfallSearchService {
    private readonly ratelimitSemaphore = new Sema(1);
    readonly cardBack =
        'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

    private getCardFaces(card: IScryfallCard) {
        return card.card_faces && 'image_uris' in card.card_faces[0]
            ? card.card_faces.map((x) => {
                  x.parentId = card.id;
                  x.prices ??= card.prices;
                  x.legalities ??= card.legalities;
                  x.released_at ??= card.released_at;
                  x.cmc ??= card.cmc;
                  return x;
              })
            : [card];
    }

    private mapCardsToCardFaces(cards: IScryfallCard[]) {
        return cards.flatMap((card) => this.getCardFaces(card));
    }

    private async doRequest<TResponse extends IScryfallApiResponse, TResult>(
        endpoint: string,
        transformer: (data: Exclude<TResponse, IScryfallError>) => TResult,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        await this.ratelimitSemaphore.acquire();

        observability.emitter.emit(EventType.requestStart, {
            traceId: observability.traceId,
            endpoint
        });

        try {
            const response = await fetch(endpoint, { signal });

            const data = (await response.json()) as TResponse;

            if ('status' in data) {
                if (data.status == 404) return null;

                throw new Error(
                    `Scryfall API error: ${data.code} ${data.status}\n${data.details}`
                );
            }

            return transformer(data as Exclude<TResponse, IScryfallError>);
        } finally {
            await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            this.ratelimitSemaphore.release();
        }
    }

    async findBySetAndNumber(
        setCode: string,
        number: number,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const result = await this.doRequest<IScryfallCard, IScryfallCardFace[]>(
            `https://api.scryfall.com/cards/${setCode}/${number}`,
            (x) => this.mapCardsToCardFaces([x]),
            signal,
            observability
        );

        return result ?? [];
    }

    async findWithQuery(
        query: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const result = await this.doRequest<
            IScryfallCardArrayResponse,
            IScryfallCardFace[]
        >(
            `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`,
            (x) => this.mapCardsToCardFaces(x.data),
            signal,
            observability
        );

        return result ?? [];
    }

    async random(
        query: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const result = await this.doRequest<
            IScryfallCardResponse,
            IScryfallCardFace[]
        >(
            `https://api.scryfall.com/cards/random?q=${encodeURIComponent(query)}`,
            (x) => this.getCardFaces(x),
            signal,
            observability
        );

        return result ?? [];
    }

    async findExact(
        name: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const result = await this.doRequest<
            IScryfallCardResponse,
            IScryfallCardFace[]
        >(
            `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
            (x) => this.getCardFaces(x),
            signal,
            observability
        );

        return result ?? [];
    }

    async getRules(
        card: IScryfallCardFace,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const result = await this.doRequest<IScryfallRulesResponse, string[]>(
            `https://api.scryfall.com/cards/${
                card.parentId ?? card.id
            }/rulings`,
            (x) =>
                x.data.map(
                    (rule) =>
                        `${capitalizeFirstLetter(
                            rule.source == 'wotc' ? 'oracle' : rule.source
                        )} *${escapeMarkdown(
                            rule.published_at
                        )}*\n_${escapeMarkdown(rule.comment)}_`
                ),
            signal,
            observability
        );

        return (result ?? []).join('\n\n');
    }

    async findAllArtworks(
        name: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return (
            await this.findWithQuery(`@@name="${name}"`, signal, observability)
        ).filter((x) => x.name == name);
    }
}

export const ScryfallService = new ScryfallSearchService();
