import { CommandActionBuilder, Hours, Seconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import {
    hoursToSeconds,
    secondsToMilliseconds
} from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';
import { randomInt } from '../../helpers/randomInt';
import escapeMarkdown from '../../helpers/escapeMarkdown';

export default new CommandActionBuilder('Reaction.Ternopil')
    .on(/.+/i)
    .from([SpecificUsers.pontiff, SpecificUsers.trigan, SpecificUsers.zohan])
    .when((ctx) => ctx.chatInfo.id == ChatId.LvivChat)
    .do(async (ctx) => {
        const rnd = randomInt(0, 4);
        if (rnd == 0) {
            ctx.reply.withImage('ternopil');
        } else if (rnd == 1) {
            const rnd2 = randomInt(0, 5);
            if (rnd2 == 0) {
                ctx.wait(secondsToMilliseconds(5 as Seconds));
                ctx.reply.withText('Добре, цього разу без кібербулінгу');
                ctx.wait(secondsToMilliseconds(5 as Seconds));
                ctx.reply.withText('SIKE');
                ctx.reply.withImage('lolcat');
            } else {
                const rnd3 = randomInt(0, 2);
                switch (rnd3) {
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
            }
        } else {
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
                    ctx.startCooldown = false;
                    break;
            }
        }
    })
    .cooldown(hoursToSeconds(8 as Hours))
    .build();
