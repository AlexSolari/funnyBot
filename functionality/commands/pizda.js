import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do((ctx) => {
        ctx.replyWithText("пизда");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .build();