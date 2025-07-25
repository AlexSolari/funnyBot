import { CommandActionBuilder } from 'chz-telegram-bot';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import PotuzhnoState from '../../state/potuzhnoState';
import { nameSave } from './nameSave';
import { potuzhno } from './potuzhno';
import { featureSetConfiguration } from '../../helpers/getFeatures';

export const potuzhnoStats = new CommandActionBuilder('Reaction.PotuzhnoStats')
    .on('топ потужності')
    .do(async (ctx) => {
        const potuzhnoState = await ctx.loadStateOf(potuzhno);
        const namesState = await ctx.loadStateOf(nameSave);

        const legacyScoreBoard = potuzhnoState.scoreBoard ?? {};
        const idScoreBoard = potuzhnoState.idScoreBoard ?? {};
        const superChargeCount = potuzhnoState.superCharge ?? 1;

        const mergedScore: Record<string, number> = {};

        for (const [key, value] of Object.entries(legacyScoreBoard)) {
            mergedScore[key] = value;
        }

        for (const [strId, score] of Object.entries(idScoreBoard)) {
            const name = namesState.lastUsername[parseInt(strId)];

            mergedScore[name] = score;
        }

        const allEntries = Object.entries(mergedScore).map(([key, value]) => {
            return { key, value };
        });

        const topTen = allEntries
            .toSorted((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((x) => `${x.key} - ${x.value} Ватт`)
            .join('\n');

        ctx.reply.withText(
            escapeMarkdown(
                `💪 TOП-10 потужності: 💪 \n\n${topTen}\n\nНаступна суперпотужність зарядженна на ${
                    superChargeCount * PotuzhnoState.superChargeMultiplier
                } Ватт`
            )
        );
    })
    .withConfiguration(() => featureSetConfiguration)
    .build();
