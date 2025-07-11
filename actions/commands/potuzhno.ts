import PotuzhnoState from '../../entities/potuzhnoState';
import {
    CommandActionBuilderWithState,
    Hours,
    hoursToSeconds,
    MessageType
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(MessageType.Any)
    .when(
        (ctx) =>
            Math.random() < 0.01 && ctx.messageInfo.text != 'топ потужності'
    )
    .do(async (ctx, state) => {
        const superPotuzhno = Math.random() < 0.01;
        const scoredPoints = superPotuzhno
            ? PotuzhnoState.superChargeMultiplier * state.superCharge
            : 1;

        const scoreFromLegacyBoard = state.scoreBoard[ctx.userInfo.name];
        const scoreFromIdBoard = state.idScoreBoard[ctx.userInfo.id!];

        state.idScoreBoard[ctx.userInfo.id!] =
            (scoreFromIdBoard ?? scoreFromLegacyBoard ?? 0) + scoredPoints;

        if (state.scoreBoard[ctx.userInfo.name]) {
            delete state.scoreBoard[ctx.userInfo.name];
        }

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
    .ratelimit(1)
    .cooldown(hoursToSeconds(4 as Hours))
    .build();
