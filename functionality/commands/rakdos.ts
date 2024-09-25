import { CommandActionBuilder } from '../../helpers/builders/commandActionBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandActionBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do(async (ctx) => {
        ctx.replyWithImage("rakdos");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .disabled()
    .build();