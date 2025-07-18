import PotuzhnoState from '../../entities/potuzhnoState';
import {
    CommandActionBuilderWithState,
    Hours,
    hoursToSeconds,
    ICaptureController,
    MessageType,
    Seconds,
    secondsToMilliseconds
} from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    () => new PotuzhnoState()
)
    .on(MessageType.Any)
    .notIn([ChatId.PauperChat])
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
        const scoreFromIdBoard = state.idScoreBoard[ctx.userInfo.id];

        state.idScoreBoard[ctx.userInfo.id] =
            (scoreFromIdBoard ?? scoreFromLegacyBoard ?? 0) + scoredPoints;

        if (state.scoreBoard[ctx.userInfo.name]) {
            delete state.scoreBoard[ctx.userInfo.name];
        }

        ctx.reply.withReaction('🎉');

        let captureController: ICaptureController;
        if (superPotuzhno) {
            captureController = ctx.reply.withText(
                `🎉😳😳😳😳😳😳😳🎉\n💪 СУПЕР ПОТУЖНО \\+${scoredPoints} 💪\n🎉😳😳😳😳😳😳😳🎉`
            );
            state.superCharge += 1;
        } else if (Math.random() < 0.2) {
            captureController = ctx.reply.withVideo('potuzhno');
        } else {
            captureController = ctx.reply.withText('Потужно 💪');
        }

        const abortController = new AbortController();
        captureController.captureReplies(
            [/дякую/gi],
            async (replyCtx) => {
                switch (randomInt(0, 4)) {
                    case 0:
                        replyCtx.reply.withText(
                            'Завжди радий бачити вас щасливими\\!'
                        );
                        break;
                    case 1:
                        replyCtx.reply.withText('Не варто подяки, це дрібниця');
                        break;
                    case 2:
                        replyCtx.reply.withText('Завжди до ваших послуг');
                        break;
                    case 3:
                        replyCtx.reply.withText('Нема за що');
                        break;
                    case 4:
                        replyCtx.reply.withReaction('😘');
                        break;
                }
                replyCtx.stopCapture();
            },
            abortController
        );
        setTimeout(() => {
            abortController.abort();
        }, secondsToMilliseconds(30 as Seconds));
    })
    .withRatelimit(1)
    .withCooldown({ seconds: hoursToSeconds(4 as Hours) })
    .build();
