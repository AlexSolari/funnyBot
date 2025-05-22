import { CommandActionBuilder, Milliseconds } from 'chz-telegram-bot';
import {
    IScryfallCard,
    IScryfallCardFace,
    IScryfallFuzzyResponse,
    IScryfallQueryResponse
} from '../../types/externalApiDefinitions/scryfall';
import { setTimeout } from 'timers/promises';
import { ChatId } from '../../types/chatIds';

const SCRYFALL_RATELIMIT_DELAY = 75 as Milliseconds;

const cardBack =
    'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

export default new CommandActionBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .do(async (ctx) => {
        let waitCounter = ctx.matchResults.length - 1;

        for (const matchResult of ctx.matchResults) {
            const firstRegexMatch = matchResult[1];
            let cards: IScryfallCardFace[];
            let fallbackImage: string;
            let useBack = false;

            if (firstRegexMatch.includes('|')) {
                const cardName = matchResult[1].split('|')[0];
                let subquery = matchResult[1].split('|')[1];

                if (subquery.includes('flip')) {
                    useBack = true;
                    subquery = subquery.replace('flip', '');
                }
                const response = await fetch(
                    `https://api.scryfall.com/cards/search?q=${cardName} ${subquery}`
                );
                const data = (await response.json()) as IScryfallQueryResponse;

                if ('status' in data) continue;

                const firstMatch = data.data[0] as IScryfallCard;
                fallbackImage =
                    'image_uris' in firstMatch
                        ? firstMatch.image_uris.normal
                        : cardBack;

                cards =
                    firstMatch.card_faces &&
                    'image_uris' in firstMatch.card_faces[0]
                        ? firstMatch.card_faces
                        : [firstMatch];
            } else {
                const response = await fetch(
                    `https://api.scryfall.com/cards/named?fuzzy=${firstRegexMatch}`
                );
                const data = (await response.json()) as IScryfallFuzzyResponse;

                if ('status' in data) continue;

                cards =
                    data.card_faces && 'image_uris' in data.card_faces[0]
                        ? data.card_faces
                        : [data];
            }

            const images = cards.map(
                (card) => card.image_uris.normal ?? fallbackImage
            );
            if (useBack) images.shift();

            ctx.replyWithText(`[\\.](${images[0] ?? cardBack})`);

            if (waitCounter > 0) {
                waitCounter -= 1;
                await setTimeout(SCRYFALL_RATELIMIT_DELAY);
            }
        }
    })
    .ignoreChat(ChatId.GenshinChat)
    .build();
