import PotuzhnoState from '../../entities/states/potuzhnoState';
import { CommandActionBuilderWithState } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../types/chatIds';
import randomInteger from '../../helpers/randomInt';
import { hoursToSeconds } from '../../helpers/timeConvertions';
import { Hours } from '../../types/timeValues';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(/.+/i)
    .when(
        async (ctx) =>
            randomInteger(0, 99) == 0 && ctx.messageText != 'топ потужності'
    )
    .do(async (ctx) => {
        const superPotuzhno = randomInteger(0, 99) == 0;
        const scoredPoints = superPotuzhno ? 15 : 1;

        ctx.updateState((state) => {
            state.scoreBoard[ctx.fromUserName] =
                (state.scoreBoard[ctx.fromUserName] ?? 0) + scoredPoints;
        });

        if (superPotuzhno) {
            ctx.replyWithText(
                '🎉😳😳😳😳😳😳🎉\n💪 СУПЕР ПОТУЖНО 💪\n🎉😳😳😳😳😳😳🎉'
            );
        } else {
            if (randomInteger(0, 4) == 0) {
                ctx.replyWithVideo('potuzhno');
            } else {
                ctx.replyWithText('Потужно 💪');
            }
        }
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(4 as Hours))
    .build();
