import { CommandActionBuilder, Seconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { load } from 'cheerio';
import escapeMarkdown from '../../helpers/escapeMarkdown';

export default new CommandActionBuilder('Reaction.Banner')
    .on('баннер')
    .do(async (ctx) => {
        const domain = 'https://genshin-impact.fandom.com';

        const upcomingPage = await fetch(`${domain}/wiki/Wish/List#Upcoming`);
        const upcomingText = await upcomingPage.text();
        const findInUpcomingPageDOM = load(upcomingText);
        const bannerTable = findInUpcomingPageDOM(
            'h3:has(span#Upcoming)+table'
        );
        const bannerUrl = bannerTable
            .find('tr')
            .eq(2)
            .find('td')
            .eq(1)
            .find('a')
            .attr('href');

        const bannerPage = await fetch(`${domain}${bannerUrl}`);
        const bannerPageText = await bannerPage.text();
        const findInBannerPageDOM = load(bannerPageText);
        const characterCards = findInBannerPageDOM(
            '.wish-pool-table:first-of-type'
        )
            .find('td')
            .find('.card-caption')
            .find('a');
        const characterInfos = characterCards.toArray().map((x) => ({
            name: x.attribs.title,
            link: domain + x.attribs.href
        }));

        ctx.replyWithText(
            'Персонажи в некст баннере:\n\n' +
                characterInfos
                    .map((x) => `[${escapeMarkdown(x.name)}](${x.link})`)
                    .join('\n'),
            {
                disableWebPreview: true
            }
        );
    })
    .cooldown(30 as Seconds)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .ignoreChat(ChatId.FrankivskChat)
    .ignoreChat(ChatId.FnmChat)
    .build();
