import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do(async (ctx) => {
        ctx.replyWithImage("kalitas");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .disabled()
    .build();