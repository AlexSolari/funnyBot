import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Rakdos")
    .on(/(ракдос|рб|бр)(?![a-zA-Z0-9а-яА-Я])/i)
    .do((ctx) => {
        ctx.replyWithImage("rakdos");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .disabled()
    .build();