import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Slon")
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.replyWithVideo("slon");
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(7200)
    .build();