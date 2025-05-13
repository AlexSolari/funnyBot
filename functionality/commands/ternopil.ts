import { CommandActionBuilder, Hours, Seconds } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import {
    hoursToSeconds,
    secondsToMilliseconds
} from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Ternopil')
    .on(/.+/i)
    .from([SpecificUsers.pontiff, SpecificUsers.trigan, SpecificUsers.zohan])
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        const rnd = randomInt(0, 4);
        if (rnd == 0) {
            ctx.replyWithImage('ternopil');
        } else if (rnd == 1) {
            ctx.delayNextResponse(secondsToMilliseconds(5 as Seconds));
            ctx.replyWithText('Добре, цього разу без кібербулінгу');
            ctx.delayNextResponse(secondsToMilliseconds(5 as Seconds));
            ctx.replyWithText('SIKE');
            ctx.replyWithImage('lolcat');
        } else {
            switch (randomInt(0, 10)) {
                case 0:
                    ctx.replyWithText('🫵🤣');
                    break;
                case 1:
                    ctx.replyWithText('👀');
                    break;
                case 2:
                    ctx.replyWithText('🙃');
                    break;
                case 3:
                    ctx.replyWithText('😃👉🚪');
                    break;
                case 4:
                    ctx.replyWithText('🤫🧏‍♂️🤫');
                    break;
                case 5:
                    ctx.react('🤯');
                    break;
                case 6:
                    ctx.react('👍');
                    break;
                case 7:
                    ctx.react('💅');
                    break;
                default:
                    ctx.startCooldown = false;
                    break;
            }
        }
    })
    .cooldown(hoursToSeconds(8 as Hours))
    .build();
