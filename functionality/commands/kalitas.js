import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Kalitas")
    .on(/калитас/i)
    .do((ctx) => {
        ctx.replyWithImage("kalitas");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .disabled()
    .build();