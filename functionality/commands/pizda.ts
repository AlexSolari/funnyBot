import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Pizda")
    .on("да")
    .do(async (ctx) => {
        ctx.replyWithText("пизда");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();