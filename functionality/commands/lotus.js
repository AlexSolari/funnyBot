import CommandBuilder from '../../helpers/builders/commandBuilder.js';
import randomInteger from '../../helpers/randomInt.js';
import { lvivChat, pauperChat } from '../../helpers/chatIds.js';

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
    .ignoreChat(pauperChat)
    .cooldown(7200)
    .build();