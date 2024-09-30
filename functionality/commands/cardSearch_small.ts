import { IScryfallCardInfo } from '../../types/externalApiDefinitions/scryfall';
import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';

function getCardText(card: IScryfallCardInfo, fallback: { normal: string }) {
    const images = card.image_uris ?? fallback;

    if (images)
        return `${images.normal}`;

    return card.oracle_text;
}

export default new CommandActionBuilder("Reaction.CardSearch_Small")
    .on(/\[(.+)\]/i)
    .when(async (ctx) => !ctx.messageText.includes('[['))
    .do(async (ctx) => {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult![1]}`)
        const data = await response.json();

        if (data.status == 404)
            return;

        const cards: IScryfallCardInfo[] = data.card_faces
            ? data.card_faces
            : [data];
        const images = cards.map(x => getCardText(x, data.image_uris));

        ctx.replyWithText(`[\\.](${images[0]})`);
    })
    .build();