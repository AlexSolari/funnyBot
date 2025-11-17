import { CommandBuilder } from '../../helpers/commandBuilder';
import coinsInfo from '../../content/spellcoins.json';
import { load } from 'cheerio';

export const spellcoins = new CommandBuilder('Reaction.Spellcoins')
    .on('баланс')
    .when((ctx) => ctx.chatInfo.name == 'DM')
    .do(async (ctx) => {
        const response = await fetch(coinsInfo.url);
        const page = await response.text();

        const findInPage = load(page);
        const rows = findInPage('tr').toArray();

        for (const row of rows) {
            const cells = load(row)('td').toArray();
            const cellValues = cells.map((x) => load(x).text().trim());
            if (!cellValues[0]?.length || cellValues.length < 2) continue;

            const [name, balanceString] = cellValues;

            const nameIdLookup = coinsInfo.names as Record<string, number>;
            if (nameIdLookup[name] && ctx.userInfo.id == nameIdLookup[name]) {
                ctx.reply.withText(
                    `Поточний баланс: ${balanceString} спеллкоїнів`
                );

                return;
            }
        }

        ctx.reply.withText(
            `Нажаль інформацію отримати не вдалось, зверніться до адміністрації`
        );
    })
    .build();
