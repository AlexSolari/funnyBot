import CommandBuilder from '../../helpers/commandBuilder.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Kamaz")
    .on(/камаз/i)
    .do((ctx) => {
        ctx.replyWithImage("kamazGun");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .disabled()
    .build();