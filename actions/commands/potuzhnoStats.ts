import escapeMarkdown from '../../helpers/escapeMarkdown';
import PotuzhnoState from '../../state/potuzhnoState';
import { nameSave } from './nameSave';
import { potuzhno } from './potuzhno';
import { CommandBuilder } from '../../helpers/commandBuilder';

export const potuzhnoStats = new CommandBuilder('Reaction.PotuzhnoStats')
    .on('топ потужності')
    .do(async (ctx) => {
        const potuzhnoState = ctx.loadStateOf(potuzhno);
        const namesState = ctx.loadStateOf(nameSave);

        const idScoreBoard = potuzhnoState.idScoreBoard ?? {};
        const superChargeCount = potuzhnoState.superCharge ?? 1;

        const allEntries = Object.entries(idScoreBoard).map(
            ([strId, score]) => ({
                key: namesState.lastUsername[Number.parseInt(strId)],
                value: score
            })
        );

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
    .build();
