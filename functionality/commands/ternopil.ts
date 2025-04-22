import { CommandActionBuilder, Hours } from 'chz-telegram-bot';
import { ChatId } from '../../types/chatIds';
import { hoursToSeconds } from 'chz-telegram-bot/dist/helpers/timeConvertions';
import { SpecificUsers } from '../../types/userIds';
import { randomInt } from '../../helpers/randomInt';

export default new CommandActionBuilder('Reaction.Ternopil')
    .on(/.+/i)
    .from([SpecificUsers.pontiff, SpecificUsers.trigan, SpecificUsers.zohan])
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        if (randomInt(0, 2) == 0) {
            ctx.replyWithImage('ternopil');
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
