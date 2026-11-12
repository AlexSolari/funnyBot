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

// https://scryfall.com/docs/api/rate-limits
// search, named, random, collection: 2 req/s; everything else: 10 req/s.
// manifest: 10 req/min — not used; needs its own bucket if added.
// Exceeding the limit (HTTP 429) locks the client out for 30 seconds.
const SCRYFALL_SEARCH_RATELIMIT_DELAY = 500 as Milliseconds;
const SCRYFALL_DEFAULT_RATELIMIT_DELAY = 100 as Milliseconds;
const SCRYFALL_LOCKOUT_DELAY = 30_000 as Milliseconds;
const SCRYFALL_SEARCH_ENDPOINTS = ['search', 'named', 'random', 'collection'];

const SCRYFALL_HEADERS = {
    'User-Agent': 'funnyBot/1.0',
    Accept: 'application/json'
};

class RateLimitBucket {
    private readonly semaphore = new Sema(1);
    private lockedOut = false;

    constructor(private readonly delay: Milliseconds) {}

    acquire() {
        return this.semaphore.acquire();
    }

    lockOut() {
        this.lockedOut = true;
    }

    async release() {
        await setTimeout(
            this.lockedOut ? SCRYFALL_LOCKOUT_DELAY : this.delay
        );
        this.lockedOut = false;
        this.semaphore.release();
    }
}

function getCardFaces(card: IScryfallCard) {
    return card.card_faces && card.card_faces[0].image_uris
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
    private readonly baseUrl = 'https://api.scryfall.com/cards/';
    private readonly searchBucket = new RateLimitBucket(
        SCRYFALL_SEARCH_RATELIMIT_DELAY
    );
    private readonly defaultBucket = new RateLimitBucket(
        SCRYFALL_DEFAULT_RATELIMIT_DELAY
    );
    readonly cardBack =
        'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

    private async doRequest<TResponse extends IScryfallApiResponse, TResult>(
        endpoint: string,
        transformer: (data: Exclude<TResponse, IScryfallError>) => TResult[],
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        const bucket = SCRYFALL_SEARCH_ENDPOINTS.some((x) =>
            endpoint.startsWith(x)
        )
            ? this.searchBucket
            : this.defaultBucket;

        await bucket.acquire();

        observability.emitter.emit(EventType.requestStart, {
            traceId: observability.traceId,
            endpoint
        });

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                signal,
                headers: SCRYFALL_HEADERS
            });

            if (response.status == 429) {
                bucket.lockOut();
                throw new Error(
                    'Scryfall API rate limit exceeded, locked out for 30 seconds'
                );
            }

            const data = (await response.json()) as TResponse;

            if ('status' in data) {
                if (data.status == 404) return [];

                throw new Error(
                    `Scryfall API error: ${data.code} ${data.status}\n${data.details}`
                );
            }

            return transformer(data as Exclude<TResponse, IScryfallError>);
        } finally {
            await bucket.release();
            observability.emitter.emit(EventType.requestEnd, {
                traceId: observability.traceId,
                endpoint
            });
        }
    }

    async findBySetAndNumber(
        setCode: string,
        number: number,
        signal: AbortSignal,
        observability: ObservabilityHelper
    ) {
        return await this.doRequest(
            `${setCode}/${number}`,
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
            `search?q=${encodeURIComponent(query)}`,
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
            `random?q=${encodeURIComponent(query)}`,
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
            `named?exact=${encodeURIComponent(name)}`,
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
                `${card.parentId ?? card.id}/rulings`,
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
