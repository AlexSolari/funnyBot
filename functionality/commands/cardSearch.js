const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.CardSearch")
    .on(/\[\[(.+)\]\]/i)
    .do(async (ctx) => {
        function getCardText(card){
            return `${card.name}   ${card.mana_cost.replaceAll(/[{}]/gi, '')}\n\n`
            + `${card.image_uris.normal}\n\n`
            + `${card.type_line}\n\n`
            + card.oracle_text;
        }

        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const json = await response.text();
        const data = JSON.parse(json);

        if (data.status == 404)
            return;

        const cards = data.card_faces 
            ? data.card_faces
            : [data];
        const text = cards.map(x => getCardText(x)).join('\n\n➡️➡️➡️➡️➡️⤵️\n\n');

        ctx.reply(text);
    })
    .cooldown(0)
    .build();