import PotuzhnoState from '../../entities/states/potuzhnoState';
import { CommandActionBuilderWithState, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { randomInt } from 'crypto';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(/.+/i)
    .when(
        async (ctx) =>
            randomInt(0, 99) == 0 && ctx.messageText != 'топ потужності'
    )
    .do(async (ctx) => {
        const superPotuzhno = randomInt(0, 99) == 0;
        const scoredPoints = superPotuzhno ? 15 : 1;

        ctx.updateState((state) => {
            state.scoreBoard[ctx.fromUserName] =
                (state.scoreBoard[ctx.fromUserName] ?? 0) + scoredPoints;
        });

        if (superPotuzhno) {
            ctx.replyWithText(
                '🎉😳😳😳😳😳😳😳😳🎉\n💪 СУПЕР ПОТУЖНО 💪\n🎉😳😳😳😳😳😳😳😳🎉'
            );
        } else {
            if (randomInt(0, 4) == 0) {
                ctx.replyWithVideo('potuzhno');
            } else {
                ctx.replyWithText('Потужно 💪');
            }
        }
        ctx.react('🎉');
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(4 as Hours))
    .build();
