import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do(async (ctx) => {
        ctx.replyWithImage("kamazGun");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .build();