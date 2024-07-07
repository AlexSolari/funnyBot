import CommandBuilder from '../../helpers/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat } from '../../helpers/chatIds.js';

export default new CommandBuilder("Reaction.Lotus")
    .on(/лотус/i)
    .do((ctx) => {
        let imageName = randomInteger(0, 1)
            ? "dampingSphere_funny"
            : "dampingSphere";

        if (imageName == "dampingSphere_funny") {
            imageName += randomInteger(1, 3);
        }

        ctx.replyWithImage(imageName);
    })
    .ignoreChat(lvivChat)
    .cooldown(7200)
    .build();