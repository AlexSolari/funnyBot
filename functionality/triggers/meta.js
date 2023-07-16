const TriggerBuilder = require('../../helpers/triggerBuilder');
const formatDate = require('../../helpers/formatDate');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const chatIds = require('../../helpers/chatIds');

module.exports = new TriggerBuilder("Trigger.Meta")
    .at(20) //20:00 Kiev time
    .do(async (ctx) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let formatName = '';
        switch (ctx.chatId) {
            case chatIds.pioneerChat:
                formatName = 'pioneer';
                break;
            case chatIds.modernChat:
                formatName = 'modern';
                break;
            default:
                return;
        }

        const response = await fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${formatDate(yesterday)}+-+${formatDate(today)}&commit=Search`)
        const text = await response.text();
        const $ = cheerio.load(text);
        const $links = $('.table-responsive td a').toArray();
        const parsedData = $links
            .map(link => `${link.children[0].data} - https://www.mtggoldfish.com${link.attribs.href}`)
            .join('\n');

        if (!parsedData)
            return;

        ctx.send(`⚔️ Свежие турики ⚔️\n\n${parsedData}`);
    })
    .build();