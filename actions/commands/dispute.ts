import { load } from 'cheerio';
import { randomInt } from '../../helpers/randomInt';
import { CommandBuilder } from '../../helpers/commandBuilder';
import { traceFetch } from '../../helpers/fetchWithObservability';
import { getObservability } from '../../helpers/getObservability';

export const dispute = new CommandBuilder('Reaction.Dispute')
    .on(/mtggoldfish\.com\/deck\/(\d+)/i)
    .do(async (ctx) => {
        const deckId = ctx.matchResults[0][1];
        const response = await traceFetch(
            `https://www.mtggoldfish.com/deck/arena_download/${deckId}`,
            getObservability(ctx)
        );
        const text = await response.text();
        const findInDOM = load(text);
        const cards = findInDOM('.copy-paste-box').text();

        const hasOffering = cards.includes('Fanatical Offering');
        const hasEnforcer = cards.includes('Myr Enforcer');

        const isRakdos =
            cards.includes('Mountain') &&
            cards.includes('Swamp') &&
            !cards.includes('Island') &&
            !cards.includes('Plains') &&
            !cards.includes('Forest');

        if (isRakdos) {
            ctx.reply.withText('ми досі про ракдос дрочню?');
        } else if (hasOffering) {
            ctx.reply.withImage(`offering`);
        } else if (hasEnforcer) {
            ctx.reply.withText(
                'ВААААУ! вперше бачу такий набір карт. автор геній!'
            );
        } else if (randomInt(0, 1) == 0) {
            ctx.reply.withReaction('🍌');
        }
    })
    .build();
