import { CommandActionBuilder, Seconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { load } from 'cheerio';
import escapeMarkdown from '../../helpers/escapeMarkdown';

export default new CommandActionBuilder('Reaction.Banner')
    .on('баннер')
    .when((ctx) => ctx.chatInfo.id == ChatId.GenshinChat)
    .do(async (ctx) => {
        const domain = 'https://genshin-impact.fandom.com';

        const upcomingPage = await fetch(`${domain}/wiki/Wish/List#Upcoming`);
        const upcomingText = await upcomingPage.text();
        const findInUpcomingPageDOM = load(upcomingText);
        const bannerTable = findInUpcomingPageDOM(
            'h3:has(span#Upcoming)+table'
        );
        const bannerUrls = bannerTable
            .find('tr')
            .eq(2)
            .find('td')
            .eq(1)
            .find('a:first-of-type')
            .toArray()
            .map((x) => x.attribs.href);

        for (const bannerUrl of bannerUrls) {
            const bannerPage = await fetch(`${domain}${bannerUrl}`);
            const bannerPageText = await bannerPage.text();
            const findInBannerPageDOM = load(bannerPageText);

            const image = findInBannerPageDOM('a.image-thumbnail').toArray()[0];
            if (image) {
                ctx.replyWithText(`[\\.](${image.attribs.href})`);
                continue;
            }

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
        }
    })
    .cooldown(30 as Seconds)
    .build();
