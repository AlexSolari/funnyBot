import CommandBuilder from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Pizda")
    .on("да")
    .do(async (ctx) => {
        ctx.replyWithText("пизда");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();