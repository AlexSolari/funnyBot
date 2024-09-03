import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat, pauperChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do((ctx) => {
        ctx.replyWithImage("rakdos");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .ignoreChat(pauperChat)
    .disabled()
    .build();