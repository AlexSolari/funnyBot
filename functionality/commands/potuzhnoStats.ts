import { CommandActionBuilder } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import PotuzhnoState from '../../entities/potuzhnoState';

export default new CommandActionBuilder('Reaction.PotuzhnoStats')
    .on('топ потужності')
    .do(async (ctx) => {
        const loadedState = await ctx.loadStateOf<PotuzhnoState>(
            'Reaction.Potuzhno'
        );
        const scoreBoard = loadedState.scoreBoard ?? {};
        const superChargeCount = loadedState.superCharge ?? 1;
        const allEntries = [];
        for (const [key, value] of Object.entries(scoreBoard)) {
            allEntries.push({ key, value });
        }

        const topTen = allEntries
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map((x) => `${x.key} - ${x.value} Ватт`)
            .join('\n');

        ctx.replyWithText(
            escapeMarkdown(
                `💪 TOП-10 потужності: 💪 \n\n${topTen}\n\nНаступна суперпотужність зарядженна на ${
                    superChargeCount * PotuzhnoState.superChargeMultiplier
                } Ватт`
            )
        );
    })
    .ignoreChat(ChatId.PauperChat)
    .build();
