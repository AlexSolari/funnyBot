import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Black")
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.replyWithImage("monoB");
    })
    .ignoreChat(ChatId.LvivChat)
    .cooldown(7200)
    .disabled()
    .build();