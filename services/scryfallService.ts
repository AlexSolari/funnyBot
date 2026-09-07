import { Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallApiResponse,
    IScryfallCard,
    IScryfallCardFace,
    IScryfallError,
    IScryfallRules,
    IScryfallCardArray
} from '../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import { Sema } from 'async-sema';
import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter';
import escapeMarkdown from '../helpers/escapeMarkdown';
import { ObservabilityHelper } from '../types/observabilityHelper';
import { EventType } from '../types/customEvents';

const SCRYFALL_RATELIMIT_DELAY = 50 as Milliseconds;

function getCardFaces(card: IScryfallCard) {
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

function mapCardsToCardFaces(cards: IScryfallCardArray) {
    return cards.data.flatMap((card) => getCardFaces(card));
}

function formatRules(rules: IScryfallRules) {
    return rules.data.map(
        (rule) =>
            `${capitalizeFirstLetter(
                rule.source == 'wotc' ? 'oracle' : rule.source
            )} *${escapeMarkdown(
                rule.published_at
            )}*\n_${escapeMarkdown(rule.comment)}_`
    );
}

class ScryfallSearchService {
    private readonly ratelimitSemaphore = new Sema(1);
    readonly cardBack =
        'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

    private async doRequest<TResponse extends IScryfallApiResponse, TResult>(
        endpoint: string,
        transformer: (data: Exclude<TResponse, IScryfallError>) => TResult[],
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
                if (data.status == 404) return [];

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
        return await this.doRequest(
            `https://api.scryfall.com/cards/${setCode}/${number}`,
            getCardFaces,
            signal,
            observability
        );
    }

    async findWithQuery(
        query: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return await this.doRequest(
            `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`,
            mapCardsToCardFaces,
            signal,
            observability
        );
    }

    async random(
        query: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return await this.doRequest(
            `https://api.scryfall.com/cards/random?q=${encodeURIComponent(query)}`,
            getCardFaces,
            signal,
            observability
        );
    }

    async findExact(
        name: string,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return await this.doRequest(
            `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
            getCardFaces,
            signal,
            observability
        );
    }

    async getRules(
        card: IScryfallCardFace,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return (
            await this.doRequest(
                `https://api.scryfall.com/cards/${
                    card.parentId ?? card.id
                }/rulings`,
                formatRules,
                signal,
                observability
            )
        ).join('\n\n');
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
