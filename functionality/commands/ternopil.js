import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';
import randomInteger from '../../helpers/randomInt.js';
import userIds from '../../helpers/userIds.js';

export default new CommandBuilder("Reaction.Ternopil")
    .on(/.+/i)
    .from([userIds.pontiff, userIds.trigan, userIds.zohan])
    .do(async (ctx) => {
        if (ctx.chatId != lvivChat) {
            ctx.startCooldown = false;
            return;
        }

        if (randomInteger(0, 1) == 0) {
            ctx.replyWithImage("ternopil");
        }
        else{
            switch (randomInteger(0, 2)) {
                case 0:
                    ctx.replyWithText('🫵🤣');
                    break;
                case 1:
                    ctx.replyWithText('👀');
                    break;
                case 2:
                    ctx.replyWithText('🙃');
                    break;
            }
        }
    })
    .cooldown(12000)
    .build();