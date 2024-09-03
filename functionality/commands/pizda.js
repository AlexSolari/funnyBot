import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat, pauperChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do((ctx) => {
        ctx.replyWithText("пизда");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .ignoreChat(pauperChat)
    .build();