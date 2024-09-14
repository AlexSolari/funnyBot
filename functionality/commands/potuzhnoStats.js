/** @import PotuzhnoState from '../../entities/states/potuzhnoState.js';*/
import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { pauperChat } from '../../helpers/chatIds.js';
import escapeMarkdown from '../../helpers/escapeMarkdown.js';

export default new CommandBuilder("Reaction.PotuzhnoStats")
    .on('топ потужності')
    .do(async (ctx) => {
            /** @type {PotuzhnoState} */
            const scoreBoard = (await ctx.loadStateOf('Reaction.Potuzhno')).scoreBoard;
            const allEnties = [];
            for (const [key, value] of Object.entries(scoreBoard)) {
                allEnties.push({ key, value });
            }
              
            let topTen = allEnties
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
                .map(x => `${x.key} - ${x.value} Ватт`)
                .join('\n');
            
            ctx.replyWithText(escapeMarkdown(`💪 TOП-10 потужності: 💪 \n\n` + topTen));
    })
    .ignoreChat(pauperChat)
    .cooldown(0)
    .build();