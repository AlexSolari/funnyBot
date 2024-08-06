import CommandBuilder from '../../helpers/builders/commandBuilder.js';

function getCardText(card, fallback) {
    const images = card.image_uris ?? fallback;

    if (images)
        return `${images.normal}`;

    return card.oracle_text;
}

export default new CommandBuilder("Reaction.CardSearch_Small")
    .on(/\[(.+)\]/i)
    .when((ctx) => ctx.messageText.indexOf('[[') == -1)
    .do(async (ctx) => {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const data = await response.json();

        if (data.status == 404)
            return;

        const cards = data.card_faces
            ? data.card_faces
            : [data];
        const images = cards.map(x => getCardText(x, data.image_uris));

        ctx.replyWithText(`[\\.](${images[0]})`);
    })
    .cooldown(0)
    .build();