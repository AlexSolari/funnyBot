const TriggerBuilder = require('../../helpers/triggerBuilder');
const formatDate = require('../../helpers/formatDate');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = new TriggerBuilder("Trigger.Meta")
    .at(17) //17:00 Kiev time
    .do((api, chatId) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=pioneer&tournament_search%5Bdate_range%5D=${formatDate(yesterday)}+-+${formatDate(today)}&commit=Search`)
            .then(x => x.text())
            .then(x => {
                let result = '';
                const $ = cheerio.load(x);
                const $links = $('.table-responsive td a').toArray();
                $links.forEach(link => {
                    result += `${link.children[0].data} - https://www.mtggoldfish.com${link.attribs.href}\n`;
                });
                return result;
            })
            .then(parsedData => {
                if (!parsedData)
                    return;
                    
                api.send(`⚔️ Свежие турики ⚔️\n\n${parsedData}`, chatId, false);
            });
    })
    .build();