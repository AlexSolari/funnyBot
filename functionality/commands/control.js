import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Control")
    .on(/контроль/i)
    .do((ctx) => {
        ctx.replyWithImage("control");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .disabled()
    .build();