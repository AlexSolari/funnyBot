import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Black")
    .on(/моноб/i)
    .do((ctx) => {
        ctx.replyWithImage("monoB");
    })
    .ignoreChat(lvivChat)
    .cooldown(7200)
    .disabled()
    .build();