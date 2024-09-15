import PotuzhnoState from '../../entities/states/potuzhnoState';
import CommandBuilder from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';

export default new CommandBuilder<PotuzhnoState>("Reaction.Potuzhno")
    .withState(() => new PotuzhnoState())
    .on(/.+/i)
    .when(async (ctx) => randomInteger(0, 99) == 0 && ctx.messageText != 'топ потужності')
    .do(async (ctx) => {
        ctx.updateState<PotuzhnoState>(
            state => {
                state.scoreBoard[ctx.fromUserName] = (state.scoreBoard[ctx.fromUserName] ?? 0) + 1;
            }
        );

        ctx.replyWithText("Потужно 💪");
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(14400)
    .build();