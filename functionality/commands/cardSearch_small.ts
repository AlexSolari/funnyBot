import { IScryfallCardInfo } from '../../types/externalApiDefinitions/scryfall';
import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';

function getCardText(card: IScryfallCardInfo, fallback: { normal: string }) {
    const images = card.image_uris ?? fallback;

    if (images) return `${images.normal}`;

    return card.oracle_text;
}

export default new CommandActionBuilder('Reaction.CardSearch_Small')
    .on(/\[([^[]+)\]/gi)
    .when(async (ctx) => !ctx.messageText.includes('[['))
    .do(async (ctx) => {
        for (const matchResult of ctx.matchResults) {
            let images: string[];
            if (matchResult[1].includes('|')) {
                let useBack = false;
                const cardName = matchResult[1].split('|')[0];
                let subquery = matchResult[1].split('|')[1];

                if (subquery == 'flip') {
                    useBack = true;
                    subquery = '';
                }
                const response = await fetch(
                    `https://api.scryfall.com/cards/search?q=${cardName} ${subquery}`
                );
                const data = await response.json();

                if (data.status == 404) continue;

                const firstMatch = data.data[0];

                const cards: IScryfallCardInfo[] = firstMatch.card_faces
                    ? firstMatch.card_faces
                    : [firstMatch];
                images = cards.map((x) =>
                    getCardText(x, firstMatch.image_uris)
                );

                if (useBack) images.shift();
            } else {
                const response = await fetch(
                    `https://api.scryfall.com/cards/named?fuzzy=${matchResult[1]}`
                );
                const data = await response.json();

                if (data.status == 404) continue;

                const cards: IScryfallCardInfo[] = data.card_faces
                    ? data.card_faces
                    : [data];
                images = cards.map((x) => getCardText(x, data.image_uris));
            }

            ctx.replyWithText(
                `[\\.](${
                    images[0] ??
                    'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg'
                })`
            );
        }
    })
    .build();
