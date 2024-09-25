import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Hello")
    .on("ні")
    .do(async (ctx) => {
        ctx.replyWithText("hello");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .build();