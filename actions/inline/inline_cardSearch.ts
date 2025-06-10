import { InlineQueryActionBuilder, Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallCard,
    IScryfallCardFace,
    IScryfallFuzzyResponse,
    IScryfallQueryResponse
} from '../../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import escapeMarkdown from '../../helpers/escapeMarkdown';

const SCRYFALL_RATELIMIT_DELAY = 50 as Milliseconds;
const cardBack =
    'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

async function findWithQuery(query: string) {
    const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${query}`
    );
    const data = (await response.json()) as IScryfallQueryResponse;

    if ('status' in data) return null;

    return data.data as IScryfallCard[];
}

function getCardFace(card: IScryfallCard) {
    return card.card_faces && 'image_uris' in card.card_faces[0]
        ? card.card_faces[0]
        : card;
}

function mapCardsToCardFaces(cards: IScryfallCard[]) {
    return cards.map((card) => getCardFace(card));
}

export default new InlineQueryActionBuilder('Inline.CardSearch')
    .do(async (ctx) => {
        if (ctx.queryText.length == 0) return;

        let cards: IScryfallCardFace[] = [];
        let showSetCode = false;

        const response = await fetch(
            `https://api.scryfall.com/cards/named?exact=${ctx.queryText}`
        );
        const data = (await response.json()) as IScryfallFuzzyResponse;

        if ('status' in data) {
            if (data.status != 404) return;

            await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            const findResult = await findWithQuery(ctx.queryText);

            if (findResult === null) return;

            cards = mapCardsToCardFaces(findResult);
        } else {
            cards = [getCardFace(data)];
        }

        let results: IScryfallCardFace[] = [];
        if (cards.length == 1) {
            await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            const findPrintingsResult = await findWithQuery(
                `@@name="${cards[0].name}"`
            );
            showSetCode = true;

            if (findPrintingsResult == null) return;

            results = mapCardsToCardFaces(findPrintingsResult);
        } else {
            results = cards;
        }

        if (results.length > 50) results = results.slice(0, 49);

        for (const card of results) {
            if (!card) continue;

            ctx.showInlineQueryResult({
                type: 'article',
                id: Math.random().toString(),
                title: showSetCode
                    ? `${card.name} - ${card.set_name ?? 'Unknown'}`
                    : card.name,
                description: escapeMarkdown(
                    `${card.type_line ?? ''}\n${card.oracle_text ?? ''}`
                ),
                thumbnail_url:
                    card.image_uris?.art_crop ??
                    card.image_uris?.normal ??
                    cardBack,
                input_message_content: {
                    message_text: `[\\${escapeMarkdown(card.name)}](${
                        card.image_uris?.normal ?? cardBack
                    })`,
                    parse_mode: 'MarkdownV2'
                }
            });
        }
    })
    .build();
