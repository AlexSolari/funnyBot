import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';
import userIds from '../../helpers/userIds.js';

export default new CommandBuilder("Reaction.Vitalii")
    .on(/маліфо/i)
    .from(userIds.vitalii)
    .do(async (ctx) => {
        if (ctx.chatId != lvivChat) {
            ctx.startCooldown = false;
            return;
        }

        ctx.replyWithImage("malifo");
    })
    .cooldown(86400)
    .build();