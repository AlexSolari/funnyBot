import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do(async (ctx) => {
        ctx.replyWithImage("kalitas");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .disabled()
    .build();