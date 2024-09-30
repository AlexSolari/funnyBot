import PotuzhnoState from '../../entities/states/potuzhnoState';
import { CommandActionBuilderWithState } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import randomInteger from '../../helpers/randomInt';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

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
    .cooldown(hoursToSeconds(4 as Hours))
    .build();