import PotuzhnoState from '../../entities/potuzhnoState';
import {
    CommandActionBuilderWithState,
    Hours,
    MessageType
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(MessageType.Text)
    .when((ctx) => Math.random() < 0.01 && ctx.messageText != 'топ потужності')
    .do(async (ctx, state) => {
        const superPotuzhno = Math.random() < 0.01;
        const scoredPoints = superPotuzhno
            ? PotuzhnoState.superChargeMultiplier * state.superCharge
            : 1;

        state.scoreBoard[ctx.fromUserName] =
            (state.scoreBoard[ctx.fromUserName] ?? 0) + scoredPoints;

        ctx.react('🎉');
        if (superPotuzhno) {
            ctx.replyWithText(
                `🎉😳😳😳😳😳😳😳🎉\n💪 СУПЕР ПОТУЖНО \\+${scoredPoints} 💪\n🎉😳😳😳😳😳😳😳🎉`
            );
            state.superCharge += 1;
        } else {
            if (Math.random() < 0.2) {
                ctx.replyWithVideo('potuzhno');
            } else {
                ctx.replyWithText('Потужно 💪');
            }
        }
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(4 as Hours))
    .build();
