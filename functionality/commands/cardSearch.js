import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import escapeMarkdown from '../../helpers/escapeMarkdown.js';

function getCardText(card, fallback) {
    const images = card.image_uris ?? fallback;

    return `${card.name}   ${card.mana_cost.replaceAll(/[{}]/gi, '')}\n\n`
        + `${images.normal}\n\n`
        + `${card.type_line}\n\n`
        + card.oracle_text;
}

export default new CommandBuilder("Reaction.CardSearch")
    .on(/\[\[(.+)\]\]/i)
    .do(async (ctx) => {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const data = await response.json();

        if (data.status == 404)
            return;

        const cards = data.card_faces
            ? data.card_faces
            : [data];
        const text = cards.map(x => getCardText(x, data.image_uris)).join('\n\n➡️➡️➡️➡️➡️⤵️\n\n');

        ctx.replyWithText(escapeMarkdown(text));
    })
    .cooldown(0)
    .build();