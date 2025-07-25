import { CommandActionBuilder } from 'chz-telegram-bot';
import { load } from 'cheerio';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { featureSetConfiguration } from '../../helpers/getFeatures';

function chuckBanners(input: string[]) {
    const result: { version: string; links: string[] }[] = [];
    let currentChunk: { version: string; links: string[] } | null = null;

    input.forEach((item) => {
        if (item.startsWith('Version ')) {
            if (currentChunk) result.push(currentChunk);

            currentChunk = {
                version: item,
                links: []
            };
        } else {
            currentChunk ??= {
                version: 'некст патче',
                links: []
            };
            currentChunk.links.push(item);
        }
    });

    // Push the last chunk if exists
    if (currentChunk) result.push(currentChunk);

    return result;
}

export const banner = new CommandActionBuilder('Reaction.Banner')
    .on('баннер')
    .do(async (ctx) => {
        const domain = 'https://genshin-impact.fandom.com';

        const upcomingPage = await fetch(`${domain}/wiki/Wish/List#Upcoming`);
        const upcomingText = await upcomingPage.text();
        const findInUpcomingPageDOM = load(upcomingText);
        const bannerTable = findInUpcomingPageDOM(
            'h3:has(span#Upcoming)+table'
        );
        const bannerUrls = [
            ...new Set(
                bannerTable
                    .find(
                        'tr:has(a[title="Character Event Wish"]) td:nth-of-type(2) a:first-of-type, th[colspan]'
                    )
                    .toArray()
                    .map((x) =>
                        x.name == 'a'
                            ? x.attribs.href
                            : findInUpcomingPageDOM(x).text().trim()
                    )
            )
        ];

        const bannerChunks = chuckBanners(bannerUrls);

        for (const bannerChunk of bannerChunks) {
            for (const link of bannerChunk.links) {
                const bannerPage = await fetch(`${domain}${link}`);
                const bannerPageText = await bannerPage.text();
                const findInBannerPageDOM = load(bannerPageText);

                const image =
                    findInBannerPageDOM('a.image-thumbnail').toArray()[0];
                if (image) {
                    ctx.reply.withText(
                        `[\\${escapeMarkdown(bannerChunk.version)}](${
                            image.attribs.href
                        })`
                    );
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

                ctx.reply.withText(
                    `Персонажи в ${escapeMarkdown(bannerChunk.version)}:\n\n` +
                        characterInfos
                            .map(
                                (x) => `[${escapeMarkdown(x.name)}](${x.link})`
                            )
                            .join('\n'),
                    {
                        disableWebPreview: true
                    }
                );
            }
        }
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
