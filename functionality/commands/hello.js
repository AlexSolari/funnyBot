import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Hello")
    .on("ні")
    .do((ctx) => {
        ctx.replyWithText("hello");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .build();