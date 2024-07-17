import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';
import userIds from '../../helpers/userIds.js';

export default new CommandBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .from(userIds.ihor)
    .do(async (ctx) => {
        if (ctx.chatId != lvivChat) {
            ctx.startCooldown = false;
            return;
        }

        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .disabled()
    .build();