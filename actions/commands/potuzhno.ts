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

        const scoreFromLegacyBoard = state.scoreBoard[ctx.fromUserName];
        const scoreFromIdBoard = state.idScoreBoard[ctx.fromUserId!];

        state.idScoreBoard[ctx.fromUserId!] =
            (scoreFromIdBoard ?? scoreFromLegacyBoard ?? 0) + scoredPoints;

        ctx.reply.withReaction('🎉');
        if (superPotuzhno) {
            ctx.reply.withText(
                `🎉😳😳😳😳😳😳😳🎉\n💪 СУПЕР ПОТУЖНО \\+${scoredPoints} 💪\n🎉😳😳😳😳😳😳😳🎉`
            );
            state.superCharge += 1;
        } else {
            if (Math.random() < 0.2) {
                ctx.reply.withVideo('potuzhno');
            } else {
                ctx.reply.withText('Потужно 💪');
            }
        }
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(hoursToSeconds(4 as Hours))
    .build();
