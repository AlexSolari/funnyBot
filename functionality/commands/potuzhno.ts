import PotuzhnoState from '../../entities/states/potuzhnoState';
import { CommandActionBuilderWithState } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';

export default new CommandActionBuilderWithState<PotuzhnoState>("Reaction.Potuzhno", () => new PotuzhnoState())
    .on(/.+/i)
    .when(async (ctx) => randomInteger(0, 99) == 0 && ctx.messageText != 'топ потужності')
    .do(async (ctx) => {
        ctx.updateState(state => {
            state.scoreBoard[ctx.fromUserName] = (state.scoreBoard[ctx.fromUserName] ?? 0) + 1;
        });

        ctx.replyWithText("Потужно 💪");
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(14400)
    .build();