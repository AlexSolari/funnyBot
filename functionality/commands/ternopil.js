import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';
import userIds from '../../helpers/userIds.js';

export default new CommandBuilder("Reaction.Ternopil")
    .on(/.+/i)
    .from([userIds.pontiff, userIds.trigan, userIds.zohan])
    .do(async (ctx) => {
        if (ctx.chatId != lvivChat) {
            ctx.startCooldown = false;
            return;
        }

        ctx.replyWithImage("ternopil");
    })
    .cooldown(43200)
    .build();