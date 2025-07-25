import {
    CommandActionBuilder,
    MessageType,
    Seconds,
    secondsToMilliseconds
} from 'chz-telegram-bot';
import { randomInt } from '../../helpers/randomInt';
import escapeMarkdown from '../../helpers/escapeMarkdown';
import { configuration } from '../../helpers/getFeatures';

export const ternopil = new CommandActionBuilder('Reaction.Ternopil')
    .on(MessageType.Any)
    .do(async (ctx) => {
        switch (randomInt(0, 4)) {
            case 0:
                switch (randomInt(0, 4)) {
                    case 0:
                        ctx.reply.withVideo('ternopil');
                        break;
                    case 1:
                        ctx.reply.withVideo('ternopil');
                        ctx.wait(secondsToMilliseconds(10 as Seconds));
                        ctx.reply.withVideo('noternopil');
                        break;
                    default:
                        ctx.reply.withImage('ternopil');
                        break;
                }
                break;
            case 1:
                if (randomInt(0, 5) == 0) {
                    ctx.wait(secondsToMilliseconds(5 as Seconds));
                    ctx.reply.withText('Добре, цього разу без кібербулінгу');

                    if (randomInt(0, 1) == 1) {
                        ctx.wait(secondsToMilliseconds(5 as Seconds));
                        ctx.reply.withText('SIKE');
                        ctx.reply.withImage('lolcat');
                    }

                    return;
                }

                switch (randomInt(0, 2)) {
                    case 0:
                        ctx.reply.withText('В респонс');
                        ctx.reply.withImage('silence');
                        break;
                    case 1:
                        ctx.reply.withText(
                            escapeMarkdown('краще б в церкву сходив...')
                        );
                        break;
                    default:
                        ctx.reply.withVideo('nowords');
                        break;
                }
                break;
            default:
                switch (randomInt(0, 10)) {
                    case 0:
                        ctx.reply.withText('🫵🤣');
                        break;
                    case 1:
                        ctx.reply.withText('👀');
                        break;
                    case 2:
                        ctx.reply.withText('🙃');
                        break;
                    case 3:
                        ctx.reply.withText('😃👉🚪');
                        break;
                    case 4:
                        ctx.reply.withText('🤫🧏‍♂️🤫');
                        break;
                    case 5:
                        ctx.reply.withReaction('🤯');
                        break;
                    case 6:
                        ctx.reply.withReaction('👍');
                        break;
                    case 7:
                        ctx.reply.withReaction('💅');
                        break;
                    default:
                        ctx.skipCooldown();
                        break;
                }
                break;
        }
    })
    .withConfiguration(configuration)
    .build();
