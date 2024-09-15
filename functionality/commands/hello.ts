import CommandBuilder from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Hello")
    .on("ні")
    .do(async (ctx) => {
        ctx.replyWithText("hello");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .build();