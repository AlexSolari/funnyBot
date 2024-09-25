import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';
import randomInteger from '../../helpers/randomInt';
import { SpecificUsers } from '../../helpers/userIds';

export default new CommandActionBuilder("Reaction.Ternopil")
    .on(/.+/i)
    .from([SpecificUsers.pontiff, SpecificUsers.trigan, SpecificUsers.zohan])
    .when(async (ctx) => ctx.chatId == ChatId.LvivChat)
    .do(async (ctx) => {
        if (randomInteger(0, 1) == 0) {
            ctx.replyWithImage("ternopil");
        }
        else {
            switch (randomInteger(0, 3)) {
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
            }
        }
    })
    .cooldown(28800)
    .build();