import { CommandBuilder } from '../../helpers/builders/commandBuilder';
import { ChatId } from '../../helpers/chatIds';

export default new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do(async (ctx) => {
        ctx.replyWithImage("rakdos");
    })
    .cooldown(7200)
    .ignoreChat(ChatId.LvivChat)
    .ignoreChat(ChatId.PauperChat)
    .disabled()
    .build();