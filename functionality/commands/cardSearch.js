const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.CardSearch")
    .on(/\[\[(.+)\]\]/i)
    .do(async (ctx) => {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const json = await response.text();
        const data = JSON.parse(json);

        if (data.status == 404)
            return;

        const hasMultipleFaces = !!data.card_faces;
        const card = hasMultipleFaces 
            ? data.card_faces[0]
            : data;
        const oracle = hasMultipleFaces 
            ? data.card_faces.map(x => x.oracle_text).join('\n\n///////////////\n\n')
            : card.oracle_text;
        const cardText = `${card.name}   ${card.mana_cost.replaceAll(/[{}]/gi, '')}\n\n`
            + `${card.image_uris.normal}\n\n`
            + `${card.type_line}\n\n`
            + oracle;

        ctx.reply(cardText);
    })
    .cooldown(0)
    .build();