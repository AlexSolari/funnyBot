import PotuzhnoState from '../../state/potuzhnoState';
import {
    ICaptureController,
    MessageType,
    Seconds,
    secondsToMilliseconds
} from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import { getAbortControllerWithTimeout } from '../../helpers/abortControllerWithTimeout';
import { CommandBuilderWithState } from '../../helpers/commandBuilder';

export const potuzhno = new CommandBuilderWithState<PotuzhnoState>(
    'Reaction.Potuzhno',
    PotuzhnoState
)
    .on(MessageType.Any)
    .when(
        (ctx) =>
            ctx.userInfo.id != null &&
            Math.random() < 0.01 &&
            ctx.messageInfo.text != 'топ потужності'
    )
    .do(async (ctx, state) => {
        const superPotuzhno = Math.random() < 0.01;
        const scoredPoints = superPotuzhno
            ? PotuzhnoState.superChargeMultiplier * state.superCharge
            : 1;

        const scoreFromIdBoard = state.idScoreBoard[ctx.userInfo.id!];

        state.idScoreBoard[ctx.userInfo.id!] =
            (scoreFromIdBoard ?? 0) + scoredPoints;

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

        captureController.captureReplies(
            [/дякую/gi],
            async (replyCtx) => {
                switch (randomInt(0, 4)) {
                    case 0:
                        replyCtx.reply.withText(
                            `Завжди радий бачити вас щасливими\\!`
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
            getAbortControllerWithTimeout(secondsToMilliseconds(30 as Seconds))
                .controller
        );
    })
    .withRatelimit(1)
    .build();
