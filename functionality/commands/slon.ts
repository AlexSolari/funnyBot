import CommandBuilder from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Slon")
    .on(/слон/i)
    .do(async (ctx) => {
        ctx.replyWithVideo("slon");
    })
    .ignoreChat(ChatId.PauperChat)
    .cooldown(7200)
    .build();