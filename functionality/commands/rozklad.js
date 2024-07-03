const CommandBuilder = require('../../helpers/commandBuilder');
const fetch = require('node-fetch');
const chatIds = require('../../helpers/chatIds');
const cheerio = require('cheerio');

module.exports = new CommandBuilder("Reaction.Schedule")
    .on(["розклад"])
    .do(async (ctx) => {
        const response = await fetch(`https://t.me/s/otawaratcg?q=%D1%80%D0%BE%D0%B7%D0%BA%D0%BB%D0%B0%D0%B4`);
        const text = await response.text();

        const $ = cheerio.load(text);        
        const $post = $('.js-widget_message').toArray();
        const link = $post.at(-1).attribs['data-post'];
        
        ctx.replyWithText(`[Розклад на цей тиждень](https://t.me/${link})`);

    })
    .cooldown(30)
    .ignoreChat(chatIds.modernChat)
    .ignoreChat(chatIds.pioneerChat)
    .ignoreChat(chatIds.spellSeeker)
    .build();