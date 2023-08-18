const TriggerBuilder = require('../../helpers/triggerBuilder');
const formatDate = require('../../helpers/formatDate');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const chatIds = require('../../helpers/chatIds');

module.exports = new TriggerBuilder("Trigger.Meta")
    .at(20) //20:00 Kiev time
    .do(async (ctx) => {
        const loadTournaments = async function (formatName) {
            const response = await fetch(`https://www.mtggoldfish.com/tournament_searches/create?utf8=%E2%9C%93&tournament_search%5Bname%5D=&tournament_search%5Bformat%5D=${formatName}&tournament_search%5Bdate_range%5D=${formatDate(yesterday)}+-+${formatDate(today)}&commit=Search`)
            const text = await response.text();
            const $ = cheerio.load(text);
            const $links = $('.table-responsive td a').toArray();
            const parsedData = $links
                .map(link => `${link.children[0].data} - https://www.mtggoldfish.com${link.attribs.href}`)
                .join('\n');

            return parsedData || "";
        }

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let tournaments = [];
        switch (ctx.chatId) {
            case chatIds.pioneerChat:
                tournaments = await loadTournaments('pioneer');

                if (tournaments.length > 0){
                    ctx.send(`⚔️ Свежие турики ⚔️\n\n${tournaments}`);
                }
                break;
            case chatIds.modernChat:
                tournaments = await loadTournaments('modern');
                
                if (tournaments.length > 0){
                    ctx.send(`⚔️ Свежие турики ⚔️\n\n${tournaments}`);
                }

                break;
            case chatIds.lvivChat:
                const pioneerTournaments = await loadTournaments('pioneer');
                const modernTournaments = await loadTournaments('modern');

                if (pioneerTournaments.length > 0 && modernTournaments.length > 0){
                    ctx.send(`⚔️ Свіжі турніри ⚔️\n\n Модерн: \n\n${modernTournaments}\n\n Піонер: \n\n${pioneerTournaments}`);
                }
                else{
                    if (pioneerTournaments.length > 0){
                        ctx.send(`⚔️ Свіжі турніри ⚔️\n\n Піонер: \n\n${pioneerTournaments}`);
                    }
                    else if (modernTournaments.length > 0){
                        ctx.send(`⚔️ Свіжі турніри ⚔️\n\n Модерн: \n\n${modernTournaments}`);
                    }
                }
            default:
                return;
        }
    })
    .build();