const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.CardSearch")
    .on(/\[\[(.+)\]\]/i)
    .do(async (ctx) => {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const json = await response.text();
        const data = JSON.parse(json);

        if (data.status == 404)
            return;

        const cardText = `${data.name}   ${data.mana_cost.replaceAll(/[{}]/gi, '')}\n\n`
            + `${data.image_uris.normal}\n\n`
            + `${data.type_line}\n\n`
            + data.oracle_text;

        ctx.reply(cardText);
    })
    .cooldown(0)
    .build();