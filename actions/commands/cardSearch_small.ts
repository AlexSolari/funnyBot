import { CommandActionBuilder, Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallCard,
    IScryfallCardFace,
    IScryfallFuzzyResponse,
    IScryfallQueryResponse,
    IScryfallRulesResponse
} from '../../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import { ChatId } from '../../types/chatIds';
import escapeMarkdown from '../../helpers/escapeMarkdown';

function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

const SCRYFALL_RATELIMIT_DELAY = 75 as Milliseconds;

const cardBack =
    'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

async function getRules(card: IScryfallCardFace) {
    const rulesResponse = await fetch(
        `https://api.scryfall.com/cards/${card.id}/rulings`
    );
    const rulesData = (await rulesResponse.json()) as IScryfallRulesResponse;
    if ('status' in rulesData) throw new Error('Failed to fetch rules');

    return rulesData.data
        .map(
            (rule) =>
                `${capitalizeFirstLetter(
                    rule.source == 'wotc' ? 'oracle' : rule.source
                )} *${escapeMarkdown(rule.published_at)}*\n_${escapeMarkdown(
                    rule.comment
                )}_`
        )
        .join('\n\n');
}

async function findWithCompositeQuery(query: string, subquery: string) {
    const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${query} ${subquery}`
    );
    const data = (await response.json()) as IScryfallQueryResponse;

    if ('status' in data) return null;

    const firstMatch = data.data[0] as IScryfallCard;
    const fallbackImage =
        'image_uris' in firstMatch ? firstMatch.image_uris.normal : cardBack;

    const cards =
        firstMatch.card_faces && 'image_uris' in firstMatch.card_faces[0]
            ? firstMatch.card_faces
            : [firstMatch];

    return {
        cards,
        fallbackImage
    };
}

export default new CommandActionBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .do(async (ctx) => {
        let waitCounter = ctx.matchResults.length - 1;

        for (const matchResult of ctx.matchResults) {
            const firstRegexMatch = matchResult[1];
            let rulesText = '';
            let cards: IScryfallCardFace[];
            let fallbackImage: string;
            let useBack = false;
            let fetchRules = false;
            let showBans = false;

            const hasSubquery =
                firstRegexMatch.includes('|') || firstRegexMatch.includes('#');
            const delimiter = hasSubquery
                ? firstRegexMatch.includes('|')
                    ? '|'
                    : '#'
                : null;
            const query = delimiter
                ? firstRegexMatch.split(delimiter)[0]
                : firstRegexMatch;
            let subquery = delimiter ? firstRegexMatch.split(delimiter)[1] : '';

            if (hasSubquery && subquery.includes('flip')) {
                useBack = true;
                subquery = subquery.replace('flip', '');
            }
            if (hasSubquery && subquery.includes('rules')) {
                fetchRules = true;
                subquery = subquery.replace('rules', '');
            }
            if (hasSubquery && subquery.includes('bans')) {
                showBans = true;
                subquery = subquery.replace('bans', '');
            }

            if (subquery.trim().length == 0) {
                const response = await fetch(
                    `https://api.scryfall.com/cards/named?fuzzy=${query}`
                );
                const data = (await response.json()) as IScryfallFuzzyResponse;

                if ('status' in data) continue;

                cards =
                    data.card_faces && 'image_uris' in data.card_faces[0]
                        ? data.card_faces
                        : [data];
            } else {
                const findResult = await findWithCompositeQuery(
                    query,
                    subquery
                );

                if (findResult === null) continue;

                cards = findResult.cards;
                fallbackImage = findResult.fallbackImage;
            }

            if (useBack) cards.shift();

            const resultCard = cards[0];

            if (!resultCard) continue;

            if (fetchRules) {
                rulesText = await getRules(resultCard);
            }

            let bansText = '';
            if (showBans) {
                for (const [format, legality] of Object.entries(
                    resultCard.legalities
                )) {
                    if (legality == 'not_legal') continue;

                    bansText += `*${capitalizeFirstLetter(
                        format
                    )}*: _${capitalizeFirstLetter(legality)}_\n`;
                }
            }

            const images = cards.map(
                (card) => card.image_uris.normal ?? fallbackImage
            );

            let extraText = '';
            if (rulesText) {
                extraText += `\n\n*Rules:*\n${rulesText}`;
            }
            if (bansText) {
                extraText += `\n\n${bansText}`;
            }

            ctx.replyWithText(`[\\.](${images[0] ?? cardBack})${extraText}`);

            if (waitCounter > 0) {
                waitCounter -= 1;
                await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            }
        }
    })
    .ignoreChat(ChatId.GenshinChat)
    .build();
