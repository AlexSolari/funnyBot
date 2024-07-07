import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Ihor")
    .on(/мод[еє]рн/i)
    .do(async (ctx) => {
        if (ctx.fromUserId != 381992977 || ctx.chatId != lvivChat) {
            ctx.startCooldown = false;
            return;
        }

        ctx.replyWithImage("ihor");
    })
    .cooldown(7200)
    .build();