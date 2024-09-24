import PotuzhnoState from '../../entities/states/potuzhnoState';
import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import escapeMarkdown from '../../helpers/escapeMarkdown';

export default new CommandBuilder("Reaction.PotuzhnoStats")
    .on('топ потужності')
    .do(async (ctx) => {
        const scoreBoard = (await ctx.loadStateOf<PotuzhnoState>('Reaction.Potuzhno')).scoreBoard;
        const allEnties = [];
        for (const [key, value] of Object.entries(scoreBoard)) {
            allEnties.push({ key, value });
        }

        const topTen = allEnties
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map(x => `${x.key} - ${x.value} Ватт`)
            .join('\n');

        ctx.replyWithText(escapeMarkdown(`💪 TOП-10 потужності: 💪 \n\n` + topTen));
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(0)
    .build();