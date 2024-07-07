import CommandBuilder from '../../helpers/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Rating")
    .on(/youtube\.com\/watch\?/i)
    .do((ctx) => {
        if (randomInteger(0, 1) == 0) {
            ctx.replyWithImage("bad");
        }
    })
    .cooldown(7200)
    .ignoreChat(lvivChat)
    .build();