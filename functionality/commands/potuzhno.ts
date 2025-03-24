import PotuzhnoState from '../../entities/potuzhnoState';
import { CommandActionBuilderWithState, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(/.+/i)
    .when(
        async (ctx) =>
            Math.random() < 0.01 && ctx.messageText != 'топ потужності'
    )
    .do(async (ctx) => {
        const superPotuzhno = Math.random() < 0.01;
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
            if (Math.random() < 0.2) {
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
