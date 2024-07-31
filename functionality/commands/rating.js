import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Rating")
    .on(/youtube\.com\/watch\?/i)
    .when(() => randomInteger(0, 1) == 0)
    .do((ctx) => {
        ctx.replyWithImage("bad");
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .build();