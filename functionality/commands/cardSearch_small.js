const CommandBuilder = require('../../helpers/commandBuilder');

module.exports = new CommandBuilder("Reaction.CardSearch_Small")
    .on(/\[(.+)\]/i)
    .do(async (ctx) => {
        function getCardText(card, fallback){
            var images = card.image_uris || fallback;
            
            if (images)
                return `${images.normal}`;

            return card.oracle_text;
        }

        if (ctx.text.indexOf('[[') != -1)
            return; 

        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${ctx.matchResult[1]}`)
        const json = await response.text();
        const data = JSON.parse(json);

        if (data.status == 404)
            return;

        const cards = data.card_faces 
            ? data.card_faces
            : [data];
        const images = cards.map(x => getCardText(x, data.image_uris));

        ctx.reply(images[0]);
    })
    .cooldown(0)
    .build();