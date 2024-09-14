import PotuzhnoState from '../../entities/states/potuzhnoState.js';
import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { pauperChat } from '../../helpers/chatIds.js';
import randomInteger from '../../helpers/randomInt.js';

export default new CommandBuilder("Reaction.Potuzhno")
    .withState(PotuzhnoState)
    .on(/.+/i)
    .when((ctx) => randomInteger(0, 99) == 0 && ctx.messageText != 'топ потужності')
    .do(async (ctx) => {
        ctx.updateState(
            /** @param {PotuzhnoState} state */
            state => {
                state.scoreBoard[ctx.fromUserName] = (state.scoreBoard[ctx.fromUserName] ?? 0) + 1;
            }
        );

        ctx.replyWithText("Потужно 💪");
    })
    .ignoreChat(pauperChat)
    .cooldown(14400)
    .build();