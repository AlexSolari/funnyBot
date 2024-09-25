import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Control")
    .on(/контроль/i)
    .do(async (ctx) => {
        ctx.replyWithImage("control");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .disabled()
    .build();