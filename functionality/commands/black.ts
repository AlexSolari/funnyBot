import CommandBuilder from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Black")
    .on(/моноб/i)
    .do(async (ctx) => {
        ctx.replyWithImage("monoB");
    })
    .ignoreChat(ChatId.LvivChat)
    .cooldown(7200)
    .disabled()
    .build();