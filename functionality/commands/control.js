import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat, pauperChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Control")
    .on(/контроль/i)
    .do((ctx) => {
        ctx.replyWithImage("control");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .ignoreChat(pauperChat)
    .disabled()
    .build();